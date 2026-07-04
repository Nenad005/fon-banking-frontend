import axios, {create as axiosCreate, isAxiosError} from "axios";
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
import { isEnabled } from "react-native/Libraries/Performance/Systrace";

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

const DEVICE_ID_KEY = "fon_bank_device_id";
const PIN_SETUP_KEY = 'pin_is_setup';

type ApiStatus = "success" | "error";
type UserStatus = "pending_activation" | "pending_pin" | "active" | "blocked";

type ApiErrors = Record<string, string[]> | null;

interface ApiResponse<TData> {
  status: ApiStatus;
  message: string;
  data: TData | null;
  errors: ApiErrors;
}

interface ActivateData {
  user_status: UserStatus;
  message: string;
}

interface AuthData {
  status: string;
  message: string;
  token: string;
}

type ActivateResponse = ApiResponse<ActivateData>;
type AuthResponse = ApiResponse<AuthData>;

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

const getRequiredResponseData = <TData,>(response: ApiResponse<TData>) => {
  if (!response.data) {
    throw new Error(response.message || "API odgovor ne sadrži podatke.");
  }

  return response.data;
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

    const activateAccount = async ( qrCodeData: string ): Promise<ActivateResponse> => {
      try {
        const deviceIdentifier = await getOrCreateDeviceIdentifier();
        const response = await api.post<ActivateResponse>("/activate", {
          code: qrCodeData,
          device_identifier: deviceIdentifier,
          device_name: getDeviceName(),
        });

        const activateData = getRequiredResponseData(response.data);

        await SecureStore.setItemAsync(DEVICE_ID_KEY, deviceIdentifier);
        const user_status = activateData.user_status;
        if (user_status === 'pending_pin') setAuthStatus('pending_pin');
        else if (user_status === 'active') setAuthStatus('pending_session');
        else setAuthStatus('pending_activation')
        console.log('AKTIVACIJA : ', activateData.user_status, activateData.message)

        return response.data;
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

        const sessionData = getRequiredResponseData(response.data)

        await SecureStore.setItemAsync('pin_is_setup', 'true');
        setSession(sessionData);
        console.log('PIN_SETUP : ', sessionData.status, sessionData.message)

        return response.data;
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

        const sessionData = getRequiredResponseData(response.data)
        setSession(sessionData);
        console.log('LOGIN : ', sessionData.status, sessionData.message)

        return true;
      } catch (error) {
        console.error("Login neuspešan:", getApiErrorMessage(error));
        clearSession();
        return false;
      }
    };

    const logout = async () => {
      try {
        if (sessionToken) {
          await api.post<ApiResponse<null>>("/logout");
        }
      } catch (error) {
        console.error("Greška pri logout-u :", getApiErrorMessage(error));
      } finally {
        clearSession();
      }
    };

    return {
      authStatus,
      isError,
      isLoading,
      isActivated,
      isRegistered,
      isAuthenticated,
      activateAccount,
      setupPin,
      login,
      logout,
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
