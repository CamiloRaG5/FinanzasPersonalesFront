import { useMemo } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useBudgets } from "../contexts/BudgetContext";
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  PieChart,
  AlertTriangle,
} from "lucide-react";
import { Link } from "react-router";

export function DashboardPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { getBudgetForMonth } = useBudgets();

  const userTransactions = useMemo(() => {
    return [...transactions];
  }, [transactions]);

  const totalIncome = useMemo(() => {
    return userTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [userTransactions]);

  const totalExpense = useMemo(() => {
    return userTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [userTransactions]);

  const balance = totalIncome - totalExpense;

  const recentTransactions = useMemo(() => {
    return [...userTransactions]
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, 5);
  }, [userTransactions]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }, []);

  const currentBudget = useMemo(() => {
    if (!user) return null;
    return getBudgetForMonth(user.id, currentMonth);
  }, [user, currentMonth, getBudgetForMonth]);

  const currentMonthExpenses = useMemo(() => {
    return userTransactions
      .filter(
        (t) =>
          t.type === "expense" &&
          String(t.date).startsWith(currentMonth)
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  }, [userTransactions, currentMonth]);

  const remainingBudget = currentBudget
    ? currentBudget.expenseLimit - currentMonthExpenses
    : 0;

  const isOverBudget = currentBudget
    ? currentMonthExpenses > currentBudget.expenseLimit
    : false;

  const budgetProgress = currentBudget
    ? (currentMonthExpenses / currentBudget.expenseLimit) * 100
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">
              ¡Bienvenido, {user?.firstName}!
            </h1>
            <p className="text-gray-600">
              Aquí está el resumen de tus finanzas
            </p>
          </div>

          {!currentBudget && (
            <div className="mb-8 bg-blue-50 border-2 border-blue-500 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-lg text-gray-900 mb-1">
                      No tienes presupuesto para este mes
                    </h3>
                    <p className="text-sm text-gray-600">
                      Crea un presupuesto mensual para controlar mejor tus
                      gastos
                    </p>
                  </div>
                </div>

                <Link
                  to="/create-budget"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Presupuesto
                </Link>
              </div>
            </div>
          )}

          {currentBudget && (
            <div
              className={`mb-8 rounded-lg shadow p-6 ${
                isOverBudget
                  ? "bg-red-50 border-2 border-red-500"
                  : "bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isOverBudget ? "bg-red-100" : "bg-blue-100"
                    }`}
                  >
                    <PieChart
                      className={`w-6 h-6 ${
                        isOverBudget ? "text-red-600" : "text-blue-600"
                      }`}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg text-gray-900">
                      Presupuesto de{" "}
                      {new Date(currentMonth + "-01").toLocaleDateString(
                        "es-ES",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Actualización automática
                    </p>
                  </div>
                </div>

                <Link
                  to="/budget-progress"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Ver detalle
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Presupuesto Total
                  </p>
                  <p className="text-xl text-blue-600">
                    ${Number(currentBudget.expenseLimit).toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
                  <p className="text-xl text-red-600">
                    ${currentMonthExpenses.toFixed(2)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Presupuesto Restante
                  </p>
                  <p
                    className={`text-xl ${
                      isOverBudget ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    ${remainingBudget.toFixed(2)}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Progreso</span>
                  <span>{budgetProgress.toFixed(1)}%</span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      isOverBudget
                        ? "bg-red-600"
                        : budgetProgress > 80
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>

              {isOverBudget && (
                <div className="flex items-center space-x-2 mt-4 p-3 bg-red-100 rounded-lg text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm">
                    ¡Has excedido tu presupuesto mensual!
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">Balance Total</p>
              <p
                className={`text-2xl ${
                  balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                ${balance.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">Ingresos Totales</p>
              <p className="text-2xl text-green-600">
                ${totalIncome.toFixed(2)}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-1">Gastos Totales</p>
              <p className="text-2xl text-red-600">
                ${totalExpense.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-4">Acciones Rápidas</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/add-income"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>

                <div>
                  <h3 className="text-gray-900 mb-1">Registrar Ingreso</h3>
                  <p className="text-sm text-gray-600">
                    Añade un nuevo ingreso a tu cuenta
                  </p>
                </div>
              </Link>

              <Link
                to="/add-expense"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-red-600" />
                </div>

                <div>
                  <h3 className="text-gray-900 mb-1">Registrar Gasto</h3>
                  <p className="text-sm text-gray-600">
                    Registra un nuevo gasto
                  </p>
                </div>
              </Link>

              {!currentBudget ? (
                <Link
                  to="/create-budget"
                  className="bg-blue-50 border-2 border-blue-500 rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-1">Crear Presupuesto</h3>
                    <p className="text-sm text-gray-600">
                      Planifica tus finanzas mensuales
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  to="/budget-progress"
                  className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="text-gray-900 mb-1">Ver Presupuestos</h3>
                    <p className="text-sm text-gray-600">
                      Revisa tu progreso mensual
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-gray-900">
                Transacciones Recientes
              </h2>

              <Link
                to="/history"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver todas
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No hay transacciones registradas</p>
                  <p className="text-sm mt-2">
                    Comienza agregando tu primer ingreso o gasto
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === "income"
                              ? "bg-green-100"
                              : "bg-red-100"
                          }`}
                        >
                          {transaction.type === "income" ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>

                        <div>
                          <p className="text-gray-900">
                            {transaction.description ||
                              transaction.category ||
                              "Sin descripción"}
                          </p>

                          <p className="text-sm text-gray-500">
                            {transaction.category} ·{" "}
                            {new Date(transaction.date).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>

                      <p
                        className={`${
                          transaction.type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.type === "income" ? "+" : "-"}$
                        {Number(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}