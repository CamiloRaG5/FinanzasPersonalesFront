import { useMemo, useState } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useBudgets } from "../contexts/BudgetContext";
import { formatCurrency } from "../utils/formatCurrency";
import { FinancialAlert } from "./FinancialAlert";
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart, AlertTriangle, Heart, Sparkles, TrendingDown as TrendingDownIcon, FileText, Bell, PiggyBank, DollarSign } from "lucide-react";
import { Link } from "react-router";

export function DashboardPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { getBudgetForMonth } = useBudgets();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

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

  const currentMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const currentBudget = useMemo(() => {
    if (!user) return null;
    return getBudgetForMonth(user.id, currentMonth);
  }, [user, currentMonth, getBudgetForMonth]);

  const currentMonthExpenses = useMemo(() => {
    return userTransactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [userTransactions, currentMonth]);

  const currentMonthIncome = useMemo(() => {
    return userTransactions
      .filter(t => t.type === 'income' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [userTransactions, currentMonth]);

  const remainingBudget = currentBudget ? currentBudget.expenseLimit - currentMonthExpenses : 0;
  const isOverBudget = currentBudget ? currentMonthExpenses > currentBudget.expenseLimit : false;
  const budgetProgress = currentBudget ? (currentMonthExpenses / currentBudget.expenseLimit) * 100 : 0;

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const isAlertDismissed = (alertId: string) => {
    return dismissedAlerts.has(alertId);
  };

  // Detectar situaciones que generan alertas
  const highExpenseTransactions = userTransactions
    .filter(t => t.type === 'expense' && t.amount > 1000)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 1);

  const isApproachingBudgetLimit = currentBudget && budgetProgress >= 80 && budgetProgress < 100;
  const hasPositiveBalance = balance > 0;
  const hasNoTransactions = userTransactions.length === 0;

  // Alertas de bajo saldo - Escenarios según historia de usuario
  // Escenario 1: Ingresos inferiores al valor mínimo establecido
  const hasLowIncome = currentBudget && currentMonthIncome > 0 && currentMonthIncome < currentBudget.income;
  const incomeDeficit = currentBudget && hasLowIncome ? currentBudget.income - currentMonthIncome : 0;

  // Escenario 2: Ingresos exactamente igual al valor mínimo establecido
  const hasReachedMinimumIncome = currentBudget && currentMonthIncome > 0 && currentMonthIncome === currentBudget.income;

  // Escenario 3: Ingresos suficientes (no se genera alerta)
  const hasSufficientIncome = currentBudget && currentMonthIncome >= currentBudget.income;

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

          {/* Financial Alerts */}
          <div className="space-y-4 mb-8">
            {/* ALERTA POR BAJO SALDO - Escenario 1: Ingresos inferiores al mínimo */}
            {hasLowIncome && !isAlertDismissed('low-income') && (
              <FinancialAlert
                type="warning"
                title="Ingresos por debajo del presupuesto"
                message={`Tus ingresos de ${formatCurrency(currentMonthIncome)} están por debajo del ingreso esperado de ${formatCurrency(currentBudget!.income)}. Te faltan ${formatCurrency(incomeDeficit)} para alcanzar tu meta.`}
                recommendation="Revisa tus fuentes de ingreso y considera oportunidades adicionales para alcanzar tu presupuesto mensual. Recuerda que es normal tener variaciones y cada esfuerzo cuenta."
                icon={<DollarSign className="w-5 h-5" />}
                onClose={() => dismissAlert('low-income')}
              />
            )}

            {/* ALERTA POR BAJO SALDO - Escenario 2: Ingresos alcanzaron el mínimo exacto */}
            {hasReachedMinimumIncome && !isAlertDismissed('reached-minimum-income') && (
              <FinancialAlert
                type="info"
                title="Has alcanzado tu ingreso mínimo"
                message={`Tus ingresos de ${formatCurrency(currentMonthIncome)} han alcanzado exactamente el ingreso esperado de ${formatCurrency(currentBudget!.income)} para este mes.`}
                recommendation="Mantén este nivel de ingresos para cumplir con tu planificación financiera mensual. ¡Vas por buen camino!"
                icon={<DollarSign className="w-5 h-5" />}
                onClose={() => dismissAlert('reached-minimum-income')}
              />
            )}

            {/* Alerta: Bienvenida para nuevos usuarios */}
            {hasNoTransactions && !isAlertDismissed('welcome') && (
              <FinancialAlert
                type="gentle"
                title="¡Bienvenido a tu espacio financiero!"
                message="Estamos aquí para acompañarte en tu camino hacia el bienestar financiero. Tómate tu tiempo para explorar y registrar tus primeras transacciones."
                recommendation="Comienza registrando un ingreso o gasto reciente. No hay prisa, avanza a tu propio ritmo."
                icon={<Heart className="w-5 h-5" />}
                onClose={() => dismissAlert('welcome')}
              />
            )}

            {/* Alerta: Balance positivo */}
            {hasPositiveBalance && !hasNoTransactions && !isAlertDismissed('positive-balance') && (
              <FinancialAlert
                type="success"
                title="¡Vas muy bien!"
                message="Tu balance es positivo. Esto refleja tu esfuerzo y dedicación en mantener tus finanzas saludables."
                recommendation="Considera destinar una pequeña parte de tu balance al ahorro. Cada paso cuenta, por pequeño que sea."
                icon={<Sparkles className="w-5 h-5" />}
                onClose={() => dismissAlert('positive-balance')}
              />
            )}

            {/* Alerta: Acercándose al límite del presupuesto */}
            {isApproachingBudgetLimit && !isAlertDismissed('approaching-limit') && (
              <FinancialAlert
                type="warning"
                title="Tu presupuesto está cerca del límite"
                message={`Has utilizado el ${budgetProgress.toFixed(0)}% de tu presupuesto mensual. Es un buen momento para revisar tus gastos próximos con calma.`}
                recommendation="Revisa las categorías donde más has gastado este mes. Quizás puedas hacer pequeños ajustes sin que afecte tu día a día."
                onClose={() => dismissAlert('approaching-limit')}
              />
            )}

            {/* Alerta: Presupuesto excedido */}
            {isOverBudget && !isAlertDismissed('over-budget') && (
              <FinancialAlert
                type="gentle"
                title="Has superado el límite de tu presupuesto"
                message="El progreso financiero ha excedido el valor establecido para este período. Lo importante es que estás aquí, siendo consciente de tu situación."
                recommendation="Revisa tu planificación financiera y considera ajustar los límites del próximo período según tus necesidades reales. Cada ajuste te acerca a un presupuesto más realista."
                icon={<Heart className="w-5 h-5" />}
                onClose={() => dismissAlert('over-budget')}
              />
            )}

            {/* Alerta: Gasto alto detectado */}
            {highExpenseTransactions.length > 0 && !isAlertDismissed('high-expense') && (
              <FinancialAlert
                type="info"
                title="Gasto significativo registrado"
                message={`Hemos notado un gasto de ${formatCurrency(highExpenseTransactions[0].amount)} en ${highExpenseTransactions[0].category}. Solo queremos que estés al tanto.`}
                recommendation="Si este gasto era planeado, ¡excelente! Si fue inesperado, considera revisar tu presupuesto para los próximos días. Estamos aquí para ayudarte."
                icon={<TrendingDownIcon className="w-5 h-5" />}
                onClose={() => dismissAlert('high-expense')}
              />
            )}

            {/* Alerta: Sin presupuesto */}
            {!currentBudget && !hasNoTransactions && !isAlertDismissed('no-budget') && (
              <FinancialAlert
                type="info"
                title="Crea tu primer presupuesto mensual"
                message="Un presupuesto te ayuda a visualizar tus metas financieras sin presión. Es una herramienta de apoyo, no una restricción."
                recommendation="Define un presupuesto realista basado en tus ingresos y gastos habituales. Puedes ajustarlo cuando quieras, no hay problema en hacer cambios."
                onClose={() => dismissAlert('no-budget')}
              />
            )}
          </div>

          {/* Budget Widget */}
          {!currentBudget && (
            <div className="mb-8 bg-blue-50 border-2 border-blue-500 rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <PieChart className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900 mb-1">No tienes presupuesto para este mes</h3>
                    <p className="text-sm text-gray-600">Crea un presupuesto mensual para controlar mejor tus gastos</p>
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
            <div className={`mb-8 rounded-lg shadow p-6 ${isOverBudget ? 'bg-purple-50 border-2 border-purple-300' : 'bg-white'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isOverBudget ? 'bg-purple-100' : 'bg-blue-100'}`}>
                    <PieChart className={`w-6 h-6 ${isOverBudget ? 'text-purple-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg text-gray-900">Presupuesto de {new Date(currentMonth + '-01').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}</h3>
                    <p className="text-sm text-gray-600">Actualización automática</p>
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
                  <p className="text-sm text-gray-600 mb-1">Presupuesto Total</p>
                  <p className="text-xl text-blue-600">{formatCurrency(currentBudget.expenseLimit)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Gastado</p>
                  <p className="text-xl text-red-600">{formatCurrency(currentMonthExpenses)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Presupuesto Restante</p>
                  <p className={`text-xl ${isOverBudget ? 'text-purple-600' : 'text-green-600'}`}>
                    {formatCurrency(remainingBudget)}
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
                      isOverBudget ? 'bg-purple-500' : budgetProgress > 80 ? 'bg-amber-400' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                  />
                </div>
              </div>

              {isOverBudget && (
                <div className="flex items-center space-x-2 mt-4 p-3 bg-purple-100 rounded-lg text-purple-800">
                  <Heart className="w-5 h-5" />
                  <p className="text-sm">Has superado el límite establecido. Revisa tus notificaciones para más información.</p>
                </div>
              )}
            </div>
          )}

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
                {formatCurrency(balance)}
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
                {formatCurrency(totalIncome)}
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
                {formatCurrency(totalExpense)}
              </p>
            </div>
          </div>

          {/* Quick actions */}
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
                    <p className="text-sm text-gray-600">Planifica tus finanzas mensuales</p>
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
                    <p className="text-sm text-gray-600">Revisa tu progreso mensual</p>
                  </div>
                </Link>
              )}
            </div>
          </div>

          {/* Sprint 3 Features */}
          <div className="mb-8">
            <h2 className="text-xl text-gray-900 mb-4">Herramientas Financieras</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/reports"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Reportes</h3>
                  <p className="text-sm text-gray-600">Genera reportes por períodos</p>
                </div>
              </Link>

              <Link
                to="/savings"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <PiggyBank className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Recomendaciones</h3>
                  <p className="text-sm text-gray-600">Tips de ahorro personalizados</p>
                </div>
              </Link>

              <Link
                to="/alert-settings"
                className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow flex items-center space-x-4"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bell className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-1">Alertas</h3>
                  <p className="text-sm text-gray-600">Configura notificaciones</p>
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
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
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
