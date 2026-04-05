const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type TransactionPayload = {
  amount: number;
  description: string;
  transactionDate: string;
  userId: string;
  categoryId: string;
};

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
        : "Error en la petición"
    );
  }

  return data;
}

export async function createIncomeRequest(payload: TransactionPayload) {
  const response = await fetch(`${API_URL}/api/v1/transactions/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function createExpenseRequest(payload: TransactionPayload) {
  const response = await fetch(`${API_URL}/api/v1/transactions/expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

export async function getTransactionHistoryRequest(userId: string) {
  const response = await fetch(
    `${API_URL}/api/v1/transactions/history/${userId}`
  );

  return parseResponse(response);
}