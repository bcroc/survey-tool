export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="prose prose-blue mx-auto max-w-3xl">
        <div className="card">
          <h1>Privacy Policy</h1>
          <p className="lead">Last Updated: October 17, 2025</p>

          <h2>Our Commitment to Your Privacy</h2>
          <p>
            We take your privacy seriously. This survey is designed with privacy-first principles to
            protect your anonymity while gathering valuable feedback.
          </p>

          <h2>What We Collect</h2>
          <h3>Survey Responses (Anonymous)</h3>
          <ul>
            <li>Your answers to survey questions</li>
            <li>Timestamp of submission</li>
            <li>Event identifier</li>
            <li>
              <strong>No personal identifying information</strong>
            </li>
          </ul>

          <h3>Optional Contact Information (Separate)</h3>
          <p>
            After completing the survey, you may <strong>optionally</strong> provide:
          </p>
          <ul>
            <li>Name</li>
            <li>Email address</li>
            <li>Company</li>
            <li>Role</li>
            <li>Consent for follow-up</li>
          </ul>

          <div className="my-4 rounded-lg bg-blue-50 p-4">
            <p className="font-semibold text-blue-900">Important:</p>
            <p className="text-blue-800">
              Contact information is stored completely separately from your survey responses and
              cannot be linked back to your answers.
            </p>
          </div>

          <h2>Complete Data Separation</h2>
          <ol>
            <li>
              <strong>No Linkage:</strong> Survey responses and contact information are stored in
              separate database tables
            </li>
            <li>
              <strong>No Foreign Keys:</strong> There is no database relationship connecting your
              responses to your contact details
            </li>
            <li>
              <strong>Random Identifiers:</strong> Each submission uses a randomly generated ID
            </li>
            <li>
              <strong>No Tracking:</strong> We do not use cookies, browser fingerprinting, or any
              other tracking mechanisms
            </li>
          </ol>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Skip the contact form entirely</li>
            <li>Withdraw consent for follow-up at any time</li>
            <li>Request deletion of your contact information</li>
            <li>Request a copy of any personal information we hold</li>
          </ul>

          <div className="mt-8">
            <a href="/" className="btn-primary">
              Back to Survey
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
