import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useBudgets } from "../contexts/BudgetContext";
import { useTransactions } from "../contexts/TransactionContext";
import { PieChart, TrendingUp, AlertTriangle, DollarSign, Edit2, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function BudgetProgressPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { budgets, updateBudgetAllocation, updateBudget, deleteBudget } = useBudgets();
  const { transactions, categories } = useTransactions();

  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [allocationAmount, setAllocationAmount] = useState('');
  const [error, setError] = useState('');
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetIncome, setBudgetIncome] = useState('');
  const [budgetExpenseLimit, setBudgetExpenseLimit] = useState('');
  const [deleteBudgetDialog, setDeleteBudgetDialog] = useState(false);

  const userBudgets = useMemo(() => {
    return budgets
      .filter(b => b.userId === user?.id)
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [budgets, user?.id]);

  const currentMonthBudget = useMemo(() => {
    return userBudgets.find(b => b.month === currentMonth);
  }, [userBudgets, currentMonth]);

  const selectedBudget = selectedBudgetId
    ? userBudgets.find(b => b.id === selectedBudgetId)
    : currentMonthBudget || userBudgets[0];

  const budgetExpenses = useMemo(() => {
    if (!selectedBudget || !user) return [];

    return transactions.filter(
      t => t.userId === user.id &&
           t.type === 'expense' &&
           t.date.startsWith(selectedBudget.month)
    );
  }, [transactions, selectedBudget, user]);

  const totalSpent = useMemo(() => {
    return budgetExpenses.reduce((sum, t) => sum + t.amount, 0);
  }, [budgetExpenses]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    budgetExpenses.forEach(expense => {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
    });
    return categoryMap;
  }, [budgetExpenses]);

  const totalAllocated = useMemo(() => {
    if (!selectedBudget) return 0;
    return selectedBudget.allocations.reduce((sum, a) => sum + a.amount, 0);
  }, [selectedBudget]);

  const handleEditAllocation = (category: string) => {
    const currentAllocation = selectedBudget?.allocations.find(a => a.category === category);
    setEditingCategory(category);
    setAllocationAmount(currentAllocation?.amount.toString() || '');
    setError('');
  };

  const handleSaveAllocation = () => {
    if (!selectedBudget || !editingCategory) return;

    const amount = Number(allocationAmount);

    if (isNaN(amount) || amount <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    const success = updateBudgetAllocation(selectedBudget.id, editingCategory, amount);

    if (success) {
      setEditingCategory(null);
      setAllocationAmount('');
      setError('');
      toast.success('Asignación actualizada correctamente');
    } else {
      setError('El monto excede el presupuesto disponible');
    }
  };

  const handleEditBudget = () => {
    if (!selectedBudget) return;
    setBudgetIncome(selectedBudget.income.toString());
    setBudgetExpenseLimit(selectedBudget.expenseLimit.toString());
    setError('');
    setEditingBudget(true);
  };

  const handleSaveBudget = () => {
    if (!selectedBudget) return;

    const income = Number(budgetIncome);
    const expenseLimit = Number(budgetExpenseLimit);

    if (isNaN(income) || income <= 0) {
      setError('Los ingresos deben ser un número positivo');
      return;
    }

    if (isNaN(expenseLimit) || expenseLimit <= 0) {
      setError('El límite de gastos debe ser un número positivo');
      return;
    }

    const success = updateBudget(selectedBudget.id, income, expenseLimit);

    if (success) {
      setEditingBudget(false);
      setBudgetIncome('');
      setBudgetExpenseLimit('');
      setError('');
      toast.success('Presupuesto actualizado correctamente');
    } else {
      setError('No se pudo actualizar el presupuesto');
    }
  };

  const handleDeleteBudget = () => {
    if (!selectedBudget) return;

    const success = deleteBudget(selectedBudget.id);

    if (success) {
      setDeleteBudgetDialog(false);
      toast.success('Presupuesto eliminado correctamente');

      if (userBudgets.length > 1) {
        setSelectedBudgetId(null);
      }
    } else {
      setError('No se pudo eliminar el presupuesto');
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
              <h2 className="text-2xl text-gray-900 mb-2">No tienes presupuestos definidos</h2>
              <p className="text-gray-600 mb-2">
                No existe un presupuesto para {new Date(currentMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
              </p>
              <p className="text-gray-600 mb-6">Crea tu primer presupuesto para empezar a controlar tus gastos mensuales</p>
              <button
                onClick={() => navigate('/create-budget')}
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

  const progressPercentage = selectedBudget ? (totalSpent / selectedBudget.expenseLimit) * 100 : 0;
  const isOverBudget = progressPercentage > 100;
  const remainingBudget = selectedBudget ? selectedBudget.expenseLimit - totalSpent : 0;
  const availableForAllocation = selectedBudget ? selectedBudget.expenseLimit - totalAllocated : 0;

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
                      <h3 className="text-gray-900">No tienes presupuesto para {new Date(currentMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                      <p className="text-sm text-gray-600">Crea un presupuesto para el mes actual para controlar tus gastos</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/create-budget')}
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
                  <h1 className="text-3xl text-gray-900">Progreso del Presupuesto</h1>
                  <p className="text-gray-600">Controla tus gastos mensuales</p>
                </div>
              </div>
              <div className="flex space-x-2">
                {selectedBudget && (
                  <>
                    <button
                      onClick={handleEditBudget}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span>Editar</span>
                    </button>
                    <button
                      onClick={() => setDeleteBudgetDialog(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Eliminar</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => navigate('/create-budget')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Nuevo Presupuesto
                </button>
              </div>
            </div>

            {userBudgets.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">Seleccionar mes:</label>
                <select
                  value={selectedBudget?.id || ''}
                  onChange={(e) => setSelectedBudgetId(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {userBudgets.map(budget => (
                    <option key={budget.id} value={budget.id}>
                      {new Date(budget.month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
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
                    <h3 className="text-sm text-gray-700">Ingresos Esperados</h3>
                  </div>
                  <p className="text-2xl text-purple-600">${selectedBudget.income.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm text-gray-700">Presupuesto Total</h3>
                  </div>
                  <p className="text-2xl text-blue-600">${selectedBudget.expenseLimit.toFixed(2)}</p>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center space-x-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-red-600" />
                    <h3 className="text-sm text-gray-700">Total Gastado</h3>
                  </div>
                  <p className="text-2xl text-red-600">${totalSpent.toFixed(2)}</p>
                </div>

                <div className={`rounded-lg shadow p-6 ${isOverBudget ? 'bg-red-50' : 'bg-white'}`}>
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className={`w-5 h-5 ${isOverBudget ? 'text-red-600' : 'text-green-600'}`} />
                    <h3 className="text-sm text-gray-700">Presupuesto Restante</h3>
                  </div>
                  <p className={`text-2xl ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    ${remainingBudget.toFixed(2)}
                  </p>
                  {isOverBudget && (
                    <p className="text-xs text-red-600 mt-1">¡Presupuesto excedido!</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h3 className="text-lg text-gray-900 mb-4">Progreso General</h3>
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Gastado</span>
                    <span>{progressPercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        isOverBudget ? 'bg-red-600' : progressPercentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                      }`}
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                {isOverBudget && (
                  <div className="flex items-center space-x-2 mt-4 p-4 bg-red-50 rounded-lg text-red-700">
                    <AlertTriangle className="w-5 h-5" />
                    <p>¡Has excedido tu presupuesto! Considera ajustar tus gastos.</p>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg text-gray-900">Asignación por Categoría</h3>
                  <p className="text-sm text-gray-600">
                    Disponible: ${availableForAllocation.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-4">
                  {categories.map(category => {
                    const allocation = selectedBudget.allocations.find(a => a.category === category);
                    const spent = expensesByCategory[category] || 0;
                    const allocated = allocation?.amount || 0;
                    const categoryProgress = allocated > 0 ? (spent / allocated) * 100 : 0;

                    return (
                      <div key={category} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-gray-900">{category}</h4>
                          {editingCategory === category ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={allocationAmount}
                                onChange={(e) => {
                                  setAllocationAmount(e.target.value);
                                  setError('');
                                }}
                                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="0.00"
                              />
                              <button
                                onClick={handleSaveAllocation}
                                className="p-1 text-green-600 hover:bg-green-50 rounded"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingCategory(null);
                                  setAllocationAmount('');
                                  setError('');
                                }}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditAllocation(category)}
                              className="flex items-center space-x-2 text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"
                            >
                              <span className="text-sm">${allocated.toFixed(2)}</span>
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
                                  categoryProgress > 100 ? 'bg-red-600' : categoryProgress > 80 ? 'bg-yellow-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${Math.min(categoryProgress, 100)}%` }}
                              />
                            </div>
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

        {/* Edit Budget Dialog */}
        {editingBudget && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">Editar Presupuesto Mensual</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Ingresos Esperados:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetIncome}
                    onChange={(e) => {
                      setBudgetIncome(e.target.value);
                      setError('');
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Límite de Gastos:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={budgetExpenseLimit}
                    onChange={(e) => {
                      setBudgetExpenseLimit(e.target.value);
                      setError('');
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
                  onClick={() => {
                    setEditingBudget(false);
                    setBudgetIncome('');
                    setBudgetExpenseLimit('');
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleSaveBudget}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Budget Dialog */}
        {deleteBudgetDialog && selectedBudget && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">Confirmar Eliminación</h3>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Vas a eliminar el siguiente presupuesto:</p>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    <span className="font-medium">Mes:</span> {new Date(selectedBudget.month + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Presupuesto:</span> ${selectedBudget.expenseLimit.toFixed(2)}
                  </p>
                  <p className="text-gray-900">
                    <span className="font-medium">Ingresos:</span> ${selectedBudget.income.toFixed(2)}
                  </p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Esta acción no se puede deshacer. Todas las asignaciones por categoría también se eliminarán.
              </p>

              {error && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-red-50 rounded-lg text-red-700">
                  <AlertTriangle className="w-4 h-4" />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDeleteBudgetDialog(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleDeleteBudget}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
