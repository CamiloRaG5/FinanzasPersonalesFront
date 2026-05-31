import { useState } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { Bell, DollarSign, TrendingDown, AlertCircle, Save, Check } from "lucide-react";
import { toast } from "sonner";

export function AlertSettingsPage() {
  // Estados visuales (NO persistentes - solo durante la sesión)
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [expenseAlerts, setExpenseAlerts] = useState(true);
  const [savingsReminders, setSavingsReminders] = useState(false);
  const [monthlyReports, setMonthlyReports] = useState(true);

  const [expenseLimit, setExpenseLimit] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('80');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSaveExpenseLimit = () => {
    const newErrors: Record<string, string> = {};

    if (!expenseLimit) {
      newErrors.expenseLimit = 'El límite de gasto es obligatorio';
      setErrors(newErrors);
      toast.error('Por favor ingresa un límite de gasto');
      return;
    }

    const limit = Number(expenseLimit);

    if (isNaN(limit)) {
      newErrors.expenseLimit = 'El valor debe ser un número válido';
      setErrors(newErrors);
      toast.error('El valor debe ser un número válido');
      return;
    }

    if (limit <= 0) {
      newErrors.expenseLimit = 'El límite debe ser mayor a cero';
      setErrors(newErrors);
      toast.error('El límite debe ser mayor a cero');
      return;
    }

    setErrors({});
    toast.success(`Límite de gasto configurado: ${limit}`);
  };

  const handleSaveThreshold = () => {
    const threshold = Number(budgetThreshold);

    if (isNaN(threshold) || threshold < 0 || threshold > 100) {
      toast.error('El porcentaje debe estar entre 0 y 100');
      return;
    }

    toast.success(`Umbral de alerta configurado: ${threshold}%`);
  };

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>, currentValue: boolean, name: string) => {
    setter(!currentValue);
    toast.info(`Alertas de ${name} ${!currentValue ? 'activadas' : 'desactivadas'}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Configuración de Alertas</h1>
                <p className="text-gray-600">Personaliza las notificaciones financieras que deseas recibir</p>
              </div>
            </div>
          </div>

          {/* Alert Toggles */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg text-gray-900">Tipos de Alertas</h2>
              <p className="text-sm text-gray-600 mt-1">Activa o desactiva las alertas que deseas recibir</p>
            </div>

            <div className="divide-y divide-gray-200">
              {/* Budget Alerts */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Alertas de Presupuesto</h3>
                    <p className="text-sm text-gray-600">Notificaciones cuando te acerques o excedas tu presupuesto</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setBudgetAlerts, budgetAlerts, 'presupuesto')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    budgetAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      budgetAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Expense Alerts */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Alertas de Gastos Altos</h3>
                    <p className="text-sm text-gray-600">Notificaciones cuando registres gastos significativos</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setExpenseAlerts, expenseAlerts, 'gastos altos')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    expenseAlerts ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      expenseAlerts ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Savings Reminders */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingDown className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Recordatorios de Ahorro</h3>
                    <p className="text-sm text-gray-600">Sugerencias y recordatorios para mejorar tus hábitos de ahorro</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setSavingsReminders, savingsReminders, 'ahorro')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    savingsReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      savingsReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Monthly Reports */}
              <div className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 font-medium">Reportes Mensuales</h3>
                    <p className="text-sm text-gray-600">Resúmenes automáticos de tus finanzas cada mes</p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle(setMonthlyReports, monthlyReports, 'reportes mensuales')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    monthlyReports ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      monthlyReports ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Expense Limit Configuration */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg text-gray-900">Límite de Gasto</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configura un límite de gasto y recibe alertas cuando lo alcances
              </p>
            </div>

            <div className="p-6">
              <div className="max-w-md">
                <label htmlFor="expenseLimit" className="block text-sm text-gray-700 mb-2">
                  Límite de Gasto Mensual
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
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
                        className={`w-full pl-8 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                          errors.expenseLimit
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                        }`}
                      />
                    </div>
                    {errors.expenseLimit && (
                      <p className="text-sm text-red-600 mt-1">{errors.expenseLimit}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSaveExpenseLimit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Serás alertado cuando tus gastos mensuales alcancen este límite
                </p>
              </div>
            </div>
          </div>

          {/* Budget Threshold */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg text-gray-900">Umbral de Alerta de Presupuesto</h2>
              <p className="text-sm text-gray-600 mt-1">
                Define en qué porcentaje del presupuesto deseas recibir una alerta preventiva
              </p>
            </div>

            <div className="p-6">
              <div className="max-w-md">
                <label htmlFor="budgetThreshold" className="block text-sm text-gray-700 mb-2">
                  Porcentaje de Alerta
                </label>
                <div className="flex space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <input
                        type="number"
                        id="budgetThreshold"
                        min="0"
                        max="100"
                        value={budgetThreshold}
                        onChange={(e) => setBudgetThreshold(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                    </div>
                  </div>
                  <button
                    onClick={handleSaveThreshold}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recibirás una alerta cuando alcances el {budgetThreshold}% de tu presupuesto mensual
                </p>
              </div>
            </div>
          </div>

          {/* Info Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-medium">Nota:</span> Esta configuración simula el comportamiento de alertas financieras. En un entorno de producción, estas preferencias se almacenarían de forma persistente y las alertas se generarían automáticamente según tus movimientos financieros.
              </p>
            </div>
          </div>

          {/* Active Status Summary */}
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center space-x-2">
              <Check className="w-5 h-5 text-green-600" />
              <span>Estado Actual de Alertas</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${budgetAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Alertas de Presupuesto: {budgetAlerts ? 'Activas' : 'Inactivas'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${expenseAlerts ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Alertas de Gastos: {expenseAlerts ? 'Activas' : 'Inactivas'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${savingsReminders ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Recordatorios de Ahorro: {savingsReminders ? 'Activos' : 'Inactivos'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${monthlyReports ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Reportes Mensuales: {monthlyReports ? 'Activos' : 'Inactivos'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
