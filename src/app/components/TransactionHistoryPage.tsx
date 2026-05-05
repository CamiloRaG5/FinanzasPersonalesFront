import { useMemo, useState } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import {
  Clock,
  Search,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit,
  X,
} from "lucide-react";
import { toast } from "sonner";

export function TransactionHistoryPage() {
  const { user } = useAuth();
  const {
    transactions,
    categories,
    deleteTransaction,
    updateTransactionCategory,
    loading,
  } = useTransactions();

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">(
    "all"
  );

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );

  const [newCategory, setNewCategory] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return sortedTransactions.filter((transaction) => {
      const searchText = searchTerm.toLowerCase().trim();

      const categoryText = String(transaction.category ?? "").toLowerCase();
      const descriptionText = String(
        transaction.description ?? ""
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        categoryText.includes(searchText) ||
        descriptionText.includes(searchText);

      const matchesType =
        filterType === "all" || transaction.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [sortedTransactions, searchTerm, filterType]);

  const handleDeleteClick = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setPasswordInput("");
    setErrorMessage("");
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (
    transactionId: string,
    currentCategoryId: string
  ) => {
    setSelectedTransaction(transactionId);
    setNewCategory(currentCategoryId);
    setPasswordInput("");
    setErrorMessage("");
    setEditDialogOpen(true);
  };

  const handleCancelDelete = () => {
    setSelectedTransaction(null);
    setPasswordInput("");
    setErrorMessage("");
    setDeleteDialogOpen(false);
  };

  const handleCancelEdit = () => {
    setSelectedTransaction(null);
    setNewCategory("");
    setPasswordInput("");
    setErrorMessage("");
    setEditDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTransaction || !user) return;

    if (!passwordInput.trim()) {
      setErrorMessage("Debes ingresar tu contraseña para confirmar");
      return;
    }

    try {
      setDeleting(true);

      const result = await deleteTransaction(selectedTransaction, user.id);

      if (result.success) {
        setDeleteDialogOpen(false);
        setSelectedTransaction(null);
        setPasswordInput("");
        setErrorMessage("");
        toast.success("Transacción eliminada correctamente");
      } else {
        setErrorMessage(result.message || "No se pudo eliminar la transacción");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al eliminar la transacción";

      setErrorMessage(message);
    } finally {
      setDeleting(false);
    }
  };

  const handleEditConfirm = async () => {
    if (!selectedTransaction || !user) return;

    if (!newCategory) {
      setErrorMessage("Debes seleccionar una categoría");
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage("Debes ingresar tu contraseña para confirmar");
      return;
    }

    try {
      setUpdating(true);

      const result = await updateTransactionCategory(
        selectedTransaction,
        newCategory,
        user.id
      );

      if (result.success) {
        setEditDialogOpen(false);
        setSelectedTransaction(null);
        setNewCategory("");
        setPasswordInput("");
        setErrorMessage("");
        toast.success("Categoría actualizada correctamente");
      } else {
        setErrorMessage(result.message || "No se pudo actualizar la categoría");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Error al actualizar la categoría";

      setErrorMessage(message);
    } finally {
      setUpdating(false);
    }
  };

  const formatMoney = (amount: number) => {
    return Number(amount).toLocaleString("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    });
  };

  const formatDate = (date: string) => {
    if (!date) return "Sin fecha";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <h1 className="text-3xl text-gray-900">
                  Historial de Transacciones
                </h1>
                <p className="text-gray-600">
                  {filteredTransactions.length} transacciones registradas
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Buscar por categoría o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  filterType === "all"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Todas
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFilterType("income")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "income"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Ingresos
                </button>

                <button
                  type="button"
                  onClick={() => setFilterType("expense")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filterType === "expense"
                      ? "bg-red-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Gastos
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Cargando transacciones...
            </div>
          )}

          {!loading && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />

                  <p className="text-gray-500 text-lg">
                    No hay transacciones registradas
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    Las transacciones aparecerán aquí cuando registres ingresos
                    o gastos
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-11 h-11 rounded-full flex items-center justify-center ${
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
                            {formatDate(transaction.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <p
                          className={`text-lg ${
                            transaction.type === "income"
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatMoney(transaction.amount)}
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditClick(
                              transaction.id,
                              transaction.categoryId
                            )
                          }
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar categoría"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteClick(transaction.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar transacción"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-gray-900">
                  Eliminar transacción
                </h2>

                <button
                  type="button"
                  onClick={handleCancelDelete}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                ¿Seguro que deseas eliminar esta transacción? Esta acción no se
                puede deshacer.
              </p>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              {errorMessage && (
                <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? "Eliminando..." : "Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {editDialogOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl text-gray-900">
                  Actualizar categoría
                </h2>

                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="mb-4">
                <label className="block text-sm mb-2 text-gray-700">
                  Nueva categoría
                </label>

                <select
                  value={newCategory}
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecciona una categoría</option>

                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage("");
                }}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              {errorMessage && (
                <p className="text-sm text-red-600 mb-3">{errorMessage}</p>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-60"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleEditConfirm}
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                >
                  {updating ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}