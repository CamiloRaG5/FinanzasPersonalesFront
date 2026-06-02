import { Link, useNavigate, useLocation } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import {
  LogOut, Menu, X, Settings, FileText, Bell, PiggyBank,
  LayoutDashboard, PlusCircle, MinusCircle, Clock, Tag,
  BarChart2, ChevronDown, Wallet,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  items: { label: string; to: string; icon: React.ReactNode }[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Transacciones",
    icon: <Wallet className="w-4 h-4" />,
    items: [
      { label: "Agregar Ingreso", to: "/add-income", icon: <PlusCircle className="w-4 h-4 text-green-500" /> },
      { label: "Agregar Gasto", to: "/add-expense", icon: <MinusCircle className="w-4 h-4 text-red-500" /> },
      { label: "Historial", to: "/history", icon: <Clock className="w-4 h-4 text-gray-400" /> },
      { label: "Categorías", to: "/categories", icon: <Tag className="w-4 h-4 text-gray-400" /> },
    ],
  },
  {
    label: "Presupuestos",
    icon: <BarChart2 className="w-4 h-4" />,
    items: [
      { label: "Progreso del Presupuesto", to: "/budget-progress", icon: <BarChart2 className="w-4 h-4 text-blue-500" /> },
      { label: "Reportes", to: "/reports", icon: <FileText className="w-4 h-4 text-gray-400" /> },
    ],
  },
  {
    label: "Herramientas",
    icon: <Settings className="w-4 h-4" />,
    items: [
      { label: "Recomendaciones de Ahorro", to: "/savings", icon: <PiggyBank className="w-4 h-4 text-yellow-500" /> },
      { label: "Configuración de Alertas", to: "/alert-settings", icon: <Bell className="w-4 h-4 text-orange-400" /> },
      { label: "Configuración", to: "/settings", icon: <Settings className="w-4 h-4 text-gray-400" /> },
    ],
  },
];

function UserMenu({ user, onLogout }: { user: { firstName?: string; lastName?: string } | null; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center space-x-2 px-2 py-1.5 rounded-md transition-colors ${
          open ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
          {initials}
        </div>
        <span className="text-sm font-medium max-w-[120px] truncate">{fullName}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1.5 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-xs text-gray-400 leading-none">Sesión iniciada como</p>
            <p className="text-sm font-medium text-gray-800 mt-0.5 truncate">{fullName}</p>
          </div>
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center space-x-2.5 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  );
}

function DropdownMenu({ group, onNavigate }: { group: NavGroup; onNavigate: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const isActive = group.items.some((item) => location.pathname === item.to);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? "text-blue-600 bg-blue-50"
            : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
        }`}
      >
        {group.icon}
        <span>{group.label}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
          {group.items.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                setOpen(false);
                onNavigate();
              }}
              className={`flex items-center space-x-2.5 px-4 py-2.5 text-sm transition-colors ${
                location.pathname === item.to
                  ? "text-blue-600 bg-blue-50 font-medium"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileMenu = () => {
    setIsMenuOpen(false);
    setOpenMobileGroup(null);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-1 text-lg font-semibold text-blue-600 shrink-0"
          >
            <span>💰</span>
            <span>FinanzasApp</span>
          </Link>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {NAV_GROUPS.map((group) => (
              <DropdownMenu key={group.label} group={group} onNavigate={() => {}} />
            ))}
          </div>

          {/* Desktop user section */}
          <div className="hidden md:flex items-center pl-4 border-l border-gray-200 ml-2">
            <UserMenu user={user} onLogout={handleLogout} />
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            className="md:hidden text-gray-700 hover:text-blue-600 p-2 rounded-md"
            aria-label="Abrir menú"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-3 pt-2 pb-3 space-y-0.5">
            {/* Dashboard direct link */}
            <Link
              to="/dashboard"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === "/dashboard"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            {/* Grouped sections */}
            {NAV_GROUPS.map((group) => {
              const isGroupOpen = openMobileGroup === group.label;
              const isGroupActive = group.items.some((item) => location.pathname === item.to);
              return (
                <div key={group.label}>
                  <button
                    onClick={() =>
                      setOpenMobileGroup(isGroupOpen ? null : group.label)
                    }
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                      isGroupActive
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {group.icon}
                      <span>{group.label}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${isGroupOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {isGroupOpen && (
                    <div className="ml-4 mt-0.5 border-l-2 border-blue-100 pl-3 space-y-0.5">
                      {group.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          onClick={closeMobileMenu}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-md text-sm transition-colors ${
                            location.pathname === item.to
                              ? "text-blue-600 bg-blue-50 font-medium"
                              : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* User + logout */}
            <div className="border-t border-gray-100 pt-2 mt-2">
              <div className="flex items-center space-x-2.5 px-3 py-2">
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-semibold shrink-0">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <span className="text-sm text-gray-700 truncate">
                  {user?.firstName} {user?.lastName}
                </span>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  closeMobileMenu();
                }}
                className="flex items-center space-x-2.5 text-red-600 hover:bg-red-50 px-3 py-2.5 rounded-md w-full text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
