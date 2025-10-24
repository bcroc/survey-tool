import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import React, { useState } from 'react';
import Footer from './components/Footer';
// Import the SVG as a URL so it can be used as an <img src="..."> value
import WestCatSmall from './assets/westcat-small.svg?url';

// Public pages
import LandingPage from './pages/public/LandingPage';
import PrivacyPage from './pages/public/PrivacyPage';
import SurveyFlow from './pages/public/SurveyFlow';
import ContactPage from './pages/public/ContactPage';
import ThankYouPage from './pages/public/ThankYouPage';

// Admin pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminSetup from './pages/admin/AdminSetup';
import AdminDashboard from './pages/admin/AdminDashboard';
import SurveyList from './pages/admin/SurveyList';
import SurveyBuilder from './pages/admin/SurveyBuilder';
import ResultsPage from './pages/admin/ResultsPage';
import LivePage from './pages/admin/LivePage';
import SettingsPage from './pages/admin/SettingsPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Use the bundled SVG placeholder as the default logo source. In production
  // you can replace this with a raster file in `public/assets` if desired.
  const [logoSrc, setLogoSrc] = useState(WestCatSmall);
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col">
        <AuthProvider>
          {/* Skip to main content link for keyboard users */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-primary-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
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
              <Route path="/admin/setup" element={<AdminSetup />} />
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
        <Footer logo={logoSrc} />
      </div>
    </BrowserRouter>
  );
}

export default App;
