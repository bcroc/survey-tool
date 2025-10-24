import { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.getAuditLog({ limit: 50, offset: 0 });
      setLogs(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4">Settings</h1>

        <div className="card mb-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Signed in as</div>
              <div className="font-semibold">{user?.email}</div>
            </div>
            <button className="btn-secondary" onClick={logout}>
              Log out
            </button>
          </div>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2>Audit Logs</h2>
            <button className="text-sm text-primary-600 underline" onClick={load}>
              Refresh
            </button>
          </div>
          {error && <div className="mb-3 rounded bg-red-50 p-3 text-red-800">{error}</div>}
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <ul className="space-y-2 text-sm">
              {logs.map(log => (
                <li
                  key={log.id}
                  className="flex items-center justify-between rounded bg-gray-50 p-3"
                >
                  <div>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-xs text-gray-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                  {log.entity && <div className="text-gray-600">{log.entity}</div>}
                </li>
              ))}
              {logs.length === 0 && <li className="text-sm text-gray-600">No logs</li>}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
