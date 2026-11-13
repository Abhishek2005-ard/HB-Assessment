import {
  getRedirectResult,
  signInWithPopup,
  signInWithRedirect,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
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

  // Handle Google OAuth redirect on mobile devices
  useEffect(() => {
    let isMounted = true;
    getRedirectResult(auth)
      .then(async (result) => {
        if (!isMounted || !result?.user) return;
        setGoogleLoading(true);
        const firebaseToken = await result.user.getIdToken();
        await loginWithGoogle(firebaseToken);
        navigate('/dashboard');
      })
      .catch((requestError: any) => {
        if (!isMounted) return;
        let message = 'Google sign-in failed';
        if (requestError?.response?.data?.message) {
          message = requestError.response.data.message;
        } else if (requestError instanceof Error) {
          message = requestError.message;
        }
        setError(message);
      })
      .finally(() => {
        if (isMounted) setGoogleLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [loginWithGoogle, navigate]);

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
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
        'Google Sign-In is not configured. Please configure your Firebase environment variables or sign in with email and password.',
      );
      return;
    }

    setGoogleLoading(true);
    setError('');

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      );

    try {
      if (isMobile) {
        // Mobile browsers handle full-page redirect much more reliably than popups
        await signInWithRedirect(auth, googleProvider);
        return;
      }

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseToken = await result.user.getIdToken();
      await loginWithGoogle(firebaseToken);
      navigate('/dashboard');
    } catch (requestError: any) {
      if (requestError?.code === 'auth/popup-blocked') {
        // Fallback to redirect if popup was blocked
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch {
          // Fall through to error handler
        }
      }

      let message = 'Google sign-in failed';

      if (requestError?.code === 'auth/network-request-failed') {
        message =
          'Network connection error during Google authentication. Please verify your connection or pause any ad-blockers on localhost.';
      } else if (requestError?.code === 'auth/popup-blocked') {
        message =
          'The sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
      } else if (requestError?.code === 'auth/operation-not-allowed') {
        message =
          'Google authentication provider is not enabled in Firebase project settings.';
      } else if (requestError?.code === 'auth/unauthorized-domain') {
        message =
          'Current domain is not authorized in Firebase Console settings.';
      } else if (requestError?.code === 'auth/popup-closed-by-user') {
        message = 'Sign-in window was closed before completing.';
      } else if (requestError?.response?.data?.message) {
        message = requestError.response.data.message;
      } else if (requestError instanceof Error) {
        message = requestError.message;
      }

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
                  Authentication
                </span>
                <h1 className="mt-8 text-4xl font-bold leading-tight">Secure Workspace Portal</h1>
              </div>
              <div className="space-y-4 text-cyan-50/90">
                <p className="max-w-sm text-base">
                  Manage your account, review profile details, and access administrative tools through verified credentials.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-medium text-sm">Domain Verification</p>
                      <p className="text-xs text-cyan-100/80">Authorized accounts restricted to official @hbplus.fit domain.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-sm font-semibold">
                      RBAC
                    </div>
                    <div>
                      <p className="font-medium text-sm">Role-Based Access</p>
                      <p className="text-xs text-cyan-100/80">Administrative controls, user management, and protected routes.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-8 text-center lg:text-left">
              <p className="text-xs uppercase tracking-[0.32em] text-cyan-400">Portal</p>
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
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {googleLoading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
