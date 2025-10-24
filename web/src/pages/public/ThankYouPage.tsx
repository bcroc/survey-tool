export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-xl text-center">
        <div className="card">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="mb-4">Thank You!</h1>
          <p className="mb-6 text-lg text-gray-600">
            Your feedback has been submitted successfully. We appreciate your time!
          </p>
          <a href="/" className="btn-primary inline-block">
            Take Another Survey
          </a>
        </div>
      </div>
    </div>
  );
}
