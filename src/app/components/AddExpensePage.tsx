import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useTransactions } from "../contexts/TransactionContext";
import { TrendingDown } from "lucide-react";
import { toast } from "sonner";

export function AddExpensePage() {
  const navigate = useNavigate();
  const { addExpense, categories } = useTransactions();

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    transactionDate: new Date().toISOString().split("T")[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.amount) {
      setErrors({ amount: "El campo es obligatorio" });
      toast.error("El campo monto es obligatorio");
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount)) {
      setErrors({ amount: "El formato es inválido" });
      toast.error("El formato del monto es inválido");
      return;
    }

    if (amount <= 0) {
      setErrors({ amount: "El monto debe ser mayor a cero" });
      toast.error("El monto debe ser mayor a cero");
      return;
    }

    if (!formData.categoryId) {
      setErrors({ categoryId: "Seleccione una categoría" });
      toast.error("Seleccione una categoría");
      return;
    }

    if (!formData.description.trim()) {
      setErrors({ description: "La descripción es obligatoria" });
      toast.error("La descripción es obligatoria");
      return;
    }

    const result = await addExpense(
      amount,
      formData.categoryId,
      formData.description,
      formData.transactionDate
    );

    if (result.success) {
      toast.success("Gasto registrado correctamente");
      navigate("/dashboard");
    } else {
      toast.error(result.message || "No se pudo registrar el gasto");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl text-gray-900">Registrar Gasto</h1>
                <p className="text-sm text-gray-600">
                  Añade un nuevo gasto a tu cuenta
                </p>
              </div>
            </div>

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
                    type="text"
                    id="amount"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
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
                  htmlFor="description"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Descripción *
                </label>
                <input
                  type="text"
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: Compra de comida"
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.description}
                  </p>
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
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
                  htmlFor="transactionDate"
                  className="block text-sm mb-2 text-gray-700"
                >
                  Fecha *
                </label>
                <input
                  type="date"
                  id="transactionDate"
                  name="transactionDate"
                  value={formData.transactionDate}
                  onChange={handleChange}
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Guardar Gasto
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