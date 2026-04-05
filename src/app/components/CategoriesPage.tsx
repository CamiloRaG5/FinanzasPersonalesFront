import { useState, useMemo, useEffect } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useTransactions } from "../contexts/TransactionContext";
import { Tag, Search } from "lucide-react";

const categoryIcons: Record<string, string> = {
  Alimentación: "🍔",
  Transporte: "🚌",
  Salud: "💊",
  Entretenimiento: "🎮",
  Educación: "📚",
  Vivienda: "🏠",
  Servicios: "💡",
  Tecnología: "💻",
  Ropa: "👕",
  Otros: "📁",
};

export function CategoriesPage() {
  const { categories, loadCategories } = useTransactions();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCategories();
  }, []);

  const filteredCategories = useMemo(() => {
    return categories.filter((category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [categories, searchTerm]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Tag className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Categorías</h1>
                <p className="text-gray-600">
                  {categories.length}{" "}
                  {categories.length === 1
                    ? "categoría disponible"
                    : "categorías disponibles"}
                </p>
              </div>
            </div>

            {/* Search */}
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

          {/* Categories grid */}
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
                {filteredCategories.map((category) => (
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
                        Disponible para ingresos y gastos
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Information card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg text-blue-900 mb-2">
              💡 Información sobre categorías
            </h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Las categorías te ayudan a organizar tus ingresos y gastos.</li>
              <li>• Puedes usar el buscador para encontrar una categoría más rápido.</li>
              <li>• Estas categorías vienen directamente desde el backend.</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}