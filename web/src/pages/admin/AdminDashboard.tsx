import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { MetricsOverview, Survey } from '../../types';

export default function AdminDashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const selectedSurvey = useMemo(
    () => surveys.find(s => s.id === selectedSurveyId),
    [surveys, selectedSurveyId]
  );

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminAPI.surveys.list();
        const list = res.data as Survey[];
        setSurveys(list);
        const preferred = list.find(s => s.isActive) || list[0];
        if (preferred) setSelectedSurveyId(preferred.id);
        const logsRes = await adminAPI.getAuditLog({ limit: 10, offset: 0 });
        setLogs(logsRes.data);
      } catch (e: any) {
        setError(e?.response?.data?.error || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const loadMetrics = async () => {
      if (!selectedSurveyId) return;
      try {
        const res = await adminAPI.getMetricsOverview(selectedSurveyId);
        setMetrics(res.data as MetricsOverview);
      } catch {
        setMetrics(null);
      }
    };
    loadMetrics();
  }, [selectedSurveyId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4">Admin Dashboard</h1>
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link to="/admin/surveys" className="btn-secondary">
            Manage Surveys
          </Link>
          {selectedSurvey && (
            <>
              <Link to={`/admin/results/${selectedSurvey.id}`} className="btn-secondary">
                Results
              </Link>
              <Link to={`/admin/live/${selectedSurvey.id}`} className="btn-secondary">
                Live
              </Link>
              <Link to={`/admin/surveys/${selectedSurvey.id}/builder`} className="btn-secondary">
                Builder
              </Link>
            </>
          )}
          <Link to="/admin/settings" className="btn-secondary">
            Settings
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="card">
            <div className="text-sm text-gray-600">Active Survey</div>
            <div className="mt-1 text-xl font-semibold">{selectedSurvey?.title || 'None'}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Total Submissions</div>
            <div className="mt-1 text-2xl font-bold">{metrics?.totalSubmissions ?? 0}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="mt-1 text-2xl font-bold">{metrics?.completionRate ?? 0}%</div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2>Surveys</h2>
              <Link to="/admin/surveys" className="text-sm text-primary-600 underline">
                View all
              </Link>
            </div>
            <ul className="space-y-3">
              {surveys.map(s => (
                <li key={s.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{s.title}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/admin/results/${s.id}`} className="btn-secondary">
                      Results
                    </Link>
                    <Link to={`/admin/surveys/${s.id}/builder`} className="btn-secondary">
                      Edit
                    </Link>
                  </div>
                </li>
              ))}
              {surveys.length === 0 && <li className="text-sm text-gray-600">No surveys yet</li>}
            </ul>
          </div>

          <div className="card">
            <div className="mb-3 flex items-center justify-between">
              <h2>Recent Activity</h2>
              <Link to="/admin/settings" className="text-sm text-primary-600 underline">
                Audit
              </Link>
            </div>
            <ul className="space-y-3">
              {logs.map(log => (
                <li key={log.id} className="text-sm">
                  <span className="font-medium">{log.action}</span>
                  <span className="text-gray-600">
                    {' '}
                    · {new Date(log.createdAt).toLocaleString()}
                  </span>
                </li>
              ))}
              {logs.length === 0 && <li className="text-sm text-gray-600">No recent activity</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
