import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useState } from 'react';
import WestCatSmall from './assets/westcat-small.svg';

// Public pages
import LandingPage from './pages/public/LandingPage';
import PrivacyPage from './pages/public/PrivacyPage';
import SurveyFlow from './pages/public/SurveyFlow';
import ContactPage from './pages/public/ContactPage';
import ThankYouPage from './pages/public/ThankYouPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import SurveyList from './pages/admin/SurveyList';
import SurveyBuilder from './pages/admin/SurveyBuilder';
import ResultsPage from './pages/admin/ResultsPage';
import LivePage from './pages/admin/LivePage';
import SettingsPage from './pages/admin/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Attempt to load a raster westcat.png from the public assets folder first.
  // If that file isn't present, fall back to the bundled SVG placeholder.
  const [logoSrc, setLogoSrc] = useState('/assets/westcat.png');
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
      <AuthProvider>
        {/* Skip to main content link for keyboard users */}
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded focus:shadow-lg"
        >
          Skip to main content
        </a>
  <main id="main-content" className="flex-grow pb-16 md:pb-6">
  <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/survey/:surveyId/*" element={<SurveyFlow />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/thanks" element={<ThankYouPage />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/surveys"
            element={
              <ProtectedRoute>
                <SurveyList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/surveys/:id/builder"
            element={
              <ProtectedRoute>
                <SurveyBuilder />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/results/:id"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/live/:id"
            element={
              <ProtectedRoute>
                <LivePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </main>
      </AuthProvider>
      {/* Footer visible on all pages (fixed to bottom) */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 text-sm text-gray-600 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-400">
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="West Cat logo"
              width={32}
              height={32}
              className="inline-block rounded-full"
              style={{ width: 32, height: 32 }}
              onError={() => setLogoSrc(WestCatSmall)}
            />
            <a
              href="https://westcat.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              title="West Cat Strategy Ltd."
              aria-label="Built by West Cat Strategy Ltd."
            >
              <span>Built by <span className="font-medium">West Cat Strategy Ltd.</span></span>
            </a>
          </div>
          <div className="text-xs text-gray-500">&copy; {new Date().getFullYear()}</div>
        </div>
      </footer>
      {/* Add a small spacer for mobile safe-area / to prevent content overlap */}
      <div className="h-2 md:h-0" aria-hidden />
      </div>
    </BrowserRouter>
  );
}

export default App;
