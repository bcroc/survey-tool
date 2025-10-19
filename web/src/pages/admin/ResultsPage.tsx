import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { MetricsOverview, Question, QuestionMetrics, Survey } from '../../types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { Bar, Doughnut, Line, PolarArea } from 'react-chartjs-2';
import ReactWordcloud from 'react-wordcloud';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

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

        {/* Overview Cards */}
        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <div className="card">
            <div className="text-sm text-gray-600">Total Submissions</div>
            <div className="mt-2 text-3xl font-bold text-primary-600">{overview?.totalSubmissions || 0}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Completed</div>
            <div className="mt-2 text-3xl font-bold text-green-600">{overview?.completedSubmissions || 0}</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Completion Rate</div>
            <div className="mt-2 text-3xl font-bold text-blue-600">{overview?.completionRate || 0}%</div>
          </div>
          <div className="card">
            <div className="text-sm text-gray-600">Avg Time</div>
            <div className="mt-2 text-3xl font-bold text-purple-600">{overview?.avgCompletionTimeSeconds || 0}s</div>
          </div>
        </div>

        {/* Question Selector */}
        <div className="card mb-6">
          <h2 className="mb-3">Select Question to Analyze</h2>
          <select 
            className="input w-full" 
            value={selectedQuestionId} 
            onChange={(e) => setSelectedQuestionId(e.target.value)}
          >
            {questions.map((q) => (
              <option key={q.id} value={q.id}>
                {q.prompt.substring(0, 100)}
              </option>
            ))}
          </select>
        </div>

        {/* Question Visualizations */}
        {questionMetrics && (
          <QuestionVisualization 
            metrics={questionMetrics} 
            question={questions.find(q => q.id === selectedQuestionId)!}
          />
        )}
      </div>
    </div>
  );
}

