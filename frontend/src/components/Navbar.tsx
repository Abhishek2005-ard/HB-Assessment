import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <span className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-400">
            MERN Auth
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                isActive('/dashboard')
                  ? 'bg-cyan-500/15 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dashboard
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  isActive('/admin')
                    ? 'bg-cyan-500/15 text-cyan-300'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Admin Panel
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img
              src={
                user.profilePicture ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff&size=64`
              }
              alt={user.name}
              className="h-8 w-8 rounded-full border border-cyan-400/50 object-cover"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-slate-200">{user.name}</p>
              <p className="text-xs text-slate-500">{user.role}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500 hover:text-white"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

