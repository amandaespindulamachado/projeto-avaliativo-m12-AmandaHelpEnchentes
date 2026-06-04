import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const navLinks = [
  { to: '/', label: '🏠 Início', end: true },
  { to: '/abrigos', label: '🏠 Abrigos' },
  { to: '/doacoes', label: '📦 Doações' },
  { to: '/voluntarios', label: '🤝 Voluntários' },
  { to: '/desaparecidos', label: '🔍 Desaparecidos' },
];

export default function Layout() {
  const { usuario, logout, isAutenticado } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-blue-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold">
            <span>🌊</span>
            <span>HelpEnchentes</span>
          </NavLink>

          <div className="flex items-center gap-4">
            {isAutenticado ? (
              <>
                <NavLink to="/dashboard" className="text-sm text-blue-200 hover:text-white">
                  Painel ({usuario.perfil})
                </NavLink>
                <button onClick={handleLogout} className="text-sm bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded-lg transition-colors">
                  Sair
                </button>
              </>
            ) : (
              <NavLink to="/login" className="text-sm bg-white text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg font-medium transition-colors">
                Entrar
              </NavLink>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="max-w-7xl mx-auto px-4 pb-2 flex gap-1 overflow-x-auto">
          {navLinks.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `text-sm px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  isActive ? 'bg-white text-blue-700 font-medium' : 'text-blue-100 hover:bg-blue-600'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* Alerta de emergência */}
      <div className="bg-red-600 text-white text-center text-sm py-1.5 px-4">
        🚨 Sistema de apoio a emergências por enchentes — informações atualizadas em tempo real
      </div>

      {/* Main */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center text-xs py-3">
        HelpEnchentes © 2024 — Sistema de apoio a vítimas de enchentes
      </footer>
    </div>
  );
}
