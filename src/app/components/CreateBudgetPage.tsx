import { useState } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useBudgets } from "../contexts/BudgetContext";
import { DollarSign, Calendar, TrendingDown, AlertCircle } from "lucide-react";

export function CreateBudgetPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createBudget, getBudgetForMonth } = useBudgets();

  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [expenseLimit, setExpenseLimit] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: Record<string, string> = {};

    if (!month) {
      newErrors.month = 'El mes es obligatorio';
    }

    if (!income) {
      newErrors.income = 'Los ingresos son obligatorios';
    } else if (isNaN(Number(income)) || Number(income) <= 0) {
      newErrors.income = 'Los ingresos deben ser un número positivo';
    }

    if (!expenseLimit) {
      newErrors.expenseLimit = 'El límite de gastos es obligatorio';
    } else if (isNaN(Number(expenseLimit)) || Number(expenseLimit) <= 0) {
      newErrors.expenseLimit = 'El límite de gastos debe ser un número positivo';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (user && getBudgetForMonth(user.id, month)) {
      newErrors.month = 'Ya existe un presupuesto para este mes';
      setErrors(newErrors);
      return;
    }

    if (user) {
      createBudget({
        userId: user.id,
        month,
        income: Number(income),
        expenseLimit: Number(expenseLimit),
      });

      navigate('/budget-progress');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Crear Presupuesto Mensual</h1>
                <p className="text-gray-600">Organiza tus finanzas y controla tus gastos</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="month" className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Mes</span>
                </label>
                <input
                  type="month"
                  id="month"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setErrors({ ...errors, month: '' });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.month
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.month && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.month}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="income" className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span>Ingresos Esperados</span>
                </label>
                <input
                  type="number"
                  id="income"
                  step="0.01"
                  min="0"
                  value={income}
                  onChange={(e) => {
                    setIncome(e.target.value);
                    setErrors({ ...errors, income: '' });
                  }}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.income
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.income && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.income}</p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="expenseLimit" className="flex items-center space-x-2 text-sm text-gray-700 mb-2">
                  <TrendingDown className="w-4 h-4" />
                  <span>Límite de Gastos</span>
                </label>
                <input
                  type="number"
                  id="expenseLimit"
                  step="0.01"
                  min="0"
                  value={expenseLimit}
                  onChange={(e) => {
                    setExpenseLimit(e.target.value);
                    setErrors({ ...errors, expenseLimit: '' });
                  }}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                    errors.expenseLimit
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
                {errors.expenseLimit && (
                  <div className="flex items-center space-x-2 mt-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <p className="text-sm">{errors.expenseLimit}</p>
                  </div>
                )}
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Crear Presupuesto
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
