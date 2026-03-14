// ============================================================
// src/context/AuthContext.js
// ============================================================
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [doctor, setDoctor] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("pearlsmile_token"));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp * 1000 > Date.now()) {
          setDoctor(payload);
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
  }, [token]);

  const login = (newToken, doctorData) => {
    localStorage.setItem("pearlsmile_token", newToken);
    setToken(newToken);
    setDoctor(doctorData);
  };

  const logout = () => {
    localStorage.removeItem("pearlsmile_token");
    setToken(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, token, login, logout, isLoggedIn: !!doctor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
