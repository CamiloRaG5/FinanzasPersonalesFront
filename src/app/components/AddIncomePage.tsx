import { useState } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useCurrencyInput } from "../hooks/useCurrencyInput";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function AddIncomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addTransaction, categories } = useTransactions();
  const amountInput = useCurrencyInput();

  const [formData, setFormData] = useState({
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validar monto obligatorio
    if (!amountInput.rawValue) {
      setErrors({ amount: 'El campo es obligatorio' });
      toast.error('El campo monto es obligatorio');
      return;
    }

    // Validar formato numérico
    const amount = parseFloat(amountInput.rawValue);
    if (isNaN(amount)) {
      setErrors({ amount: 'El formato es inválido' });
      toast.error('El formato del monto es inválido');
      return;
    }

    // Validar monto mayor a 0
    if (amount <= 0) {
      setErrors({ amount: 'El monto debe ser mayor a cero' });
      toast.error('El monto debe ser mayor a cero');
      return;
    }

    // Validar categoría obligatoria
    if (!formData.category) {
      setErrors({ category: 'Seleccione una categoría' });
      toast.error('Seleccione una categoría');
      return;
    }

    if (!user) return;

    // Simular tiempo de guardado (menos de 2 segundos según requisitos)
    const startTime = Date.now();

    addTransaction({
      type: 'income',
      amount,
      category: formData.category,
      date: formData.date,
      userId: user.id,
    });

    const endTime = Date.now();
    const elapsed = endTime - startTime;

    console.log(`Transacción guardada en ${elapsed}ms`);

    toast.success('Ingreso registrado correctamente');
    navigate('/dashboard');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({});
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Registrar Ingreso</h1>
                <p className="text-sm text-gray-600">Añade un nuevo ingreso a tu cuenta</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="amount" className="block text-sm mb-2 text-gray-700">
                  Monto *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="text"
                    id="amount"
                    name="amount"
                    value={amountInput.displayValue}
                    onChange={(e) => {
                      amountInput.handleChange(e);
                      setErrors({});
                    }}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm mb-2 text-gray-700">
                  Categoría *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-sm text-red-600 mt-1">{errors.category}</p>
                )}
              </div>

              <div>
                <label htmlFor="date" className="block text-sm mb-2 text-gray-700">
                  Fecha *
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Guardar Ingreso
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
