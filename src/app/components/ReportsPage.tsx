import { useState, useMemo } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { formatCurrency } from "../utils/formatCurrency";
import { FileText, Calendar, TrendingUp, TrendingDown, Wallet, Download, Info } from "lucide-react";
import { toast } from "sonner";

type PeriodType = 'week' | 'month' | 'year';

export function ReportsPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const getPeriodDates = () => {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (selectedPeriod) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    if (customStartDate && customEndDate) {
      return {
        start: new Date(customStartDate),
        end: new Date(customEndDate)
      };
    }

    return { start: startDate, end: endDate };
  };

  const { start: periodStart, end: periodEnd } = getPeriodDates();

  const reportTransactions = useMemo(() => {
    return transactions
      .filter(t => {
        if (t.userId !== user?.id) return false;
        const transactionDate = new Date(t.date);
        return transactionDate >= periodStart && transactionDate <= periodEnd;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, user?.id, periodStart, periodEnd]);

  const reportSummary = useMemo(() => {
    const income = reportTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = reportTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: reportTransactions.length
    };
  }, [reportTransactions]);

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'week': return 'Última semana';
      case 'month': return 'Último mes';
      case 'year': return 'Último año';
    }
  };

  const handleGenerateReport = () => {
    toast.success('Reporte generado correctamente');
  };

  const handleDownloadReport = () => {
    toast.info('Funcionalidad de descarga disponible próximamente');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Reportes Financieros</h1>
                <p className="text-gray-600">Analiza tus movimientos por períodos de tiempo</p>
              </div>
            </div>

            {/* Period Selection */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h2 className="text-lg text-gray-900 mb-4">Seleccionar Período</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button
                  onClick={() => setSelectedPeriod('week')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPeriod === 'week'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                    selectedPeriod === 'week' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedPeriod === 'week' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Semanal
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Últimos 7 días</p>
                </button>

                <button
                  onClick={() => setSelectedPeriod('month')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPeriod === 'month'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                    selectedPeriod === 'month' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedPeriod === 'month' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Mensual
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Últimos 30 días</p>
                </button>

                <button
                  onClick={() => setSelectedPeriod('year')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedPeriod === 'year'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Calendar className={`w-6 h-6 mx-auto mb-2 ${
                    selectedPeriod === 'year' ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    selectedPeriod === 'year' ? 'text-blue-900' : 'text-gray-700'
                  }`}>
                    Anual
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Últimos 12 meses</p>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fecha inicio (opcional)</label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Fecha fin (opcional)</label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mt-4 flex space-x-3">
                <button
                  onClick={handleGenerateReport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Generar Reporte
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar</span>
                </button>
              </div>
            </div>
          </div>

          {/* Report Summary */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-gray-900">Resumen del Reporte</h2>
              <span className="text-sm text-gray-600">{getPeriodLabel()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Transacciones</p>
                </div>
                <p className="text-2xl text-gray-900">{reportSummary.transactionCount}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-sm text-green-600">Ingresos</p>
                </div>
                <p className="text-2xl text-green-600">{formatCurrency(reportSummary.income)}</p>
              </div>

              <div className="p-4 bg-amber-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-amber-600" />
                  <p className="text-sm text-amber-600">Gastos</p>
                </div>
                <p className="text-2xl text-amber-600">{formatCurrency(reportSummary.expenses)}</p>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Wallet className="w-4 h-4 text-blue-600" />
                  <p className="text-sm text-blue-600">Balance</p>
                </div>
                <p className={`text-2xl ${reportSummary.balance >= 0 ? 'text-blue-600' : 'text-purple-600'}`}>
                  {formatCurrency(reportSummary.balance)}
                </p>
              </div>
            </div>
          </div>

          {/* Report Details */}
          {reportTransactions.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl text-gray-900 mb-2">No hay movimientos financieros</h2>
              <p className="text-gray-600 mb-1">
                No existen transacciones en el período seleccionado
              </p>
              <p className="text-sm text-gray-500">
                Selecciona otro período o registra nuevas transacciones
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg text-gray-900">Detalle de Transacciones</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {periodStart.toLocaleDateString('es-ES')} - {periodEnd.toLocaleDateString('es-ES')}
                </p>
              </div>

              <div className="divide-y divide-gray-200">
                {reportTransactions.map((transaction) => (
                  <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          transaction.type === 'income' ? 'bg-green-100' : 'bg-amber-100'
                        }`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          ) : (
                            <TrendingDown className="w-5 h-5 text-amber-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <p className="text-gray-900">{transaction.category}</p>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              transaction.type === 'income'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}>
                              {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(transaction.date).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <p className={`text-lg font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-amber-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Info Notice */}
          {reportTransactions.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900">
                  Este reporte muestra todas las transacciones registradas en el período seleccionado. Puedes generar reportes personalizados seleccionando fechas específicas.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
