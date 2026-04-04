import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { TrendingUp, TrendingDown, Wallet, Plus } from "lucide-react";
import { Link } from "react-router";

export function DashboardPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();

  const userTransactions = transactions.filter(t => t.userId === user?.id);
  
  const totalIncome = userTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpense = userTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = totalIncome - totalExpense;

  const recentTransactions = userTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl text-gray-900 mb-2">
              ¡Bienvenido, {user?.firstName}!
            </h1>
            <p className="text-gray-600">Aquí está el resumen de tus finanzas</p>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Balance Total</p>
              <p className={`text-2xl ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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

          {/* Quick actions */}
          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/add-income"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Registrar Ingreso</h3>
                  <p className="text-sm text-gray-600">Añade un nuevo ingreso a tu cuenta</p>
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
                  <p className="text-sm text-gray-600">Registra un nuevo gasto</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl text-gray-900">Transacciones Recientes</h2>
              <Link to="/history" className="text-sm text-blue-600 hover:underline">
                Ver todas
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow">
              {recentTransactions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No hay transacciones registradas</p>
                  <p className="text-sm mt-2">Comienza agregando tu primer ingreso o gasto</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-900">{transaction.category}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
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
