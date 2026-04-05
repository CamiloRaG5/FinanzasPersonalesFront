import React, { createContext, useContext, useState, useEffect } from "react";
import { registerRequest } from "../services/authService";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: "El correo no es válido" };
    }

    if (
      firstName.length < 2 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName)
    ) {
      return { success: false, message: "El nombre es inválido" };
    }

    if (
      lastName.length < 2 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)
    ) {
      return { success: false, message: "El apellido es inválido" };
    }

    if (
      password.length < 8 ||
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)
    ) {
      return {
        success: false,
        message:
          "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
      };
    }

    if (password.trim() !== passwordConfirmation.trim()) {
      return {
        success: false,
        message: "Las contraseñas no coinciden",
      };
    }

    try {
      const response = await registerRequest({
        firstName,
        lastName,
        email,
        password,
        passwordConfirmation,
      });

      const userData: User = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
      };

      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al registrar usuario",
      };
    }
  };

  // temporal
  const login = async (email: string, password: string) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");

    const foundUser = users.find(
      (u: any) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      };

      setUser(userData);
      localStorage.setItem("currentUser", JSON.stringify(userData));

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("currentUser");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};