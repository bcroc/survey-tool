import { FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';

export default function AdminSetup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySetupNeeded = async () => {
      try {
        const response = await authAPI.needsSetup();
        if (!response.data?.needsSetup) {
          navigate('/admin/login', { replace: true });
          return;
        }
      } catch (err) {
        // If check fails, fail safe to login route
        navigate('/admin/login', { replace: true });
        return;
      } finally {
        setCheckingSetup(false);
      }
    };

    verifySetupNeeded();
  }, [navigate]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await authAPI.setup(email, password);
      navigate('/admin/login', {
        replace: true,
        state: { setupComplete: true, email },
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create admin account. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
        <div className="card w-full max-w-md text-center">
          <p className="text-gray-600">Preparing setup…</p>
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
                d="M13 16h-1v-4h-1m1-4h.01M12 20.5a8.5 8.5 0 100-17 8.5 8.5 0 000 17z"
              />
            </svg>
          </div>
          <h1 className="text-2xl">Create Admin Account</h1>
          <p className="mt-2 text-sm text-gray-600">
            No admin users were found. Create the first account to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="setup-email" className="label">
              Email
            </label>
            <input
              id="setup-email"
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
            <label htmlFor="setup-password" className="label">
              Password
            </label>
            <input
              id="setup-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </div>

          <div>
            <label htmlFor="setup-password-confirm" className="label">
              Confirm Password
            </label>
            <input
              id="setup-password-confirm"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="input"
              placeholder="Re-enter password"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Creating account…' : 'Create Admin Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
