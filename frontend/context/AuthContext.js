import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Set token on every request if it exists
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
      const { data } = await axios.get(`${API}/api/auth/me`, { timeout: 8000 });
      setUser(data.user);
    } catch {
      Cookies.remove("token");
      delete axios.defaults.headers.common["Authorization"];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const { data } = await axios.post(
      `${API}/api/auth/login`,
      { email, password },
      { timeout: 10000 }
    );
    Cookies.set("token", data.token, { expires: 7 });
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    setUser(data.user);
    router.push("/dashboard");
  };

  const register = async (formData) => {
    const { data } = await axios.post(
      `${API}/api/auth/register`,
      formData,
      { timeout: 10000 }
    );
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

  const updateUser = (updatedUser) =>
    setUser((prev) => ({ ...prev, ...updatedUser }));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
