import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { MetricsOverview, Question, QuestionMetrics, Survey } from '../../types';

export default function ResultsPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [questionMetrics, setQuestionMetrics] = useState<QuestionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const questions = useMemo(() => (survey?.sections || []).flatMap((s) => s.questions), [survey]);

  const load = async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [sRes, mRes] = await Promise.all([
        adminAPI.surveys.get(id),
        adminAPI.getMetricsOverview(id),
      ]);
      setSurvey(sRes.data as Survey);
      setOverview(mRes.data as MetricsOverview);
      const firstQ = (sRes.data as Survey).sections.flatMap((s) => s.questions)[0];
      if (firstQ) setSelectedQuestionId(firstQ.id);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    const loadQ = async () => {
      if (!selectedQuestionId) { setQuestionMetrics(null); return; }
      try {
        const res = await adminAPI.getQuestionMetrics(selectedQuestionId);
        setQuestionMetrics(res.data as QuestionMetrics);
      } catch {
        setQuestionMetrics(null);
      }
    };
    loadQ();
  }, [selectedQuestionId]);

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
        <h1 className="mb-4">Survey Results</h1>
        {error && <div className="mb-4 rounded bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="grid gap-6 md:grid-cols-3">
          <div className="card md:col-span-2">
            <h2 className="mb-3">Overview</h2>
            {overview ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Metric label="Total" value={overview.totalSubmissions} />
                <Metric label="Completed" value={overview.completedSubmissions} />
                <Metric label="Completion Rate" value={`${overview.completionRate}%`} />
                <Metric label="Avg Time" value={`${overview.avgCompletionTimeSeconds}s`} />
              </div>
            ) : (
              <div className="text-sm text-gray-600">No data</div>
            )}
          </div>

          <div className="card">
            <h2 className="mb-3">Questions</h2>
            <select className="input" value={selectedQuestionId} onChange={(e) => setSelectedQuestionId(e.target.value)}>
              {questions.map((q) => (
                <option key={q.id} value={q.id}>{q.prompt.substring(0, 80)}</option>
              ))}
            </select>

            <div className="mt-4">
              {questionMetrics ? (
                <QuestionMetricsView metrics={questionMetrics} />
              ) : (
                <div className="text-sm text-gray-600">No question selected</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded bg-gray-50 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function QuestionMetricsView({ metrics }: { metrics: QuestionMetrics }) {
  const { questionType, totalResponses, distribution, average, median, min, max, responses, wordCount } = metrics;
  return (
    <div className="space-y-2 text-sm">
      <div className="text-gray-600">Type: {questionType}</div>
      <div><span className="text-gray-600">Responses:</span> {totalResponses}</div>
      {distribution && (
        <div>
          <div className="text-gray-600">Distribution</div>
          <ul className="mt-1 space-y-1">
            {Object.entries(distribution).map(([k, v]) => (
              <li key={k} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                <span>{k}</span>
                <span className="font-medium">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {(average !== undefined) && (
        <div className="grid grid-cols-4 gap-2">
          <Metric label="Avg" value={average!} />
          <Metric label="Median" value={median!} />
          <Metric label="Min" value={min!} />
          <Metric label="Max" value={max!} />
        </div>
      )}
      {responses && responses.length > 0 && (
        <div>
          <div className="text-gray-600">Sample Responses</div>
          <ul className="mt-1 list-disc pl-5">
            {responses.slice(0, 10).map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
          <div className="mt-1 text-xs text-gray-500">Word Count: {wordCount}</div>
        </div>
      )}
    </div>
  );
}
