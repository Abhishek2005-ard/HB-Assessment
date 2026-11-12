import { signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, googleProvider, isFirebaseConfigured } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { user, login, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const fillCredentials = (email: string, pass: string) => {
    setForm({ name: '', email, password: pass });
    setMode('login');
    setError('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
      } else {
        await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: 'user',
          provider: 'local',
        });
      }

      navigate('/dashboard');
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : 'Authentication failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseConfigured) {
      setError(
        'Google Sign-In requires Firebase API keys in frontend/.env. Please use email & password login below, or configure Firebase keys in .env.',
      );
      return;
    }

    setGoogleLoading(true);
    setError('');

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      await loginWithGoogle(firebaseToken);
      navigate('/dashboard');
    } catch (requestError: unknown) {
      const message =
        requestError instanceof Error ? requestError.message : 'Google sign-in failed';
      setError(message);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4 py-10 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-slate-800 bg-slate-900/80 shadow-2xl shadow-cyan-950/30 backdrop-blur-xl lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-cyan-600 via-sky-700 to-blue-900 p-10 lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.22),transparent_35%)]" />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-cyan-100">
                  Secure access
                </span>
                <h1 className="mt-8 text-4xl font-bold leading-tight">Welcome to your work dashboard.</h1>
              </div>
              <div className="space-y-4 text-cyan-50/90">
                <p className="max-w-sm text-base">
                  Manage your secure account, review your profile, and access your workspace through verified organization credentials.
                </p>

                {/* Quick login credentials card */}
                <div className="rounded-2xl border border-white/20 bg-slate-950/40 p-4 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-cyan-300">
                    Test Credentials (click to fill)
                  </p>
                  <div className="mt-3 space-y-2 text-xs">
                    <button
                      type="button"
                      onClick={() => fillCredentials('admin@hbplus.fit', 'admin123')}
                      className="flex w-full items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-left transition hover:bg-white/20"
                    >
                      <span className="font-semibold text-amber-300">Admin: admin@hbplus.fit</span>
                      <span className="text-cyan-200">admin123</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fillCredentials('john@hbplus.fit', 'user1234')}
                      className="flex w-full items-center justify-between rounded-lg bg-white/10 px-3 py-2 text-left transition hover:bg-white/20"
                    >
                      <span className="font-semibold text-emerald-300">User: john@hbplus.fit</span>
                      <span className="text-cyan-200">user1234</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-lg">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium">Official domain access</p>
                    <p className="text-sm text-cyan-100/80">Only verified @hbplus.fit accounts are allowed.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">MERN Auth</p>
              <h2 className="mt-3 text-3xl font-bold text-white">
                {mode === 'login' ? 'Sign in' : 'Create account'}
              </h2>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-2 rounded-2xl bg-slate-800 p-1.5">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError('');
                }}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'register' ? 'bg-cyan-500 text-slate-950' : 'text-slate-300'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-300">
                    Full name
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={(event) => handleChange('name', event.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                    placeholder="Jane Doe"
                    required
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-300">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange('email', event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="name@hbplus.fit"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-300">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={form.password}
                  onChange={(event) => handleChange('password', event.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 focus:border-cyan-400 focus:outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Please wait...' : mode === 'login' ? 'Login securely' : 'Create account'}
              </button>
            </form>

            {/* Quick credentials for mobile/small screen */}
            <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900/60 p-3 lg:hidden">
              <p className="text-xs font-semibold text-slate-400">Quick Test Credentials:</p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('admin@hbplus.fit', 'admin123')}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-amber-300"
                >
                  Admin Login
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('john@hbplus.fit', 'user1234')}
                  className="rounded-lg bg-slate-800 px-2.5 py-1 text-xs text-emerald-300"
                >
                  User Login
                </button>
              </div>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="h-px flex-1 bg-slate-700" />
              <span className="px-3 text-[10px] uppercase tracking-[0.28em] text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-700" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 font-medium text-slate-100 transition hover:border-cyan-400 hover:text-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="text-lg">G</span>
              {googleLoading ? 'Connecting to Google...' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
