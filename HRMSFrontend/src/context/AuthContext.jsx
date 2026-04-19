import { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Load user on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const loadUser = async () => {
      try {
        const res = await API.get("/employees/me");
        setUser(res.data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);
  // ✅ LOGIN
  const login = async (email, password) => {
    const res = await API.post("/auth/login", { email, password });

    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ custom hook
export const useAuth = () => useContext(AuthContext);
