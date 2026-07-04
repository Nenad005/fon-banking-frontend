import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api';
const DEVICE_ID_KEY = 'fon_bank_device_id';

interface AuthContextType {
  isActivated: boolean;
  isLoggedIn: boolean;
  isLoading: boolean; // Za Splash screen dok proveravamo SecureStore
  activateAccount: (qrCodeData: string) => Promise<void>;
  setupPin: (pin: string) => Promise<void>;
  login: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isActivated, setIsActivated] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Čuvamo token samo u memoriji, gubi se gašenjem aplikacije
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // 1. Provera stanja pri pokretanju aplikacije
  useEffect(() => {
    const checkActivationStatus = async () => {
      try {
        const storedDeviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
        if (storedDeviceId) {
          setIsActivated(true);
        }
      } catch (error) {
        console.error('Greška pri čitanju iz SecureStore-a:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkActivationStatus();
  }, []);

  // 2. Faza aktivacije: Skeniranje QR koda
  const activateAccount = async (qrCodeData: string) => {
    // Ovde parsiraš QR kod i šalješ na backend
    // const response = await axios.post(`${API_URL}/activate`, { qr_data: qrCodeData });
    
    // Simulacija uspeha (ukloni u produkciji):
    console.log("QR kod validan, prelazak na PIN setup.");
  };

  // 3. Faza aktivacije: Postavljanje PIN-a i generisanje Device ID-a
  const setupPin = async (pin: string) => {
    // Generiši nasumičan Device ID (ili koristi expo-application)
    const newDeviceId = crypto.randomUUID(); 
    
    // const response = await axios.post(`${API_URL}/setup-pin`, { pin, device_id: newDeviceId });
    
    // Ako backend vrati 200 OK:
    await SecureStore.setItemAsync(DEVICE_ID_KEY, newDeviceId);
    setIsActivated(true);
  };

  // 4. Svakodnevno logovanje (Unos PIN-a)
  const login = async (pin: string): Promise<boolean> => {
    try {
      const deviceId = await SecureStore.getItemAsync(DEVICE_ID_KEY);
      
      if (!deviceId) throw new Error("Uređaj nije aktiviran.");

      const response = await axios.post(`${API_URL}/login`, {
        device_id: deviceId,
        pin: pin
      });

      // Backend (Sanctum) vraća plain-text token za sesiju
      const token = response.data.token; 
      
      // Upisujemo token u state i konfigurišemo Axios za sve buduće zahteve
      setSessionToken(token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setIsLoggedIn(true);
      
      return true;
    } catch (error) {
      console.error('Login neuspešan:', error);
      return false;
    }
  };

  // 5. Izlogovanje i uništavanje sesije
  const logout = async () => {
    try {
      if (sessionToken) {
        // Obavesti backend da uništi Sanctum token
        await axios.post(`${API_URL}/logout`);
      }
    } catch (error) {
      console.error('Greška pri logout-u na serveru', error);
    } finally {
      // Bez obzira na API odgovor, brišemo sesiju na klijentu
      setSessionToken(null);
      delete axios.defaults.headers.common['Authorization'];
      setIsLoggedIn(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isActivated,
        isLoggedIn,
        isLoading,
        activateAccount,
        setupPin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth mora biti korišćen unutar AuthProvider-a');
  }
  return context;
};