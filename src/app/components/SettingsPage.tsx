import { useState } from "react";
import { ProtectedRoute } from "./ProtectedRoute";
import { Navbar } from "./Navbar";
import { useTextSize } from "../contexts/TextSizeContext";
import { Settings, Type, Plus, Minus, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

export function SettingsPage() {
  const { textSize: globalTextSize, setTextSize: setGlobalTextSize } = useTextSize();
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>(globalTextSize);

  const handleIncrease = () => {
    if (textSize === 'medium') setTextSize('large');
    if (textSize === 'small') setTextSize('medium');
  };

  const handleDecrease = () => {
    if (textSize === 'large') setTextSize('medium');
    if (textSize === 'medium') setTextSize('small');
  };

  const handleReset = () => {
    setTextSize('medium');
  };

  const handleSave = () => {
    setGlobalTextSize(textSize);
    toast.success('Cambios guardados correctamente');
  };

  const getTextSizeLabel = () => {
    switch (textSize) {
      case 'small': return 'Pequeño';
      case 'large': return 'Grande';
      default: return 'Mediano';
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Settings className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl text-gray-900">Configuración</h1>
                <p className="text-gray-600">Personaliza tu experiencia en la aplicación</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controles de Accesibilidad */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Type className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl text-gray-900">Tamaño de Texto</h2>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Ajusta el tamaño del texto para facilitar la lectura
                    </p>

                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                      <span className="text-sm text-gray-700">Tamaño actual:</span>
                      <span className="text-base font-medium text-blue-600">{getTextSizeLabel()}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={handleIncrease}
                      disabled={textSize === 'large'}
                      className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        textSize === 'large'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Plus className="w-5 h-5" />
                      <span>Aumentar texto</span>
                    </button>

                    <button
                      onClick={handleDecrease}
                      disabled={textSize === 'small'}
                      className={`w-full flex items-center justify-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        textSize === 'small'
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <Minus className="w-5 h-5" />
                      <span>Disminuir texto</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span>Restaurar predeterminado</span>
                    </button>

                    <button
                      onClick={handleSave}
                      className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Save className="w-5 h-5" />
                      <span>Guardar cambios</span>
                    </button>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Los cambios se aplicarán inmediatamente en toda la aplicación
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Visual */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl text-gray-900 mb-6">Vista Previa</h2>

                <div className="space-y-6">
                  {/* Preview Card 1 - Resumen Financiero */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Type className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className={`text-gray-900 ${
                          textSize === 'small' ? 'text-base' : textSize === 'large' ? 'text-xl' : 'text-lg'
                        }`}>
                          Resumen Financiero
                        </h3>
                        <p className={`text-gray-600 ${
                          textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          Enero 2024
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className={`text-gray-600 mb-1 ${
                          textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          Ingresos
                        </p>
                        <p className={`text-green-600 font-medium ${
                          textSize === 'small' ? 'text-lg' : textSize === 'large' ? 'text-3xl' : 'text-2xl'
                        }`}>
                          $2,500
                        </p>
                      </div>
                      <div>
                        <p className={`text-gray-600 mb-1 ${
                          textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          Gastos
                        </p>
                        <p className={`text-red-600 font-medium ${
                          textSize === 'small' ? 'text-lg' : textSize === 'large' ? 'text-3xl' : 'text-2xl'
                        }`}>
                          $1,800
                        </p>
                      </div>
                      <div>
                        <p className={`text-gray-600 mb-1 ${
                          textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          Balance
                        </p>
                        <p className={`text-blue-600 font-medium ${
                          textSize === 'small' ? 'text-lg' : textSize === 'large' ? 'text-3xl' : 'text-2xl'
                        }`}>
                          $700
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Card 2 - Lista de Transacciones */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className={`text-gray-900 mb-4 ${
                      textSize === 'small' ? 'text-base' : textSize === 'large' ? 'text-xl' : 'text-lg'
                    }`}>
                      Transacciones Recientes
                    </h3>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className={`text-gray-900 ${
                            textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                          }`}>
                            Supermercado
                          </p>
                          <p className={`text-gray-500 ${
                            textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                          }`}>
                            Alimentación • 15 Enero
                          </p>
                        </div>
                        <p className={`text-red-600 font-medium ${
                          textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                        }`}>
                          -$85.50
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className={`text-gray-900 ${
                            textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                          }`}>
                            Salario Mensual
                          </p>
                          <p className={`text-gray-500 ${
                            textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                          }`}>
                            Ingreso • 1 Enero
                          </p>
                        </div>
                        <p className={`text-green-600 font-medium ${
                          textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                        }`}>
                          +$2,500
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className={`text-gray-900 ${
                            textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                          }`}>
                            Transporte Público
                          </p>
                          <p className={`text-gray-500 ${
                            textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                          }`}>
                            Transporte • 12 Enero
                          </p>
                        </div>
                        <p className={`text-red-600 font-medium ${
                          textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                        }`}>
                          -$45.00
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Preview Card 3 - Botones y Formularios */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h3 className={`text-gray-900 mb-4 ${
                      textSize === 'small' ? 'text-base' : textSize === 'large' ? 'text-xl' : 'text-lg'
                    }`}>
                      Botones y Controles
                    </h3>

                    <div className="space-y-4">
                      <button className={`w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                        textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                      }`}>
                        Guardar Cambios
                      </button>

                      <button className={`w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors ${
                        textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                      }`}>
                        Cancelar
                      </button>

                      <div>
                        <label className={`block text-gray-700 mb-2 ${
                          textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                        }`}>
                          Descripción
                        </label>
                        <input
                          type="text"
                          placeholder="Ingresa una descripción..."
                          className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border-l-4 border-blue-600 rounded">
                    <p className={`text-blue-900 ${
                      textSize === 'small' ? 'text-xs' : textSize === 'large' ? 'text-base' : 'text-sm'
                    }`}>
                      <span className="font-medium">Nota:</span> Esta es una vista previa de cómo se verá el texto en toda la aplicación con el tamaño seleccionado.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
