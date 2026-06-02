const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

type RegisterPayload = {
  firstName:string;
  lastName:string;
  email:string;
  password:string;
  passwordConfirmation:string;
};

type RegisterResponse = {
  id:string | number;
  firstName:string;
  lastName:string;
  email:string;
};

function parseJwt(token:string){

  return JSON.parse(
    atob(
      token.split(".")[1]
    )
  );
}

export async function registerRequest(
  payload:RegisterPayload
):Promise<User>{

  const response =
    await fetch(
      `${API_URL}/api/v1/auth/register`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify(payload),
      }
    );

  const data =
    await response.json();

  if(!response.ok){
    throw new Error(
      data?.message ||
      "Error al registrar"
    );
  }

  return {
    id:String(data.id),
    firstName:data.firstName,
    lastName:data.lastName,
    email:data.email,
  };
}

export async function loginRequest(
  email:string,
  password:string
){

  const response =
    await fetch(
      `${API_URL}/api/v1/auth/login`,
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
        },
        body:JSON.stringify({
          email,
          password,
        }),
      }
    );

  const data =
    await response.json();

  if(!response.ok){
    throw new Error(
      data?.message ||
      "Credenciales inválidas"
    );
  }

  const token =
    data.token;

  localStorage.setItem(
    "token",
    token
  );

  const decoded =
    parseJwt(token);

  localStorage.setItem(
    "userId",
    decoded.userId
  );

  return {
    token,
    userId:decoded.userId,
    email:decoded.sub,
  };
}