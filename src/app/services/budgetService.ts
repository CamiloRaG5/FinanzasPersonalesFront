const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export type BudgetPayload = {
  userId: string;
  month: string;
  totalIncome: number;
  expenseLimit: number;
};

export type BudgetAllocation = {
  categoryId: string;
  category: string;
  amount: number;
};

export interface BudgetResponse {
  id: string;
  userId: string;
  month: string;
  income: number;
  expenseLimit: number;
  allocations: BudgetAllocation[];
}

export type CreateBudgetAllocationPayload = {
  userId: string;
  categoryId: string;
  amount: number;
};

export type UpdateBudgetAllocationPayload = {
  userId: string;
  newAmount: number;
};

export interface BudgetProgressGlobalSummary {
  budgetId: string;
  totalIncome: number;
  expenseLimit: number;
  totalSpent: number;
  remainingBalance: number;
  exceeded: boolean;
}

export interface BudgetProgressCategoryDetail {
  categoryId: string;
  categoryName: string;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
}

export interface BudgetProgressResponse {
  globalSummary: BudgetProgressGlobalSummary;
  categoryDetails: BudgetProgressCategoryDetail[];
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
        : "Error en la petición de presupuesto"
    );
  }

  return data;
}

function getResponseBody(data: any) {
  return data?.data ?? data;
}

function normalizeMonthForUI(month: string) {
  return String(month ?? "").slice(0, 7);
}

function normalizeMonthForBackend(month: string) {
  const cleanMonth = String(month ?? "").trim();

  if (cleanMonth.length === 7) {
    return `${cleanMonth}-01`;
  }

  return cleanMonth;
}

function normalizeAllocation(allocation: any): BudgetAllocation {
  const category =
    typeof allocation?.category === "object" && allocation.category !== null
      ? allocation.category
      : null;

  const categoryName =
    allocation?.categoryName ??
    category?.name ??
    allocation?.name ??
    allocation?.categoryTitle ??
    (typeof allocation?.category === "string" ? allocation.category : null) ??
    "Sin categoría";

  return {
    categoryId: String(
      allocation?.categoryId ??
        category?.id ??
        category?.categoryId ??
        ""
    ),
    category: String(categoryName),
    amount: Number(
      allocation?.amount ??
        allocation?.value ??
        allocation?.limit ??
        allocation?.budgetAmount ??
        allocation?.allocatedAmount ??
        allocation?.newAmount ??
        0
    ),
  };
}

function normalizeBudget(budget: any): BudgetResponse {
  const user =
    typeof budget?.user === "object" && budget.user !== null
      ? budget.user
      : null;

  const rawAllocations =
    budget?.allocations ??
    budget?.budgetAllocations ??
    budget?.categories ??
    [];

  const allocations: BudgetAllocation[] = Array.isArray(rawAllocations)
    ? rawAllocations.map(normalizeAllocation)
    : [];

  return {
    id: String(budget?.id ?? budget?.budgetId ?? budget?._id ?? ""),
    userId: String(budget?.userId ?? user?.id ?? user?.userId ?? ""),
    month: normalizeMonthForUI(
      budget?.month ??
        budget?.budgetMonth ??
        budget?.period ??
        budget?.date ??
        ""
    ),
    income: Number(
      budget?.totalIncome ??
        budget?.income ??
        budget?.monthlyIncome ??
        budget?.expectedIncome ??
        0
    ),
    expenseLimit: Number(
      budget?.expenseLimit ??
        budget?.limit ??
        budget?.monthlyExpenseLimit ??
        budget?.totalBudget ??
        0
    ),
    allocations,
  };
}

