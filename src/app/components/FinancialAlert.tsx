import React from "react";
import { X, Lightbulb, Info } from "lucide-react";

export type AlertType = 'info' | 'success' | 'warning' | 'gentle';

interface FinancialAlertProps {
  type?: AlertType;
  title: string;
  message: string;
  recommendation?: string;
  onClose?: () => void;
  icon?: React.ReactNode;
}

export function FinancialAlert({
  type = 'info',
  title,
  message,
  recommendation,
  onClose,
  icon
}: FinancialAlertProps) {
  const getAlertStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-900',
          message: 'text-green-700',
          recommendation: 'bg-green-100 text-green-800'
        };
      case 'warning':
        return {
          container: 'bg-amber-50 border-amber-200',
          icon: 'text-amber-600',
          title: 'text-amber-900',
          message: 'text-amber-700',
          recommendation: 'bg-amber-100 text-amber-800'
        };
      case 'gentle':
        return {
          container: 'bg-purple-50 border-purple-200',
          icon: 'text-purple-600',
          title: 'text-purple-900',
          message: 'text-purple-700',
          recommendation: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-900',
          message: 'text-blue-700',
          recommendation: 'bg-blue-100 text-blue-800'
        };
    }
  };

  const styles = getAlertStyles();

  const defaultIcon = icon || <Info className="w-5 h-5" />;

  return (
    <div className={`rounded-lg border ${styles.container} p-4 shadow-sm transition-all`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.icon} mt-0.5`}>
          {defaultIcon}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${styles.title} mb-1`}>
            {title}
          </h3>
          <p className={`text-sm ${styles.message}`}>
            {message}
          </p>

          {recommendation && (
            <div className={`mt-3 p-3 rounded-lg ${styles.recommendation} flex items-start space-x-2`}>
              <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium mb-1">Recomendación</p>
                <p className="text-xs">{recommendation}</p>
              </div>
            </div>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Hook para gestionar el estado de alertas cerradas
export function useAlertDismissal() {
  const [dismissedAlerts, setDismissedAlerts] = React.useState<Set<string>>(new Set());

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  const isAlertDismissed = (alertId: string) => {
    return dismissedAlerts.has(alertId);
  };

  return { dismissAlert, isAlertDismissed };
}
