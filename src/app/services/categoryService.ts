const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface Category {
  id: string;
  name: string;
}

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

function normalizeCategory(category: any): Category {
  return {
    id: String(category.id ?? category.categoryId ?? category._id),
    name: String(
      category.name ??
        category.categoryName ??
        category.nombre ??
        category.description ??
        "Sin nombre"
    ),
  };
}

export async function getCategoriesRequest(): Promise<Category[]> {
  const response = await fetch(`${API_URL}/api/v1/categories`);

  const data = await parseResponse(response);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.categories)
    ? data.categories
    : [];

  return list.map(normalizeCategory);
}