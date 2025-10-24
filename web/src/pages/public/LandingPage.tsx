import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { logger } from '../../utils/logger';
import { surveyAPI, authAPI, setAuthToken } from '../../services/api';
import type { Survey } from '../../types';

const DEFAULT_EVENT_SLUG = 'fall-summit-2025';

export default function LandingPage() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  useEffect(() => {
    checkSetupAndLoad();
  }, []);

  const checkSetupAndLoad = async () => {
    try {
      const res = await authAPI.needsSetup();
      const needs = res.data?.needsSetup === true || res?.data === true;
      if (needs) {
        setNeedsSetup(true);
        setLoading(false);
        return;
      }
    } catch (err) {
      // ignore errors and continue to load survey
      logger.warn('Failed to check setup status', err);
    }

    await loadSurvey();
  };

  const loadSurvey = async () => {
    try {
      const response = await surveyAPI.getActive(DEFAULT_EVENT_SLUG);
      setSurvey(response.data);
    } catch (error) {
      logger.error('Failed to load survey:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSetupError(null);
    if (password !== confirm) {
      setSetupError('Passwords do not match');
      return;
    }
    setSetupLoading(true);
    try {
      const res = await authAPI.setup(email, password);
      const token = res?.data?.token;
      if (token) {
        try {
          setAuthToken(token);
        } catch (e) {
          // ignore localStorage errors
        }
      }
      // Navigate to admin dashboard
      navigate('/admin');
    } catch (err) {
      setSetupError(
        (err as any)?.response?.data?.error || (err as any)?.message || 'Failed to create admin'
      );
    } finally {
      setSetupLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div
          className="h-12 w-12 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
          role="status"
          aria-label="Loading survey"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-blue-100 px-4">
        <div className="card max-w-md text-center">
          <h1 className="mb-4">No Active Survey</h1>
          <p className="text-gray-600">
            There are no active surveys at the moment. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section */}
        <div className="card mb-6 animate-slide-up text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
              <svg
                className="h-10 w-10 text-primary-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h1 className="mb-2">{survey.title}</h1>
            {survey.description && <p className="text-lg text-gray-600">{survey.description}</p>}
          </div>

          <div className="mb-6 flex items-center justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>~5 minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Anonymous</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (survey?.id) {
                navigate(`/survey/${survey.id}/start`);
              }
            }}
            disabled={!survey?.id}
            className="btn-primary w-full text-lg"
            aria-label={`Start survey: ${survey?.title || 'survey'}`}
          >
            Start Survey
          </button>

          <button
            onClick={() => navigate('/privacy')}
            className="mt-4 text-sm text-primary-600 underline hover:text-primary-700"
            aria-label="Read our privacy policy"
          >
            Read our Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
}
