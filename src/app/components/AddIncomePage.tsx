import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { TrendingUp } from "lucide-react";
import { toast } from "sonner";

export function AddIncomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addTransaction, categories } = useTransactions();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors({});
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!user) {
      toast.error("No hay usuario autenticado");
      return;
    }

    if (!formData.amount) {
      setErrors({ amount: "El campo monto es obligatorio" });
      toast.error("El campo monto es obligatorio");
      return;
    }

    const amount = Number(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      setErrors({ amount: "El monto debe ser mayor a cero" });
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: "Seleccione una categoría" });
      toast.error("Seleccione una categoría");
      return;
    }

    try {
      setLoading(true);

      const result = await addTransaction({
        type: "income",
        amount,
        description: formData.description,
        transactionDate: formData.date,
        categoryId: formData.categoryId,
        userId: user.id,
      });

      if (result.success) {
        toast.success("Ingreso registrado correctamente");
        navigate("/dashboard");
      } else {
        toast.error(result.message || "No se pudo registrar el ingreso");
        setErrors({
          general: result.message || "No se pudo registrar el ingreso",
        });
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al registrar el ingreso";

      toast.error(message);
      setErrors({ general: message });
    } finally {
      setLoading(false);
    }
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
                <p className="text-sm text-gray-600">
                  Añade un nuevo ingreso a tu cuenta
                </p>
              </div>
            </div>

            {errors.general && (
              <div className="mb-4 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-sm">
                {errors.general}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="amount"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Monto *
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    $
                  </span>

                  <input
                    type="number"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                      errors.amount ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>

                {errors.amount && (
                  <p className="text-sm text-red-600 mt-1">{errors.amount}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="categoryId"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Categoría *
                </label>

                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
                    errors.categoryId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                {errors.categoryId && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.categoryId}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Descripción
                </label>

                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Ej: salario, venta, pago recibido"
                />
              </div>

              <div>
                <label
                  htmlFor="date"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Fecha *
                </label>

                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Guardando..." : "Guardar Ingreso"}
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
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