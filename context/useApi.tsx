import { useMemo } from "react";
import { API_BASE_URL, useAuth } from "./AuthContext";
import {create as axiosCreate} from "axios";

export const useApi = () => {
  const { sessionToken } = useAuth();

  const apiInstance = useMemo(() => {
    const instance = axiosCreate({
      baseURL: API_BASE_URL,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(sessionToken && { Authorization: `Bearer ${sessionToken}` }),
      },
    });
    return instance;
  }, [sessionToken]);

  return apiInstance;
};