import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const roleLabel = user.role === 'admin' ? 'Administrator' : 'User';
  const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl shadow-cyan-950/20 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff&size=128`}
              alt={user.name}
              className="h-16 w-16 rounded-full border-2 border-cyan-400 object-cover"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-cyan-400">Secure dashboard</p>
              <h1 className="mt-2 text-3xl font-bold">{user.name}</h1>
            </div>
          </div>

          {user.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="rounded-xl border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 font-medium text-cyan-200 transition hover:bg-cyan-500 hover:text-white"
            >
              Open Admin Panel
            </button>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Profile</p>
                <h2 className="mt-2 text-2xl font-semibold">Account overview</h2>
              </div>
              <span className="rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">
                {roleLabel}
              </span>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Full name</p>
                <p className="mt-2 text-xl font-semibold">{user.name}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Email</p>
                <p className="mt-2 text-xl font-semibold break-all">{user.email}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Role</p>
                <p className="mt-2 text-xl font-semibold">{roleLabel}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Auth provider</p>
                <p className="mt-2 text-xl font-semibold capitalize">{user.provider || 'local'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl shadow-slate-950/30">
            <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Account details</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Member since</p>
                <p className="mt-2 text-lg font-semibold">{createdDate}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-emerald-400">Active and verified</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-sm text-slate-400">Access level</p>
                <p className="mt-2 text-lg font-semibold">
                  {user.role === 'admin' ? 'Full administrative access' : 'Standard user access'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