function QuestionVisualization({ metrics, question }: { metrics: QuestionMetrics; question: Question }) {
  const { questionType, totalResponses, distribution, average, median, min, max, responses, wordCount } = metrics;

  // Generate colors for charts
  const generateColors = (count: number) => {
    const colors = [
      'rgba(59, 130, 246, 0.8)',   // blue
      'rgba(16, 185, 129, 0.8)',   // green
      'rgba(249, 115, 22, 0.8)',   // orange
      'rgba(139, 92, 246, 0.8)',   // purple
      'rgba(236, 72, 153, 0.8)',   // pink
      'rgba(234, 179, 8, 0.8)',    // yellow
      'rgba(239, 68, 68, 0.8)',    // red
      'rgba(6, 182, 212, 0.8)',    // cyan
      'rgba(168, 85, 247, 0.8)',   // violet
      'rgba(251, 146, 60, 0.8)',   // amber
    ];
    return Array(count).fill(0).map((_, i) => colors[i % colors.length]);
  };

  // Render choice-based questions (SINGLE, MULTI, LIKERT, NPS)
  const renderChoiceVisualization = () => {
    if (!distribution || Object.keys(distribution).length === 0) {
      return <div className="text-gray-600">No responses yet</div>;
    }

    const labels = Object.keys(distribution);
    const values = Object.values(distribution);
    const colors = generateColors(labels.length);

    const barData = {
      labels,
      datasets: [{
        label: 'Response Count',
        data: values,
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.8', '1')),
        borderWidth: 2,
      }]
    };

    const doughnutData = {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#fff',
        borderWidth: 2,
      }]
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
        },
        title: {
          display: true,
          text: `${questionType} Question Analysis`,
          font: { size: 16 }
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Bar Chart */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Distribution (Bar Chart)</h3>
            <Bar data={barData} options={chartOptions} />
          </div>

          {/* Doughnut Chart */}
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Distribution (Doughnut)</h3>
            <div className="mx-auto" style={{ maxWidth: '300px' }}>
              <Doughnut data={doughnutData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
          <div className="grid gap-4 md:grid-cols-4">
            <Metric label="Total Responses" value={totalResponses} />
            {average !== undefined && <Metric label="Average" value={average.toFixed(2)} />}
            {median !== undefined && <Metric label="Median" value={median} />}
            {min !== undefined && max !== undefined && (
              <Metric label="Range" value={`${min} - ${max}`} />
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render text-based questions with word cloud
  const renderTextVisualization = () => {
    if (!responses || responses.length === 0) {
      return <div className="text-gray-600">No responses yet</div>;
    }

    // Generate word frequency for word cloud
    const generateWordFrequency = (texts: string[]) => {
      const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'can', 'it', 'this', 'that', 'these', 'those',
        'i', 'you', 'he', 'she', 'we', 'they', 'my', 'your', 'his', 'her', 'our',
        'their', 'me', 'him', 'us', 'them', 'as', 'by', 'from', 'up', 'about',
        'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between',
        'under', 'again', 'further', 'then', 'once'
      ]);

      const wordMap = new Map<string, number>();
      
      texts.forEach(text => {
        const words = text.toLowerCase()
          .replace(/[^a-z0-9\s]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 3 && !stopWords.has(word));
        
        words.forEach(word => {
          wordMap.set(word, (wordMap.get(word) || 0) + 1);
        });
      });

      return Array.from(wordMap.entries())
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 100); // Top 100 words
    };

    const words = generateWordFrequency(responses);

    const wordCloudOptions = {
      colors: ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899', '#eab308'],
      enableTooltip: true,
      deterministic: false,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSizes: [16, 60] as [number, number],
      fontStyle: 'normal',
      fontWeight: 'bold',
      padding: 2,
      rotations: 2,
      rotationAngles: [0, 90] as [number, number],
      scale: 'sqrt' as const,
      spiral: 'archimedean' as const,
      transitionDuration: 1000,
    };

    return (
      <div className="space-y-6">
        {/* Word Cloud */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Word Cloud</h3>
          <div className="bg-white rounded-lg border-2 border-gray-200" style={{ height: '400px' }}>
            {words.length > 0 ? (
              <ReactWordcloud words={words} options={wordCloudOptions} />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Not enough text data for word cloud
              </div>
            )}
          </div>
        </div>

        {/* Statistics and Responses */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
            <div className="space-y-3">
              <Metric label="Total Responses" value={totalResponses} />
              <Metric label="Total Words" value={wordCount || 0} />
              <Metric label="Avg Words per Response" value={wordCount && totalResponses ? Math.round(wordCount / totalResponses) : 0} />
            </div>
          </div>

          <div className="card">
            <h3 className="mb-4 text-lg font-semibold">Top Keywords</h3>
            <div className="space-y-2">
              {words.slice(0, 10).map((word, i) => (
                <div key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2">
                  <span className="font-medium">{word.text}</span>
                  <span className="text-sm text-gray-600">×{word.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sample Responses */}
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Sample Responses</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {responses.slice(0, 20).map((response, i) => (
              <div key={i} className="rounded-lg bg-gray-50 p-3 text-sm">
                <span className="font-medium text-gray-500">Response {i + 1}:</span>
                <p className="mt-1">{response}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render number-based questions
  const renderNumberVisualization = () => {
    if (!responses || responses.length === 0) {
      return <div className="text-gray-600">No responses yet</div>;
    }

    const numbers = responses.map(r => parseFloat(r)).filter(n => !isNaN(n));
    
    // Create histogram data
    const bins = 10;
    const range = (max || 0) - (min || 0);
    const binSize = range / bins;
    const histogram = new Array(bins).fill(0);
    
    numbers.forEach(num => {
      const binIndex = Math.min(Math.floor((num - (min || 0)) / binSize), bins - 1);
      histogram[binIndex]++;
    });

    const histogramLabels = Array(bins).fill(0).map((_, i) => {
      const start = (min || 0) + i * binSize;
      const end = start + binSize;
      return `${start.toFixed(1)}-${end.toFixed(1)}`;
    });

    const barData = {
      labels: histogramLabels,
      datasets: [{
        label: 'Frequency',
        data: histogram,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      }]
    };

    const chartOptions = {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Number Distribution',
          font: { size: 16 }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: 'Frequency' }
        },
        x: {
          title: { display: true, text: 'Value Range' }
        }
      }
    };

    return (
      <div className="space-y-6">
        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Distribution Histogram</h3>
          <Bar data={barData} options={chartOptions} />
        </div>

        <div className="card">
          <h3 className="mb-4 text-lg font-semibold">Statistics</h3>
          <div className="grid gap-4 md:grid-cols-5">
            <Metric label="Total Responses" value={totalResponses} />
            <Metric label="Average" value={average?.toFixed(2) || 'N/A'} />
            <Metric label="Median" value={median || 'N/A'} />
            <Metric label="Minimum" value={min || 'N/A'} />
            <Metric label="Maximum" value={max || 'N/A'} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div className="card mb-4">
        <h2 className="text-xl font-bold">{question.prompt}</h2>
        <p className="mt-1 text-sm text-gray-600">Type: {questionType} | {totalResponses} responses</p>
      </div>

      {(questionType === 'SINGLE' || questionType === 'MULTI' || questionType === 'LIKERT' || questionType === 'NPS') && 
        renderChoiceVisualization()}
      
      {(questionType === 'TEXT' || questionType === 'LONGTEXT') && 
        renderTextVisualization()}
      
      {questionType === 'NUMBER' && 
        renderNumberVisualization()}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-gray-50 p-4">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
