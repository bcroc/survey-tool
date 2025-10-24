import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import type { Survey } from '../../types';

export default function SurveyList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminAPI.surveys.list();
      setSurveys(res.data as Survey[]);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await adminAPI.surveys.create({ title, description, isActive });
      setTitle('');
      setDescription('');
      setIsActive(false);
      setSurveys(prev => [res.data as Survey, ...prev]);
      navigate(`/admin/surveys/${res.data.id}/builder`);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Failed to create survey');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4">Surveys</h1>

        {error && <div className="mb-4 rounded bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="card mb-6">
          <h2 className="mb-3">Create Survey</h2>
          <form className="grid gap-3 md:grid-cols-3" onSubmit={createSurvey}>
            <input
              className="input"
              placeholder="Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
            <input
              className="input"
              placeholder="Description (optional)"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />{' '}
                Active
              </label>
              <button className="btn-primary" disabled={creating}>
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>

        <div className="card">
          <div className="mb-3 flex items-center justify-between">
            <h2>All Surveys</h2>
            <button onClick={load} className="text-sm text-primary-600 underline">
              Refresh
            </button>
          </div>
          {loading ? (
            <div className="text-sm text-gray-600">Loading...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-gray-600">
                  <th className="py-2">Title</th>
                  <th className="py-2">Active</th>
                  <th className="py-2">Created</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {surveys.map(s => (
                  <tr key={s.id} className="border-t">
                    <td className="py-2">{s.title}</td>
                    <td className="py-2">{s.isActive ? 'Yes' : 'No'}</td>
                    <td className="py-2">{new Date(s.createdAt).toLocaleString()}</td>
                    <td className="py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link className="btn-secondary" to={`/admin/surveys/${s.id}/builder`}>
                          Edit
                        </Link>
                        <Link className="btn-secondary" to={`/admin/results/${s.id}`}>
                          Results
                        </Link>
                        <Link className="btn-secondary" to={`/admin/live/${s.id}`}>
                          Live
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
                {surveys.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-600">
                      No surveys yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
