const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function parseResponse(response: Response) {
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
        : "Error al obtener categorías"
    );
  }

  return data;
}

export async function getCategoriesRequest() {
  const response = await fetch(`${API_URL}/api/v1/categories`);
  return parseResponse(response);
}