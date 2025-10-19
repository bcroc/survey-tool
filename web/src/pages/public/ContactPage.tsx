import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contactAPI } from '../../services/api';

const DEFAULT_EVENT_SLUG = 'fall-summit-2025';

export default function ContactPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [consent, setConsent] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await contactAPI.submit({
        eventSlug: DEFAULT_EVENT_SLUG,
        name: name || undefined,
        email: email || undefined,
        company: company || undefined,
        role: role || undefined,
        consent,
      });
      navigate('/thanks');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to submit contact info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-xl">
        <div className="card">
          <h1>Optional Contact Information</h1>
          <p className="text-gray-600 mt-2">
            Provide your contact if you want us to follow up. This is stored separately and cannot be linked to your survey responses.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {error && <div className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</div>}

            <div>
              <label className="label" htmlFor="name">Name</label>
              <input id="name" className="input" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="company">Company</label>
              <input id="company" className="input" value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className="label" htmlFor="role">Role</label>
              <input id="role" className="input" value={role} onChange={(e) => setRole(e.target.value)} />
            </div>

            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span className="text-sm text-gray-700">I consent to be contacted for follow-up</span>
            </label>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
              <button type="button" className="btn-secondary" onClick={() => navigate('/thanks')}>Skip</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
