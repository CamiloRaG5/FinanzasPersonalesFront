import { useState, useMemo } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { TrendingUp, TrendingDown, History, Search, Trash2, Edit2, X, Check } from "lucide-react";
import { toast } from "sonner";

export function TransactionHistoryPage() {
  const { user } = useAuth();
  const { transactions, deleteTransaction, updateTransactionCategory, categories } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const userTransactions = useMemo(() => {
    return transactions
      .filter(t => t.userId === user?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user?.id]);

  const filteredTransactions = useMemo(() => {
    return userTransactions.filter(transaction => {
      const matchesSearch = transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || transaction.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [userTransactions, searchTerm, filterType]);

  const handleDeleteClick = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setPasswordInput('');
    setErrorMessage('');
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (transactionId: string, currentCategory: string) => {
    setSelectedTransaction(transactionId);
    setNewCategory(currentCategory);
    setErrorMessage('');
    setEditDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!selectedTransaction || !user) return;

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const foundUser = users.find((u: any) => u.email === user.email && u.password === passwordInput);

    if (!foundUser) {
      setErrorMessage('Contraseña incorrecta');
      return;
    }

    const success = deleteTransaction(selectedTransaction, user.id);

    if (success) {
      setDeleteDialogOpen(false);
      setSelectedTransaction(null);
      setPasswordInput('');
      toast.success('Transacción eliminada correctamente');
    } else {
      setErrorMessage('No se pudo eliminar la transacción');
    }
  };

  const handleEditConfirm = () => {
    if (!selectedTransaction || !user) return;

    const success = updateTransactionCategory(selectedTransaction, newCategory, user.id);

    if (success) {
      setEditDialogOpen(false);
      setSelectedTransaction(null);
      setNewCategory('');
      toast.success('Categoría actualizada correctamente');
    } else {
      setErrorMessage('No se pudo actualizar la categoría');
    }
  };

  const selectedTransactionData = selectedTransaction
    ? transactions.find(t => t.id === selectedTransaction)
    : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <History className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Historial de Transacciones</h1>
                <p className="text-gray-600">
                  {userTransactions.length} {userTransactions.length === 1 ? 'transacción registrada' : 'transacciones registradas'}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por categoría..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      filterType === 'all'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setFilterType('income')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      filterType === 'income'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Ingresos
                  </button>
                  <button
                    onClick={() => setFilterType('expense')}
                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                      filterType === 'expense'
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Gastos
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions list */}
          <div className="bg-white rounded-lg shadow">
            {filteredTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">
                  {userTransactions.length === 0 
                    ? 'No hay transacciones disponibles'
                    : 'No se encontraron transacciones'}
                </p>
                <p className="text-sm text-gray-400">
                  {userTransactions.length === 0 
                    ? 'Comienza agregando tu primer ingreso o gasto'
                    : 'Intenta con otro filtro o búsqueda'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-6 h-6 text-green-600" />
                          ) : (
                            <TrendingDown className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            <p className="text-gray-900">{transaction.category}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.date).toLocaleDateString('es-ES', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className={`text-xl ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                        </p>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(transaction.id, transaction.category)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar categoría"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(transaction.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar transacción"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary stats */}
          {filteredTransactions.length > 0 && (
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h3 className="text-lg text-gray-900 mb-4">Resumen del Filtro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Transacciones</p>
                  <p className="text-2xl text-blue-600">{filteredTransactions.length}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Ingresos</p>
                  <p className="text-2xl text-green-600">
                    ${filteredTransactions
                      .filter(t => t.type === 'income')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Gastos</p>
                  <p className="text-2xl text-red-600">
                    ${filteredTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        {deleteDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">Confirmar Eliminación</h3>

              {selectedTransactionData && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Vas a eliminar la siguiente transacción:</p>
                  <div className="space-y-1">
                    <p className="text-gray-900">
                      <span className="font-medium">Tipo:</span> {selectedTransactionData.type === 'income' ? 'Ingreso' : 'Gasto'}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Categoría:</span> {selectedTransactionData.category}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Monto:</span> ${selectedTransactionData.amount.toFixed(2)}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Fecha:</span> {new Date(selectedTransactionData.date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4">Para confirmar, ingresa tu contraseña:</p>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMessage('');
                }}
                placeholder="Contraseña"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />

              {errorMessage && (
                <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setDeleteDialogOpen(false);
                    setSelectedTransaction(null);
                    setPasswordInput('');
                    setErrorMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Category Dialog */}
        {editDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h3 className="text-xl text-gray-900 mb-4">Editar Categoría</h3>

              {selectedTransactionData && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Transacción actual:</p>
                  <div className="space-y-1">
                    <p className="text-gray-900">
                      <span className="font-medium">Categoría actual:</span> {selectedTransactionData.category}
                    </p>
                    <p className="text-gray-900">
                      <span className="font-medium">Monto:</span> ${selectedTransactionData.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}

              <label className="block text-sm text-gray-700 mb-2">Nueva categoría:</label>
              <select
                value={newCategory}
                onChange={(e) => {
                  setNewCategory(e.target.value);
                  setErrorMessage('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {errorMessage && (
                <p className="text-sm text-red-600 mb-4">{errorMessage}</p>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setEditDialogOpen(false);
                    setSelectedTransaction(null);
                    setNewCategory('');
                    setErrorMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleEditConfirm}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
