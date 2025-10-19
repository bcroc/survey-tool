import axios from 'axios';
import type { Answer, MetricsOverview, QuestionMetrics, Survey } from '../types';

const API_BASE_URL = ((import.meta as any).env?.VITE_API_URL as string) || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor: unwrap unified API shape and handle auth
api.interceptors.response.use(
  (response: any) => {
    const payload = response?.data;
    if (payload && typeof payload === 'object' && payload.success === true && 'data' in payload) {
      // Unwrap { success, data, message }
      response.data = payload.data;
    }
    return response;
  },
  (error: any) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      if (!window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Helper to create CRUD methods
const createCrudApi = (baseUrl: string) => ({
  list: () => api.get(baseUrl),
  get: (id: string) => api.get(`${baseUrl}/${id}`),
  create: (data: any) => api.post(baseUrl, data),
  update: (id: string, data: any) => api.patch(`${baseUrl}/${id}`, data),
  delete: (id: string) => api.delete(`${baseUrl}/${id}`),
});

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

// Survey APIs (public)
export const surveyAPI = {
  getActive: (eventSlug: string) =>
    api.get<Survey>('/surveys/active', { params: { eventSlug } }),
  getById: (id: string) => api.get<Survey>(`/surveys/${id}`),
};

// Submission APIs
export const submissionAPI = {
  create: (data: { surveyId: string; eventSlug: string }) =>
    api.post('/submissions', data),
  submitAnswers: (id: string, answers: Answer[]) =>
    api.post(`/submissions/${id}/answers`, { answers }),
  complete: (id: string) =>
    api.post(`/submissions/${id}/complete`),
};

// Contact APIs
export const contactAPI = {
  submit: (data: {
    eventSlug: string;
    name?: string;
    email?: string;
    company?: string;
    role?: string;
    consent: boolean;
  }) => api.post('/contacts', data),
};

// Admin APIs
export const adminAPI = {
  // Surveys (CRUD)
  surveys: createCrudApi('/admin/surveys'),

  // Sections (CRUD)
  sections: createCrudApi('/admin/sections'),

  // Questions (CRUD)
  questions: createCrudApi('/admin/questions'),

  // Options (CRUD)
  options: createCrudApi('/admin/options'),

  // Branching Rules (CRUD)
  branchingRules: createCrudApi('/admin/branching-rules'),

  // Metrics
  getMetricsOverview: (surveyId: string) =>
    api.get<MetricsOverview>('/admin/metrics/overview', { params: { surveyId } }),
  getQuestionMetrics: (id: string) =>
    api.get<QuestionMetrics>(`/admin/metrics/question/${id}`),

  // Export
  exportResponses: (surveyId?: string) =>
    api.get('/admin/export/responses.csv', {
      params: surveyId ? { surveyId } : {},
      responseType: 'blob',
    }),
  exportContacts: (eventSlug?: string) =>
    api.get('/admin/export/contacts.csv', {
      params: eventSlug ? { eventSlug } : {},
      responseType: 'blob',
    }),

  // Audit
  getAuditLog: (params?: any) => api.get('/admin/audit', { params }),
  
  // Import
  importSurvey: (data: any) => api.post('/admin/import', data),
};
