const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

type RegisterPayload = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
};

type RegisterResponse = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export async function registerRequest(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/v1/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      typeof data === "object" && data?.message
        ? data.message
        : typeof data === "string" && data
        ? data
        : "Error al registrar"
    );
  }

  return data;
}