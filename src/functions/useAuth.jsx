import { createContext, useContext, useState } from "react";
import { apiLogin } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem("cc_role"));
  const [token, setToken] = useState(() => localStorage.getItem("cc_token"));

  async function login(selectedRole, password) {
    const data = await apiLogin(selectedRole, password);
    localStorage.setItem("cc_token", data.token);
    localStorage.setItem("cc_role", data.role);
    setToken(data.token);
    setRole(data.role);
  }

  function logout() {
    localStorage.removeItem("cc_token");
    localStorage.removeItem("cc_role");
    setToken(null);
    setRole(null);
  }

  return (
    <AuthContext.Provider value={{ role, token, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
