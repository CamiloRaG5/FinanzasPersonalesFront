import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useBudgets } from "../contexts/BudgetContext";
import { useTransactions } from "../contexts/TransactionContext";
import {
  PieChart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Edit2,
  Check,
  X,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBudgetProgressRequest,
  type BudgetProgressResponse,
} from "../services/budgetService";

export function BudgetProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { budgets, updateBudgetAllocation, updateBudget, deleteBudget } =
    useBudgets();

  const { transactions, categories } = useTransactions();

  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  }, []);

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState("");
  const [error, setError] = useState("");

  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetIncome, setBudgetIncome] = useState("");
  const [budgetExpenseLimit, setBudgetExpenseLimit] = useState("");
  const [deleteBudgetDialog, setDeleteBudgetDialog] = useState(false);

  const [savingAllocation, setSavingAllocation] = useState(false);
  const [savingBudget, setSavingBudget] = useState(false);
  const [deletingBudget, setDeletingBudget] = useState(false);

  const [backendProgress, setBackendProgress] =
    useState<BudgetProgressResponse | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  const userBudgets = useMemo(() => {
    return budgets
      .filter((budget) => budget.userId === user?.id)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [budgets, user?.id]);

  const currentMonthBudget = useMemo(() => {
    return userBudgets.find((budget) => budget.month === currentMonth);
  }, [userBudgets, currentMonth]);

  const selectedBudget = useMemo(() => {
    if (selectedBudgetId) {
      return (
        userBudgets.find((budget) => budget.id === selectedBudgetId) ||
        currentMonthBudget ||
        userBudgets[0]
      );
    }

    return currentMonthBudget || userBudgets[0];
  }, [selectedBudgetId, userBudgets, currentMonthBudget]);

  useEffect(() => {
    const loadBudgetProgress = async () => {
      if (!user?.id || !selectedBudget?.month) {
        setBackendProgress(null);
        return;
      }

      try {
        setLoadingProgress(true);

        const data = await getBudgetProgressRequest(
          user.id,
          selectedBudget.month
        );

        setBackendProgress(data);
      } catch (error) {
        console.error("Error cargando progreso del presupuesto:", error);
        setBackendProgress(null);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadBudgetProgress();
  }, [user?.id, selectedBudget?.month]);

  const budgetExpenses = useMemo(() => {
    if (!selectedBudget) return [];

    return transactions.filter(
      (transaction) =>
        transaction.type === "expense" &&
        String(transaction.date).startsWith(selectedBudget.month)
    );
  }, [transactions, selectedBudget]);

  const localTotalSpent = useMemo(() => {
    return budgetExpenses.reduce(
      (sum, transaction) => sum + Number(transaction.amount),
      0
    );
  }, [budgetExpenses]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};

    budgetExpenses.forEach((expense) => {
      const categoryName = String(expense.category ?? "Sin categoría");

      categoryMap[categoryName] =
        (categoryMap[categoryName] || 0) + Number(expense.amount);
    });

    return categoryMap;
  }, [budgetExpenses]);

  const totalAllocated = useMemo(() => {
    if (!selectedBudget) return 0;

    return selectedBudget.allocations.reduce(
      (sum, allocation) => sum + Number(allocation.amount),
      0
    );
  }, [selectedBudget]);

  const globalSummary = backendProgress?.globalSummary;
  const categoryDetails = backendProgress?.categoryDetails ?? [];

  const displayIncome = globalSummary
    ? globalSummary.totalIncome
    : Number(selectedBudget?.income ?? 0);

  const displayExpenseLimit = globalSummary
    ? globalSummary.expenseLimit
    : Number(selectedBudget?.expenseLimit ?? 0);

  const totalSpent = globalSummary
    ? globalSummary.totalSpent
    : localTotalSpent;

  const remainingBudget = globalSummary
    ? globalSummary.remainingBalance
    : selectedBudget
    ? selectedBudget.expenseLimit - localTotalSpent
    : 0;

  const progressPercentage =
    displayExpenseLimit > 0 ? (totalSpent / displayExpenseLimit) * 100 : 0;

  const isOverBudget = globalSummary
    ? globalSummary.exceeded
    : progressPercentage > 100;

  const availableForAllocation = selectedBudget
    ? selectedBudget.expenseLimit - totalAllocated
    : 0;

  const handleEditAllocation = (categoryId: string, categoryName: string) => {
    const currentAllocation = selectedBudget?.allocations.find(
      (allocation) =>
        allocation.categoryId === categoryId ||
        allocation.category === categoryName
    );

    const backendCategory = categoryDetails.find(
      (detail) =>
        detail.categoryId === categoryId ||
        detail.categoryName === categoryName
    );

    setEditingCategory(categoryId);
    setAllocationAmount(
      String(
        backendCategory?.allocatedAmount ??
          currentAllocation?.amount ??
          ""
      )
    );
    setError("");
  };

  const handleSaveAllocation = async () => {
    if (!selectedBudget || !editingCategory) return;

    const category = categories.find(
      (item) => String(item.id) === String(editingCategory)
    );

    if (!category) {
      setError("No se encontró la categoría");
      return;
    }

    const amount = Number(allocationAmount);

    if (isNaN(amount) || amount < 0) {
      setError("El monto debe ser un número válido");
      return;
    }

    try {
      setSavingAllocation(true);

      const result = await updateBudgetAllocation(
        selectedBudget.id,
        String(category.id),
        String(category.name),
        amount
      );

      if (result.success) {
        setEditingCategory(null);
        setAllocationAmount("");
        setError("");
        toast.success("Asignación actualizada correctamente");

        if (user?.id) {
          const data = await getBudgetProgressRequest(
            user.id,
            selectedBudget.month
          );
          setBackendProgress(data);
        }
      } else {
        setError(result.message || "No se pudo actualizar la asignación");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la asignación";

      setError(message);
    } finally {
      setSavingAllocation(false);
    }
  };

  const handleEditBudget = () => {
    if (!selectedBudget) return;

    setBudgetIncome(String(displayIncome));
    setBudgetExpenseLimit(String(displayExpenseLimit));
    setError("");
    setEditingBudget(true);
  };

  const handleSaveBudget = async () => {
    if (!selectedBudget) return;

    const income = Number(budgetIncome);
    const expenseLimit = Number(budgetExpenseLimit);

    if (isNaN(income) || income <= 0) {
      setError("Los ingresos deben ser un número positivo");
      return;
    }

    if (isNaN(expenseLimit) || expenseLimit <= 0) {
      setError("El límite de gastos debe ser un número positivo");
      return;
    }

    try {
      setSavingBudget(true);

      const result = await updateBudget(
        selectedBudget.id,
        income,
        expenseLimit
      );

      if (result.success) {
        setEditingBudget(false);
        setBudgetIncome("");
        setBudgetExpenseLimit("");
        setError("");
        toast.success("Presupuesto actualizado correctamente");

        if (user?.id) {
          const data = await getBudgetProgressRequest(
            user.id,
            selectedBudget.month
          );
          setBackendProgress(data);
        }
      } else {
        setError(result.message || "No se pudo actualizar el presupuesto");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar el presupuesto";

      setError(message);
    } finally {
      setSavingBudget(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!selectedBudget) return;

    try {
      setDeletingBudget(true);

      const result = await deleteBudget(selectedBudget.id);

      if (result.success) {
        setDeleteBudgetDialog(false);
        setSelectedBudgetId(null);
        setBackendProgress(null);
        setError("");
        toast.success("Presupuesto eliminado correctamente");
      } else {
        setError(result.message || "No se pudo eliminar el presupuesto");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar el presupuesto";

      setError(message);
    } finally {
      setDeletingBudget(false);
    }
  };

  if (userBudgets.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navbar />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />

              <h2 className="text-2xl text-gray-900 mb-2">
                No tienes presupuestos definidos
              </h2>

              <p className="text-gray-600 mb-2">
                No existe un presupuesto para{" "}
                {new Date(currentMonth + "-01").toLocaleDateString("es-ES", {
                  month: "long",
                  year: "numeric",
                })}
              </p>

              <p className="text-gray-600 mb-6">
                Crea tu primer presupuesto para empezar a controlar tus gastos
                mensuales
              </p>

              <button
                type="button"
                onClick={() => navigate("/create-budget")}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Presupuesto
              </button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            {!currentMonthBudget && userBudgets.length > 0 && (
              <div className="mb-6 bg-yellow-50 border-2 border-yellow-500 rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />

                    <div>
                      <h3 className="text-gray-900">
                        No tienes presupuesto para{" "}
                        {new Date(currentMonth + "-01").toLocaleDateString(
                          "es-ES",
                          {
                            month: "long",
                            year: "numeric",
                          }
                        )}
                      </h3>

                      <p className="text-sm text-gray-600">
                        Crea un presupuesto para el mes actual para controlar
                        tus gastos
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigate("/create-budget")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Presupuesto
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <PieChart className="w-6 h-6 text-blue-600" />
                </div>

                <div>
                  <h1 className="text-3xl text-gray-900">
                    Progreso del Presupuesto
                  </h1>

                  <p className="text-gray-600">
                    Controla tus gastos mensuales{" "}
                    {loadingProgress ? "(Cargando progreso...)" : ""}
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                {selectedBudget && (
                  <>
                    <button
                      type="button"
                      onClick={handleEditBudget}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setError("");
                        setDeleteBudgetDialog(true);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => navigate("/create-budget")}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nuevo Presupuesto
                </button>
              </div>
            </div>

            {userBudgets.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Seleccionar mes:
                </label>

                <select
                  value={selectedBudget?.id || ""}
                  onChange={(e) => setSelectedBudgetId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userBudgets.map((budget) => (
                    <option key={budget.id} value={budget.id}>
                      {new Date(budget.month + "-01").toLocaleDateString(
                        "es-ES",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedBudget && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                    <h3 className="text-sm text-gray-700">
                      Ingresos Esperados
                    </h3>
                  </div>

                  <p className="text-2xl text-purple-600">
                    ${displayIncome.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm text-gray-700">
                      Presupuesto Total
                    </h3>
                  </div>

                  <p className="text-2xl text-blue-600">
                    ${displayExpenseLimit.toFixed(2)}
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm text-gray-700">Total Gastado</h3>
                  </div>

                  <p className="text-2xl text-red-600">
                    ${totalSpent.toFixed(2)}
                  </p>
                </div>

                <div
                  className={`rounded-lg shadow p-6 ${
                    isOverBudget ? "bg-red-50" : "bg-white"
                  }`}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign
                      className={`w-5 h-5 ${
                        isOverBudget ? "text-red-600" : "text-green-600"
                      }`}
                    />

                    <h3 className="text-sm text-gray-700">
                      Presupuesto Restante
                    </h3>
                  </div>

                  <p
                    className={`text-2xl ${
                      isOverBudget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${remainingBudget.toFixed(2)}
                  </p>

                  {isOverBudget && (
                    <p className="text-xs text-red-600 mt-1">
                      ¡Presupuesto excedido!
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg text-gray-900 mb-4">
                  Progreso General
                </h3>

                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Gastado</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget
                          ? "bg-red-600"
                          : progressPercentage > 80
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{
                        width: `${Math.min(progressPercentage, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {isOverBudget && (
                  <div className="flex items-center space-x-2 mt-4 p-4 bg-red-50 rounded-lg text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <p>
                      ¡Has excedido tu presupuesto! Considera ajustar tus
                      gastos.
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-gray-900">
                    Asignación por Categoría
                  </h3>

                  <p className="text-sm text-gray-600">
                    Disponible: ${availableForAllocation.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-4">
                  {categories.map((category) => {
                    const categoryId = String(category.id);
                    const categoryName = String(category.name);

                    const allocation = selectedBudget.allocations.find(
                      (item) =>
                        item.categoryId === categoryId ||
                        item.category === categoryName
                    );

                    const backendCategory = categoryDetails.find(
                      (detail) =>
                        detail.categoryId === categoryId ||
                        detail.categoryName === categoryName
                    );

                    const allocated = Number(
                      backendCategory?.allocatedAmount ??
                        allocation?.amount ??
                        0
                    );

                    const spent = Number(
                      backendCategory?.spentAmount ??
                        expensesByCategory[categoryName] ??
                        0
                    );

                    const categoryProgress = Number(
                      backendCategory?.progressPercentage ??
                        (allocated > 0 ? (spent / allocated) * 100 : 0)
                    );

                    const remainingAmount = Number(
                      backendCategory?.remainingAmount ??
                        allocated - spent
                    );

                    return (
                      <div
                        key={categoryId}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-900">{categoryName}</h4>

                          {editingCategory === categoryId ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={allocationAmount}
                                onChange={(e) => {
                                  setAllocationAmount(e.target.value);
                                  setError("");
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />

                              <button
                                type="button"
                                onClick={handleSaveAllocation}
                                disabled={savingAllocation}
                                className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-60"
                              >
                                <Check className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setEditingCategory(null);
                                  setAllocationAmount("");
                                  setError("");
                                }}
                                disabled={savingAllocation}
                                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-60"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleEditAllocation(categoryId, categoryName)
                              }
                              className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                            >
                              <span className="text-sm">
                                ${allocated.toFixed(2)}
                              </span>

                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {allocated > 0 && (
                          <>
                            <div className="flex justify-between text-sm text-gray-600 mb-1">
                              <span>Gastado: ${spent.toFixed(2)}</span>
                              <span>{categoryProgress.toFixed(1)}%</span>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-full transition-all ${
                                  categoryProgress > 100
                                    ? "bg-red-600"
                                    : categoryProgress > 80
                                    ? "bg-yellow-500"
                                    : "bg-blue-600"
                                }`}
                                style={{
                                  width: `${Math.min(
                                    categoryProgress,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>

                            <p
                              className={`text-xs mt-1 ${
                                remainingAmount < 0
                                  ? "text-red-600"
                                  : "text-gray-500"
                              }`}
                            >
                              Restante: ${remainingAmount.toFixed(2)}
                            </p>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {error && (
                  <div className="flex items-center space-x-2 mt-4 p-3 bg-red-50 rounded-lg text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {editingBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">
                Editar Presupuesto Mensual
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Ingresos Esperados:
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetIncome}
                    onChange={(e) => {
                      setBudgetIncome(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Límite de Gastos:
                  </label>

                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetExpenseLimit}
                    onChange={(e) => {
                      setBudgetExpenseLimit(e.target.value);
                      setError("");
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 mt-4 p-3 bg-red-50 rounded-lg text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBudget(false);
                    setBudgetIncome("");
                    setBudgetExpenseLimit("");
                    setError("");
                  }}
                  disabled={savingBudget}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveBudget}
                  disabled={savingBudget}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  <span>{savingBudget ? "Guardando..." : "Guardar"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {deleteBudgetDialog && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">
                Confirmar Eliminación
              </h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  Vas a eliminar el siguiente presupuesto:
                </p>

                <div className="space-y-1">
                  <p className="text-gray-900">
                    <span className="font-medium">Mes:</span>{" "}
                    {new Date(
                      selectedBudget.month + "-01"
                    ).toLocaleDateString("es-ES", {
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <p className="text-gray-900">
                    <span className="font-medium">Presupuesto:</span> $
                    {Number(selectedBudget.expenseLimit).toFixed(2)}
                  </p>

                  <p className="text-gray-900">
                    <span className="font-medium">Ingresos:</span> $
                    {Number(selectedBudget.income).toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Esta acción no se puede deshacer. Todas las asignaciones por
                categoría también se eliminarán.
              </p>

              {error && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 rounded-lg text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setDeleteBudgetDialog(false);
                    setError("");
                  }}
                  disabled={deletingBudget}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>

                <button
                  type="button"
                  onClick={handleDeleteBudget}
                  disabled={deletingBudget}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deletingBudget ? "Eliminando..." : "Eliminar"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}