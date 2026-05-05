import React, { createContext, useContext, useState, useEffect } from "react";
import { registerRequest, type User } from "../services/authService";

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
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem("currentUser");
      }
    }
  }, []);

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return {
        success: false,
        message: "El correo no es válido",
      };
    }

    if (
      cleanFirstName.length < 2 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanFirstName)
    ) {
      return {
        success: false,
        message: "El nombre es inválido",
      };
    }

    if (
      cleanLastName.length < 2 ||
      !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(cleanLastName)
    ) {
      return {
        success: false,
        message: "El apellido es inválido",
      };
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

    if (password !== passwordConfirmation) {
      return {
        success: false,
        message: "Las contraseñas no coinciden",
      };
    }

    try {
      const registeredUser = await registerRequest({
        firstName: cleanFirstName,
        lastName: cleanLastName,
        email: cleanEmail,
        password,
        passwordConfirmation,
      });

      setUser(registeredUser);
      localStorage.setItem("currentUser", JSON.stringify(registeredUser));

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Error al registrar el usuario",
      };
    }
  };

  const login = async (email: string, password: string) => {
    console.log("Login pendiente de conectar al backend:", email, password);

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