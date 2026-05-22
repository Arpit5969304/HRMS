import { createContext, useContext, useEffect, useState } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const res = await API.get("/employees/me");
    setUser(res.data);
    return res.data;
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        await refreshUser();
      } catch (err) {
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const persistSession = (authResponse) => {
    if (authResponse?.token && authResponse?.user) {
      localStorage.setItem("token", authResponse.token);
      setUser(authResponse.user);
    }

    return authResponse;
  };

  const login = async (email, password, otp = "") => {
    const payload = { email, password };

    if (otp) {
      payload.otp = otp;
    }

    const res = await API.post("/auth/login", payload);

    return persistSession(res.data);
  };

  const loginWithGoogle = async (credential) => {
    const res = await API.post("/auth/google", { credential });
    return persistSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        refreshUser,
        login,
        loginWithGoogle,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
