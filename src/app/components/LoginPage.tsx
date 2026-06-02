import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, LogIn, AlertTriangle, Lock } from "lucide-react";
import { toast } from "sonner";

const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION = 30000; // 30 segundos

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    // Verificar si hay un bloqueo activo en localStorage
    const lockout = localStorage.getItem('loginLockout');
    if (lockout) {
      const lockoutData = JSON.parse(lockout);
      const now = Date.now();

      if (now < lockoutData.endTime) {
        setIsLockedOut(true);
        setLockoutEndTime(lockoutData.endTime);
        setFailedAttempts(lockoutData.attempts);
      } else {
        localStorage.removeItem('loginLockout');
      }
    }

    const attempts = localStorage.getItem('loginAttempts');
    if (attempts) {
      setFailedAttempts(parseInt(attempts, 10));
    }
  }, []);

  useEffect(() => {
    if (isLockedOut && lockoutEndTime) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((lockoutEndTime - now) / 1000));
        setRemainingTime(remaining);

        if (remaining === 0) {
          setIsLockedOut(false);
          setFailedAttempts(0);
          setLockoutEndTime(null);
          localStorage.removeItem('loginLockout');
          localStorage.removeItem('loginAttempts');
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isLockedOut, lockoutEndTime]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      toast.error('Cuenta temporalmente bloqueada');
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error('Todos los campos son obligatorios');
      return;
    }

    const success = await login(formData.email, formData.password);

    if (success) {
      // Limpiar intentos fallidos al iniciar sesión correctamente
      setFailedAttempts(0);
      localStorage.removeItem('loginAttempts');
      localStorage.removeItem('loginLockout');
      toast.success('Inicio de sesión exitoso');
      navigate('/dashboard');
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      if (newAttempts >= MAX_ATTEMPTS) {
        const endTime = Date.now() + LOCKOUT_DURATION;
        setIsLockedOut(true);
        setLockoutEndTime(endTime);

        localStorage.setItem('loginLockout', JSON.stringify({
          endTime,
          attempts: newAttempts
        }));

        toast.error('Demasiados intentos fallidos. Cuenta bloqueada temporalmente.');
      } else {
        toast.error('Credenciales inválidas. Por favor, verifica tus datos.');
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <LogIn className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl text-gray-900">Iniciar Sesión</h1>
            <p className="text-sm text-gray-600 mt-2">Gestiona tus finanzas personales</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isLockedOut && (
              <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-900 font-medium">
                      Cuenta bloqueada temporalmente
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Demasiados intentos fallidos. Por seguridad, tu cuenta está bloqueada.
                    </p>
                    <p className="text-xs text-red-700 mt-2 font-medium">
                      Tiempo restante: {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isLockedOut && failedAttempts > 0 && failedAttempts < MAX_ATTEMPTS && (
              <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-700" />
                  <p className="text-xs text-yellow-800">
                    Intentos fallidos: {failedAttempts} de {MAX_ATTEMPTS}
                  </p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-gray-700">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={isLockedOut}
                className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  isLockedOut ? 'bg-gray-100 cursor-not-allowed' : ''
                }`}
                placeholder="juan@ejemplo.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLockedOut}
                  className={`w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 ${
                    isLockedOut ? 'bg-gray-100 cursor-not-allowed' : ''
                  }`}
                  placeholder="********"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLockedOut}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 ${
                    isLockedOut ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLockedOut}
              className={`w-full py-2 rounded-lg transition-colors ${
                isLockedOut
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLockedOut ? 'Cuenta Bloqueada' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-blue-600 hover:underline">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
