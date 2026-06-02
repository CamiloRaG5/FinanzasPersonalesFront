import { useState, useEffect  } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { Bell, DollarSign, TrendingDown, AlertCircle, Save, Check } from "lucide-react";
import { toast } from "sonner";
import {
  updateAlertSettingsRequest,
  getAlertSettingsRequest,
  getAlertPreferencesRequest,
  updateAlertPreferenceRequest
} from "../services/alertsService";
import { useAuth } from "../contexts/AuthContext";

export function AlertSettingsPage() {
  // Estados visuales (NO persistentes - solo durante la sesión)

  const [expenseLimit, setExpenseLimit] = useState('');
  const [budgetThreshold, setBudgetThreshold] = useState('80');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [settings, setSettings] = useState(null);


  const ALERT_TYPE_MAP: Record<string, string> = {
  budget: "BUDGET_LIMIT",
  expense: "HIGH_EXPENSE",
  savings: "SAVINGS_REMINDER",
  monthly: "MONTHLY_REPORT",
};

  const handleSaveExpenseLimit = async () => {
  const newErrors: Record<string, string> = {};

  if (!expenseLimit) {
    newErrors.expenseLimit = "El límite de gasto es obligatorio";
    setErrors(newErrors);
    toast.error("Por favor ingresa un límite de gasto");
    return;
  }

  const limit = Number(expenseLimit);

  if (isNaN(limit) || limit <= 0) {
    newErrors.expenseLimit = "El valor debe ser un número válido mayor a cero";
    setErrors(newErrors);
    toast.error("El valor debe ser válido");
    return;
  }

  try {
    await updateAlertSettingsRequest(user.id, {
      expenseLimit: limit,
      budgetThreshold: Number(budgetThreshold),
    });

    setErrors({});
    toast.success("Límite de gasto guardado correctamente");
  } catch (err) {
    console.error(err);
    toast.error("Error guardando límite de gasto");
  }
};

  const handleSaveThreshold = async () => {
  const threshold = Number(budgetThreshold);

  if (isNaN(threshold) || threshold < 0 || threshold > 100) {
    toast.error("El porcentaje debe estar entre 0 y 100");
    return;
  }

  try {
    await updateAlertSettingsRequest(user.id, {
      expenseLimit: Number(expenseLimit || 0),
      budgetThreshold: threshold,
    });

    setBudgetThreshold(String(threshold));

    toast.success("Umbral de alerta guardado correctamente");
  } catch (err) {
    console.error(err);
    toast.error("Error guardando umbral");
  }
};

  const handleToggle = async (alertType: string) => {
  const backendType = ALERT_TYPE_MAP[alertType];

  if (!backendType) {
    toast.error("Tipo de alerta inválido");
    return;
  }

  const current = preferences[alertType] ?? false;
  const newValue = !current;

  // 1. UI inmediata (optimista)
  setPreferences(prev => ({
    ...prev,
    [alertType]: newValue
  }));

  try {
    // 2. Guardar en backend
    await updateAlertPreferenceRequest(
      user.id,
      backendType,
      newValue
    );

    toast.success("Preferencia actualizada");
  } catch (err) {
    console.error(err);

    // 3. rollback si falla
    setPreferences(prev => ({
      ...prev,
      [alertType]: current
    }));

    toast.error("Error actualizando preferencia");
  }
};


  useEffect(() => {
  if (!user?.id) return;

  const loadSettings = async () => {
    const data = await getAlertSettingsRequest(user.id);

    setExpenseLimit(String(data.expenseLimit ?? ""));
    setBudgetThreshold(String(data.budgetThreshold ?? 80));
  };

  loadSettings();
}, [user?.id]);


useEffect(() => {
  if (!user?.id) return;

  const loadPreferences = async () => {
    const data = await getAlertPreferencesRequest(user.id);

    const mapped: Record<string, boolean> = {};

    data.preferences.forEach((pref: any) => {
      mapped[pref.alertType] = pref.enabled;
    });

    setPreferences(mapped);
  };

  loadPreferences();
}, [user?.id]);

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
                  onClick={() => handleToggle('budget')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences['budget'] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences['budget'] ? 'translate-x-6' : 'translate-x-1'
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
                  onClick={() => handleToggle('expense')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences['expense'] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences['expense'] ? 'translate-x-6' : 'translate-x-1'
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
                  onClick={() => handleToggle('savings')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences['savings'] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences['savings'] ? 'translate-x-6' : 'translate-x-1'
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
                  onClick={() => handleToggle('monthly')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences['monthly'] ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences['monthly'] ? 'translate-x-6' : 'translate-x-1'
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
                <div className={`w-2 h-2 rounded-full ${preferences["budget"] ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Alertas de Presupuesto: {preferences["budget"] ? 'Activas' : 'Inactivas'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${preferences["expense"] ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Alertas de Gastos: {preferences["expense"] ? 'Activas' : 'Inactivas'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${preferences["savings"] ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Recordatorios de Ahorro: {preferences["savings"] ? 'Activos' : 'Inactivos'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${preferences["monthly"] ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">Reportes Mensuales: {preferences["monthly"] ? 'Activos' : 'Inactivos'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}