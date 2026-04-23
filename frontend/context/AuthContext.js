import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// Global axios config
axios.defaults.baseURL = process.env.NEXT_PUBLIC_API_URL;
axios.defaults.timeout = 10000; // 10s timeout

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/auth/me");
      setUser(data.user);
    } catch {
      Cookies.remove("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post("/api/auth/login", { email, password });
    Cookies.set("token", data.token, { expires: 7 });
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    router.push("/dashboard");
  };

  const register = async (formData) => {
    const { data } = await axios.post("/api/auth/register", formData);
    Cookies.set("token", data.token, { expires: 7 });
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    router.push("/profile/setup");
  };

  const logout = () => {
    Cookies.remove("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    router.push("/");
  };

  const updateUser = (updatedUser) => setUser((prev) => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
