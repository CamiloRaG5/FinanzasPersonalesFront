import { useMemo, useState } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions } from "../contexts/TransactionContext";
import { useBudgets } from "../contexts/BudgetContext";
import { formatCurrency } from "../utils/formatCurrency";
import { Lightbulb, TrendingUp, Target, PiggyBank, Sparkles, Info, X } from "lucide-react";

interface Recommendation {
  id: string;
  category: string;
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
}

export function SavingsRecommendationsPage() {
  const { user } = useAuth();
  const { transactions } = useTransactions();
  const { budgets } = useBudgets();
  const [dismissedRecommendations, setDismissedRecommendations] = useState<Set<string>>(new Set());

  const userTransactions = useMemo(() => {
    return transactions.filter(t => t.userId === user?.id);
  }, [transactions, user?.id]);

  const expensesByCategory = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    userTransactions
      .filter(t => t.type === 'expense')
      .forEach(expense => {
        categoryMap[expense.category] = (categoryMap[expense.category] || 0) + expense.amount;
      });
    return categoryMap;
  }, [userTransactions]);

  const totalExpenses = useMemo(() => {
    return userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [userTransactions]);

  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];

    // Análisis por categoría
    Object.entries(expensesByCategory).forEach(([category, amount]) => {
      const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

      if (percentage > 30) {
        recs.push({
          id: `category-high-${category}`,
          category,
          title: `Gastos altos en ${category}`,
          description: `El ${percentage.toFixed(0)}% de tus gastos son en ${category}. Considera revisar esta categoría para identificar oportunidades de ahorro.`,
          potentialSavings: amount * 0.15,
          priority: 'high'
        });
      } else if (percentage > 20) {
        recs.push({
          id: `category-medium-${category}`,
          category,
          title: `Oportunidad en ${category}`,
          description: `${category} representa el ${percentage.toFixed(0)}% de tus gastos. Pequeños ajustes aquí pueden generar ahorros significativos.`,
          potentialSavings: amount * 0.10,
          priority: 'medium'
        });
      }
    });

    // Recomendación general si hay transacciones
    if (userTransactions.length > 0) {
      const avgExpensePerTransaction = totalExpenses / userTransactions.filter(t => t.type === 'expense').length;

      if (avgExpensePerTransaction > 100) {
        recs.push({
          id: 'avg-expense',
          category: 'General',
          title: 'Optimiza tus gastos regulares',
          description: `Tu gasto promedio por transacción es ${formatCurrency(avgExpensePerTransaction)}. Revisar gastos recurrentes puede ayudarte a identificar suscripciones o servicios que ya no utilizas.`,
          potentialSavings: avgExpensePerTransaction * 0.2,
          priority: 'medium'
        });
      }
    }

    // Recomendación de ahorro general
    if (totalExpenses > 0) {
      recs.push({
        id: 'general-savings',
        category: 'Ahorro',
        title: 'Establece una meta de ahorro mensual',
        description: 'Intenta ahorrar al menos el 10% de tus ingresos cada mes. Pequeñas cantidades consistentes generan grandes resultados a largo plazo.',
        potentialSavings: totalExpenses * 0.10,
        priority: 'high'
      });
    }

    return recs.filter(r => !dismissedRecommendations.has(r.id));
  }, [expensesByCategory, totalExpenses, userTransactions, dismissedRecommendations]);

  const dismissRecommendation = (id: string) => {
    setDismissedRecommendations(prev => new Set(prev).add(id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-purple-300 bg-purple-50';
      case 'medium': return 'border-blue-300 bg-blue-50';
      case 'low': return 'border-green-300 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <Target className="w-5 h-5 text-purple-600" />;
      case 'medium': return <Lightbulb className="w-5 h-5 text-blue-600" />;
      case 'low': return <TrendingUp className="w-5 h-5 text-green-600" />;
      default: return <Sparkles className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta prioridad';
      case 'medium': return 'Prioridad media';
      case 'low': return 'Baja prioridad';
      default: return '';
    }
  };

  const totalPotentialSavings = useMemo(() => {
    return recommendations.reduce((sum, r) => sum + r.potentialSavings, 0);
  }, [recommendations]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <PiggyBank className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Recomendaciones de Ahorro</h1>
                <p className="text-gray-600">Sugerencias personalizadas basadas en tus hábitos financieros</p>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          {recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg shadow p-6 mb-8 border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <Sparkles className="w-6 h-6 text-green-600" />
                <h2 className="text-lg text-gray-900">Potencial de Ahorro</h2>
              </div>
              <p className="text-3xl text-green-600 font-medium mb-2">
                {formatCurrency(totalPotentialSavings)}
              </p>
              <p className="text-sm text-gray-700">
                Implementando estas {recommendations.length} recomendaciones, podrías ahorrar aproximadamente esta cantidad mensualmente.
              </p>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <PiggyBank className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl text-gray-900 mb-2">No hay suficientes datos</h2>
              <p className="text-gray-600 mb-1">
                Necesitamos más información sobre tus transacciones para generar recomendaciones personalizadas
              </p>
              <p className="text-sm text-gray-500">
                Registra más transacciones para recibir sugerencias de ahorro basadas en tus hábitos
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className={`rounded-lg shadow border-2 ${getPriorityColor(rec.priority)} p-6 transition-all`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(rec.priority)}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg text-gray-900 font-medium">{rec.title}</h3>
                          <span className="px-2 py-1 bg-white rounded-full text-xs text-gray-600 border border-gray-200">
                            {rec.category}
                          </span>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">{rec.description}</p>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">
                              Ahorro potencial: <span className="font-medium text-green-600">
                                {formatCurrency(rec.potentialSavings)}
                              </span>
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {getPriorityLabel(rec.priority)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => dismissRecommendation(rec.id)}
                      className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Descartar recomendación"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info Notice */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-900">
                <span className="font-medium">Nota importante:</span> Estas recomendaciones son sugerencias basadas en el análisis de tus transacciones. Las cifras de ahorro potencial son estimaciones. Evalúa cada recomendación según tu situación personal y tus prioridades financieras.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
