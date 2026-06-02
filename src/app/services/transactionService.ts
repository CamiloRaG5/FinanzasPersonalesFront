const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export type TransactionType =
  "income" |
  "expense";

export type TransactionPayload = {
  amount:number;
  description:string;
  transactionDate:string;
  userId?:string;
  categoryId:string;
};

export interface TransactionResponse {
  id:string;
  type:TransactionType;
  amount:number;
  description:string;
  transactionDate:string;
  userId:string;
  categoryId:string;
  categoryName:string;
}

async function parseResponse(
  response:Response
){

  const text =
    await response.text();

  let data:any = null;

  try{
    data =
      text
        ? JSON.parse(text)
        : null;
  }catch{
    data = text;
  }

  if(!response.ok){

    throw new Error(
      typeof data === "object" &&
      data?.message
        ? data.message
        : "Error en la petición"
    );
  }

  return data;
}

function getResponseBody(
  data:any
){
  return data?.data ?? data;
}

function getAuthHeaders(){

  const token =
    localStorage.getItem(
      "token"
    );

  return {
    "Content-Type":
      "application/json",

    Authorization:
      `Bearer ${token}`,
  };
}

function getUserId(){

  return (
    localStorage.getItem(
      "userId"
    ) || ""
  );
}

function normalizeTransaction(
  transaction:any
):TransactionResponse{

  return {

    id:String(
      transaction.id
    ),

    type:
      transaction.type?.toLowerCase()
        ?.includes("expense")
          ? "expense"
          : "income",

    amount:Number(
      transaction.amount
    ),

    description:String(
      transaction.description ??
      ""
    ),

    transactionDate:String(
      transaction.transactionDate ??
      ""
    ),

    userId:String(
      transaction.userId ??
      ""
    ),

    categoryId:String(
      transaction.categoryId ??
      ""
    ),

    categoryName:String(
      transaction.categoryName ??
      "Sin categoría"
    ),
  };
}

export async function createIncomeRequest(
  payload:TransactionPayload
){

  const response =
    await fetch(
      `${API_URL}/api/v1/transactions/income`,
      {
        method:"POST",

        headers:
          getAuthHeaders(),

        body:JSON.stringify({
          ...payload,
          userId:getUserId(),
        }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  return normalizeTransaction(
    getResponseBody(data)
  );
}

export async function createExpenseRequest(
  payload:TransactionPayload
){

  const response =
    await fetch(
      `${API_URL}/api/v1/transactions/expense`,
      {
        method:"POST",

        headers:
          getAuthHeaders(),

        body:JSON.stringify({
          ...payload,
          userId:getUserId(),
        }),
      }
    );

  const data =
    await parseResponse(
      response
    );

  return normalizeTransaction(
    getResponseBody(data)
  );
}

export async function getTransactionHistoryRequest(
  userId:string
){

  const response =
    await fetch(
      `${API_URL}/api/v1/transactions/history/${userId}`,
      {
        headers:
          getAuthHeaders(),
      }
    );

  const data =
    await parseResponse(
      response
    );

  const list =
    Array.isArray(data)
      ? data
      : Array.isArray(data?.data)
      ? data.data
      : [];

  return list.map(
    normalizeTransaction
  );
}

export async function deleteTransactionRequest(
  transactionId:string,
  userId:string
){

  const response =
    await fetch(
      `${API_URL}/api/v1/transactions/${transactionId}?userId=${userId}`,
      {
        method:"DELETE",

        headers:
          getAuthHeaders(),
      }
    );

  await parseResponse(
    response
  );
}

export async function updateTransactionCategoryRequest(
  transactionId:string,
  categoryId:string
){

  const response =
    await fetch(
      `${API_URL}/api/v1/transactions/${transactionId}/category`,
      {
        method:"PATCH",

        headers:
          getAuthHeaders(),

        body:JSON.stringify({
          categoryId,
        }),
      }
    );

  return parseResponse(
    response
  );
}