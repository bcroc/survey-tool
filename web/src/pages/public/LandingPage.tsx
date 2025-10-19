import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { surveyAPI } from '../../services/api';
import type { Survey } from '../../types';

const DEFAULT_EVENT_SLUG = 'fall-summit-2025';

export default function LandingPage() {
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSurvey();
  }, []);

  const loadSurvey = async () => {
    try {
      const response = await surveyAPI.getActive(DEFAULT_EVENT_SLUG);
      setSurvey(response.data);
    } catch (error) {
      console.error('Failed to load survey:', error);
    } finally {
      setLoading(false);
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
        <div className="card animate-slide-up mb-6 text-center">
          <div className="mb-6">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center">
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
            {survey.description && (
              <p className="text-lg text-gray-600">{survey.description}</p>
            )}
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
            className="mt-4 text-sm text-primary-600 hover:text-primary-700 underline"
            aria-label="Read our privacy policy"
          >
            Read our Privacy Policy
          </button>
        </div>

        {/* Features */}
        <section aria-label="Survey features">
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Quick & Easy</h3>
              <p className="mt-1 text-xs text-gray-600">Complete in under 5 minutes</p>
            </article>

            <article className="card text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center" aria-hidden="true">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              <h3 className="text-sm font-medium">Private</h3>
              <p className="mt-1 text-xs text-gray-600">Completely anonymous responses</p>
            </article>

            <article className="card text-center">
              <div className="mx-auto mb-3 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-sm font-medium">Offline Ready</h3>
              <p className="mt-1 text-xs text-gray-600">Works without internet</p>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}
