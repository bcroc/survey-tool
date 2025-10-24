import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';

export default function AdminLogin() {
  const location = useLocation();
  const initialEmail =
    typeof (location.state as { email?: unknown; setupComplete?: boolean } | null)?.email ===
    'string'
      ? String((location.state as { email?: string }).email)
      : '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(
    (location.state as { setupComplete?: boolean } | null)?.setupComplete
      ? 'Admin account created. Sign in to continue.'
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const checkSetup = async () => {
      try {
        const response = await authAPI.needsSetup();
        if (response.data?.needsSetup) {
          navigate('/admin/setup', { replace: true });
          return;
        }
      } catch (err) {
        // If the setup check fails, assume login should proceed.
      } finally {
        if (mounted) {
          setCheckingSetup(false);
        }
      }
    };

    void checkSetup();

    // Clear transient navigation state so success banner does not reappear on refresh.
    if ((location.state as { setupComplete?: boolean } | null)?.setupComplete) {
      navigate(location.pathname, { replace: true, state: {} });
    }

    return () => {
      mounted = false;
    };
  }, [navigate, location.pathname, location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="card w-full max-w-md text-center">
          <p className="text-gray-600">Checking setup status…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="card w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
            <svg
              className="h-8 w-8 text-primary-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl">Admin Login</h1>
          <p className="mt-2 text-sm text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800" role="status">
              {success}
            </div>
          )}
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">{error}</div>}

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              required
              autoFocus
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Demo credentials removed for security: no credentials are displayed on the login page */}
      </div>
    </div>
  );
}