function getAuthHeaders() {

  const token =
    localStorage.getItem("token");

  return {
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`,
  };
}

function normalizeBudgetProgress(data: any): BudgetProgressResponse {
  const globalSummary = data?.globalSummary ?? {};

  const categoryDetails = Array.isArray(data?.categoryDetails)
    ? data.categoryDetails
    : [];

  return {
    globalSummary: {
      budgetId: String(globalSummary.budgetId ?? ""),
      totalIncome: Number(globalSummary.totalIncome ?? 0),
      expenseLimit: Number(globalSummary.expenseLimit ?? 0),
      totalSpent: Number(globalSummary.totalSpent ?? 0),
      remainingBalance: Number(globalSummary.remainingBalance ?? 0),
      exceeded: Boolean(globalSummary.exceeded ?? false),
    },
    categoryDetails: categoryDetails.map((item: any) => ({
      categoryId: String(item.categoryId ?? ""),
      categoryName: String(item.categoryName ?? "Sin categoría"),
      allocatedAmount: Number(item.allocatedAmount ?? 0),
      spentAmount: Number(item.spentAmount ?? 0),
      remainingAmount: Number(item.remainingAmount ?? 0),
      progressPercentage: Number(item.progressPercentage ?? 0),
    })),
  };
}

export async function createBudgetRequest(
  payload: BudgetPayload
): Promise<BudgetResponse> {
  const response = await fetch(`${API_URL}/api/v1/budgets`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      userId: payload.userId,
      month: normalizeMonthForBackend(payload.month),
      totalIncome: payload.totalIncome,
      expenseLimit: payload.expenseLimit,
    }),
  });

  const data = await parseResponse(response);

  return normalizeBudget(getResponseBody(data));
}

export async function getBudgetsByUserRequest(
  userId: string
): Promise<BudgetResponse[]> {
  const cleanUserId = String(userId).trim();

  const response = await fetch(`${API_URL}/api/v1/budgets/${cleanUserId}`);

  const data = await parseResponse(response);

  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.budgets)
    ? data.budgets
    : Array.isArray(data?.content)
    ? data.content
    : [];

  return list.map(normalizeBudget);
}

export async function updateBudgetRequest(
  budgetId: string,
  userId: string,
  newTotalIncome: number,
  newLimit: number
): Promise<BudgetResponse> {
  const cleanBudgetId = String(budgetId).trim();
  const cleanUserId = String(userId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/budgets/${cleanBudgetId}?userId=${encodeURIComponent(
      cleanUserId
    )}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        newTotalIncome,
        newLimit,
      }),
    }
  );

  const data = await parseResponse(response);

  return normalizeBudget(getResponseBody(data));
}

export async function deleteBudgetRequest(
  budgetId: string,
  userId: string
): Promise<void> {
  const cleanBudgetId = String(budgetId).trim();
  const cleanUserId = String(userId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/budgets/${cleanBudgetId}?userId=${encodeURIComponent(
      cleanUserId
    )}`,
    {
      method: "DELETE",
      headers:getAuthHeaders(),
    }
  );

  await parseResponse(response);
}

export async function createBudgetAllocationRequest(
  budgetId: string,
  payload: CreateBudgetAllocationPayload
): Promise<any> {
  const cleanBudgetId = String(budgetId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/budgets/${cleanBudgetId}/allocations`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: payload.userId,
        categoryId: payload.categoryId,
        amount: payload.amount,
      }),
    }
  );

  return parseResponse(response);
}

export async function updateBudgetAllocationRequest(
  budgetId: string,
  categoryId: string,
  payload: UpdateBudgetAllocationPayload
): Promise<any> {
  const cleanBudgetId = String(budgetId).trim();
  const cleanCategoryId = String(categoryId).trim();

  const response = await fetch(
    `${API_URL}/api/v1/budgets/${cleanBudgetId}/allocations/${cleanCategoryId}`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        userId: payload.userId,
        newAmount: payload.newAmount,
      }),
    }
  );

  return parseResponse(response);
}

export async function getBudgetProgressRequest(
  userId: string,
  month: string
): Promise<BudgetProgressResponse> {
  const cleanUserId = String(userId).trim();
  const cleanMonth = normalizeMonthForBackend(month);

  const response = await fetch(
    `${API_URL}/api/v1/budgets/${cleanUserId}/progress?month=${encodeURIComponent(
      cleanMonth
    )}`,
     {
    headers:getAuthHeaders(),
  }
  );

  const data = await parseResponse(response);

  return normalizeBudgetProgress(data);
}