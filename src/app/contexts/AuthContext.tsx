import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import {
  registerRequest,
  loginRequest,
  type User,
} from "../services/authService";

interface AuthContextType {
  user: User | null;

  login: (
    email:string,
    password:string
  ) => Promise<boolean>;

  register: (
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    passwordConfirmation:string
  ) => Promise<{
    success:boolean;
    message?:string;
  }>;

  logout: () => void;

  isAuthenticated:boolean;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if(!context){
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
};

export const AuthProvider:React.FC<{
  children:React.ReactNode;
}> = ({ children }) => {

  const [user,setUser] =
    useState<User | null>(null);

  useEffect(()=>{

    const storedUser =
      localStorage.getItem(
        "currentUser"
      );

    if(storedUser){

      try{

        setUser(
          JSON.parse(storedUser)
        );

      }catch{

        localStorage.removeItem(
          "currentUser"
        );

      }
    }

  },[]);

  const register = async (
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    passwordConfirmation:string
  ) => {

    const cleanFirstName =
      firstName.trim();

    const cleanLastName =
      lastName.trim();

    const cleanEmail =
      email.trim().toLowerCase();

    try{

      await registerRequest({
        firstName:cleanFirstName,
        lastName:cleanLastName,
        email:cleanEmail,
        password,
        passwordConfirmation,
      });

      return {
        success:true,
      };

    }catch(error){

      return {
        success:false,
        message:
          error instanceof Error
            ? error.message
            : "Error al registrar",
      };
    }
  };

  const login = async (
    email:string,
    password:string
  ) => {

    try{

      const result =
        await loginRequest(
          email,
          password
        );

      const currentUser:User = {
        id:result.userId,
        email:result.email,
      };

      setUser(currentUser);

      localStorage.setItem(
        "currentUser",
        JSON.stringify(currentUser)
      );

      return true;

    }catch(error){

      console.error(error);

      return false;
    }
  };

  const logout = () => {

    setUser(null);

    localStorage.removeItem(
      "currentUser"
    );

    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "userId"
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated:!!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};