const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type TransactionType = "income" | "expense";

export type TransactionPayload = {
  amount: number;
  description: string;
  transactionDate: string;
  userId: string;
  categoryId: string;
};

export interface TransactionResponse {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  transactionDate: string;
  userId: string;
  categoryId: string;
  categoryName: string;
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
        : "Error en la petición"
    );
  }

  return data;
}

function getResponseBody(data: any) {
  return data?.data ?? data;
}

function detectTransactionType(transaction: any): TransactionType {
  const rawType =
    transaction.type ??
    transaction.transactionType ??
    transaction.movementType ??
    transaction.operationType ??
    transaction.kind ??
    transaction.nature ??
    transaction.direction ??
    "";

  const typeText =
    typeof rawType === "object" && rawType !== null
      ? String(
          rawType.name ??
            rawType.type ??
            rawType.value ??
            rawType.code ??
            ""
        ).toLowerCase()
      : String(rawType).toLowerCase();

  if (
    typeText.includes("expense") ||
    typeText.includes("expenses") ||
    typeText.includes("gasto") ||
    typeText.includes("gastos") ||
    typeText.includes("egreso") ||
    typeText.includes("egresos") ||
    typeText.includes("outcome") ||
    typeText.includes("outflow") ||
    typeText.includes("debit") ||
    typeText.includes("withdraw") ||
    typeText.includes("payment")
  ) {
    return "expense";
  }

  return "income";
}

function normalizeTransaction(transaction: any): TransactionResponse {
  const category =
    typeof transaction.category === "object" && transaction.category !== null
      ? transaction.category
      : null;

  const user =
    typeof transaction.user === "object" && transaction.user !== null
      ? transaction.user
      : null;

  return {
    id: String(transaction.id ?? transaction.transactionId ?? transaction._id),
    type: detectTransactionType(transaction),
    amount: Number(transaction.amount ?? transaction.value ?? 0),
    description: String(transaction.description ?? ""),
    transactionDate: String(
      transaction.transactionDate ??
        transaction.date ??
        transaction.createdAt ??
        ""
    ),
    userId: String(transaction.userId ?? user?.id ?? user?.userId ?? ""),
    categoryId: String(
      transaction.categoryId ??
        category?.id ??
        category?.categoryId ??
        ""
    ),
    categoryName: String(
      transaction.categoryName ??
        category?.name ??
        category?.categoryName ??
        "Sin categoría"
    ),
  };
}

export async function createIncomeRequest(
  payload: TransactionPayload
): Promise<TransactionResponse> {
  const response = await fetch(`${API_URL}/api/v1/transactions/income`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  return normalizeTransaction(getResponseBody(data));
}

export async function createExpenseRequest(
  payload: TransactionPayload
): Promise<TransactionResponse> {
  const response = await fetch(`${API_URL}/api/v1/transactions/expense`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await parseResponse(response);

  return normalizeTransaction(getResponseBody(data));
}

export async function getTransactionHistoryRequest(
  userId: string
): Promise<TransactionResponse[]> {
  const response = await fetch(
    `${API_URL}/api/v1/transactions/history/${userId}`
  );

  const data = await parseResponse(response);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.transactions)
    ? data.transactions
    : Array.isArray(data?.content)
    ? data.content
    : [];

  return list.map(normalizeTransaction);
}

export async function deleteTransactionRequest(
  transactionId: string,
  userId: string
): Promise<void> {
  const cleanTransactionId = String(transactionId).trim();
  const cleanUserId = String(userId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/transactions/${cleanTransactionId}?userId=${encodeURIComponent(
      cleanUserId
    )}`,
    {
      method: "DELETE",
    }
  );

  await parseResponse(response);
}

export async function updateTransactionCategoryRequest(
  transactionId: string,
  categoryId: string
): Promise<any> {
  const cleanTransactionId = String(transactionId).trim();
  const cleanCategoryId = String(categoryId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/transactions/${cleanTransactionId}/category`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        categoryId: cleanCategoryId,
      }),
    }
  );

  return parseResponse(response);
}