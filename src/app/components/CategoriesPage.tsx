import { useState, useMemo } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useTransactions } from "../contexts/TransactionContext";
import { Tag, Search } from "lucide-react";

export function CategoriesPage() {
  const { categories, loading, error, reloadCategories } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCategories = useMemo(() => {
    const cleanSearch = searchTerm.toLowerCase().trim();

    if (!cleanSearch) {
      return categories;
    }

    return categories.filter((category) =>
      category.name.toLowerCase().includes(cleanSearch)
    );
  }, [categories, searchTerm]);

  const categoryIcons: Record<string, string> = {
    Alimentación: "🍔",
    Transporte: "🚗",
    Salud: "⚕️",
    Entretenimiento: "🎮",
    Otros: "📦",
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Tag className="w-6 h-6 text-purple-600" />
                </div>

                <div>
                  <h1 className="text-3xl text-gray-900">
                    Categorías Disponibles
                  </h1>
                  <p className="text-gray-600">
                    {categories.length} categorías cargadas desde el backend
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={reloadCategories}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Recargar
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  placeholder="Buscar categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-red-100 border border-red-300 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {loading && (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              Cargando categorías...
            </div>
          )}

          {!loading && (
            <div className="bg-white rounded-lg shadow">
              {filteredCategories.length === 0 ? (
                <div className="p-12 text-center">
                  <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">
                    No hay categorías disponibles
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    No se encontraron categorías que coincidan con tu búsqueda
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-6">
                  {filteredCategories.map((category, index) => (
                    <div
                      key={category.id}
                      className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border-2 border-purple-100 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="text-5xl mb-3">
                          {categoryIcons[category.name] || "📁"}
                        </div>

                        <h3 className="text-lg text-gray-900">
                          {category.name}
                        </h3>

                        <p className="text-sm text-gray-600 mt-2">
                          Categoría #{index + 1}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          ID: {category.id}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg text-blue-900 mb-2">
              💡 Información sobre categorías
            </h3>

            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • Las categorías se cargan desde el backend, no desde el
                frontend.
              </li>
              <li>
                • Al registrar ingresos o gastos se envía el categoryId.
              </li>
              <li>
                • En pantalla mostramos category.name para evitar errores de
                React.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}