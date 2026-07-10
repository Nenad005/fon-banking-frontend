import { create as axiosCreate, isAxiosError } from "axios";
import * as SecureStore from "expo-secure-store";
import * as Application from 'expo-application';
import * as Device from 'expo-device';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const DEVICE_ID_KEY = "fon_bank_device_id";
const PIN_SETUP_KEY = 'pin_is_setup';

type ApiStatus = "success" | "error";
type UserStatus = "pending_activation" | "pending_pin" | "active" | "blocked";

interface ActivateData {
  user_status: UserStatus;
  message: string;
}

interface AuthData {
  status: ApiStatus;
  message: string;
  token: string;
}

type ActivateResponse = ActivateData;
type AuthResponse = AuthData;
type LogoutResponse = {
  status: ApiStatus;
  message: string;
};

interface ApiErrorResponse {
  message?: string;
  status?: ApiStatus;
  data?: null;
  errors?: Record<string, string[]> | null;
}

type AuthStatus = 'error' | 'loading' | 'pending_activation' | 'pending_pin' | 'pending_session' | 'authenticated';

interface AuthContextType {
  authStatus: AuthStatus;
  isError: boolean;
  isLoading: boolean;
  isActivated: boolean;
  isRegistered: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  activateAccount: (qrCodeData: string) => Promise<ActivateResponse>;
  setupPin: (pin: string) => Promise<AuthResponse>;
  login: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
  clearSecureStore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const api = axiosCreate({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const createDeviceIdentifier = async () => {
  if (Platform.OS === 'android') return Application.getAndroidId();
  if (Platform.OS === 'ios') {
    let iosId = await Application.getIosIdForVendorAsync();
    if (iosId === null) return globalThis.crypto?.randomUUID();
    return iosId
  }
  else {
    return globalThis.crypto?.randomUUID();
  }
};

const getDeviceName = () => {
  return Device.deviceName ?? 'Unknown Device'
};

const getApiErrorMessage = (error: unknown) => {
  if (isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    const firstValidationError = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined;

    return firstValidationError ?? data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Došlo je do neočekivane greške.";
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const isError = authStatus === 'error';
  const isLoading = authStatus === 'loading';
  const isActivated = authStatus === 'pending_pin' || authStatus === 'pending_session';
  const isRegistered = authStatus === 'pending_session';
  const isAuthenticated = authStatus === 'authenticated';

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const [deviceId, isPinSetup] = await Promise.all([
          SecureStore.getItemAsync(DEVICE_ID_KEY),
          SecureStore.getItemAsync(PIN_SETUP_KEY)
        ]);

        if (!deviceId) {
          setAuthStatus('pending_activation');
        } else if (deviceId && !isPinSetup) {
          setAuthStatus('pending_pin');
        } else {
          setAuthStatus('pending_session');
        }
      } catch (error) {
        console.error('Kritična greška pri čitanju SecureStore-a:', error);
        setAuthStatus('error');
      }
    };

    checkAuthStatus();
  }, []);

  const authContextValue = useMemo<AuthContextType>(() => {
    const getOrCreateDeviceIdentifier = async () => {
      const storedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

      if (storedDeviceId) {
        return storedDeviceId;
      }

      return createDeviceIdentifier();
    };

    const setSession = (authData: AuthData) => {
      setSessionToken(authData.token);
      setAuthStatus('authenticated')
      api.defaults.headers.common.Authorization = `Bearer ${authData.token}`;
    };

    const clearSession = () => {
      setSessionToken(null);
      setAuthStatus('pending_session')
      delete api.defaults.headers.common.Authorization;
    };

    const activateAccount = async (qrCodeData: string): Promise<ActivateResponse> => {
      console.log(authStatus)
      try {
        const deviceIdentifier = await getOrCreateDeviceIdentifier();
        console.log(deviceIdentifier, qrCodeData);
        const response = await api.post<ActivateResponse>("/activate", {
          code: qrCodeData,
          device_identifier: deviceIdentifier,
          device_name: getDeviceName(),
        });
        console.log("request uspesan")

        await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceIdentifier);
        const activateData = response.data;
        console.log("postavio")

        if (activateData.user_status === 'pending_pin') {
          setAuthStatus('pending_pin');
        } else {
          setAuthStatus('pending_session');
        }

        console.log('AKTIVACIJA : ', activateData.user_status, activateData.message)

        return activateData;
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      }
    };

    const setupPin = async (pin: string): Promise<AuthResponse> => {
      try {
        const deviceIdentifier = await SecureStore.getItemAsync(DEVICE_ID_KEY);

        if (!deviceIdentifier) {
          setAuthStatus('pending_activation')
          throw new Error("Uređaj nije aktiviran.");
        }

        const response = await api.post<AuthResponse>("/set_pin", {
          device_identifier: deviceIdentifier,
          pin,
        });

        const sessionData = response.data;

        await SecureStore.setItemAsync(PIN_SETUP_KEY, 'true');
        setSession(sessionData);
        console.log('PIN_SETUP : ', sessionData.status, sessionData.message)

        return sessionData;
      } catch (error) {
        setAuthStatus('pending_pin')
        throw new Error(getApiErrorMessage(error));
      }
    };

    const login = async (pin: string): Promise<boolean> => {
      try {
        const deviceIdentifier = await SecureStore.getItemAsync(DEVICE_ID_KEY);

        if (!deviceIdentifier) {
          setAuthStatus('pending_activation')
          throw new Error("Uređaj nije aktiviran.");
        }

        const response = await api.post<AuthResponse>("/login", {
          device_identifier: deviceIdentifier,
          pin,
        });

        const sessionData = response.data;
        setSession(sessionData);
        console.log('LOGIN : ', sessionData.status, sessionData.message)

        return true;
      } catch (error) {
        clearSession();
        throw new Error(getApiErrorMessage(error));
        // return false;
      }
    };

    const logout = async () => {
      try {
        if (sessionToken) {
          await api.post<LogoutResponse>("/logout");
        }
      } catch (error) {
        throw new Error(getApiErrorMessage(error));
      } finally {
        clearSession();
      }
    };

    const clearSecureStore = async () => {
      try {
        await Promise.all([
          SecureStore.deleteItemAsync(DEVICE_ID_KEY),
          SecureStore.deleteItemAsync(PIN_SETUP_KEY),
        ]);
      } catch (error) {
        console.error("Greška pri brisanju SecureStore-a:", getApiErrorMessage(error));
      } finally {
        setSessionToken(null);
        setAuthStatus('pending_activation');
        delete api.defaults.headers.common.Authorization;
      }
    };

    return {
      authStatus,
      isError,
      isLoading,
      isActivated,
      isRegistered,
      isAuthenticated,
      sessionToken,
      activateAccount,
      setupPin,
      login,
      logout,
      clearSecureStore,
    };
  }, [authStatus, isError, isLoading, isActivated, isRegistered, isAuthenticated, sessionToken]);

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth mora biti korišćen unutar AuthProvider-a");
  }

  return context;
};
