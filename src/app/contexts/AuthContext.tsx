import React, { createContext, useContext, useState } from 'react';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface UserWithPassword extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyPassword: (email: string, password: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserWithPassword[]>([]);
  const userIdCounter = React.useRef(1);

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: 'El correo no es válido' };
    }

    if (firstName.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(firstName)) {
      return { success: false, message: 'El nombre es inválido' };
    }

    if (lastName.length < 2 || !/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(lastName)) {
      return { success: false, message: 'El apellido es inválido' };
    }

    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { success: false, message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número' };
    }

    if (users.some((u) => u.email === email)) {
      return { success: false, message: 'El correo ya está en uso' };
    }

    const newUser: User = {
      id: String(userIdCounter.current++),
      firstName,
      lastName,
      email,
    };

    setUsers([...users, { ...newUser, password }]);
    setUser(newUser);

    return { success: true };
  };

  const login = async (email: string, password: string) => {
    const foundUser = users.find((u) => u.email === email && u.password === password);

    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        email: foundUser.email,
      };
      setUser(userData);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
  };

  const verifyPassword = (email: string, password: string) => {
    return users.some((u) => u.email === email && u.password === password);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user, verifyPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
