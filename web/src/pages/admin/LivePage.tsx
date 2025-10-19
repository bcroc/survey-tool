import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { MetricsOverview } from '../../types';

export default function LivePage() {
  const { id } = useParams();
  const [metrics, setMetrics] = useState<MetricsOverview | null>(null);
  const [error, setError] = useState('');

  const load = async () => {
    if (!id) return;
    try {
      const res = await adminAPI.getMetricsOverview(id);
      setMetrics(res.data as MetricsOverview);
      setError('');
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load metrics');
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4">Live Results</h1>
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Total" value={metrics?.totalSubmissions ?? 0} />
          <Metric label="Completed" value={metrics?.completedSubmissions ?? 0} />
          <Metric label="Completion Rate" value={`${metrics?.completionRate ?? 0}%`} />
          <Metric label="Avg Time" value={`${metrics?.avgCompletionTimeSeconds ?? 0}s`} />
        </div>

        <div className="mt-6 text-sm text-gray-600">Auto-refreshing every 10 seconds</div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="card">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
