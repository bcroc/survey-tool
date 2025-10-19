# Security hardening notes for survey-tool

This repository contains server (API) and web (frontend) pieces. The following notes document the security hardening applied and how to run checks locally.

## Changes applied
- Session hardening
  - `secure` cookie flag is enabled in production only.
  - `sameSite` is set to `lax` by default; consider `strict` if you don't need cross-origin navigation.
  - `trust proxy` is set when running behind a proxy in production.
- Authentication
  - Login endpoint includes input validation (Zod) and a per-IP rate limiter.
  - Sessions are regenerated after successful login to mitigate session fixation.
  - Logout destroys the server session and clears the cookie.
- CSRF
  - `csurf` middleware is applied to admin routes which rely on session cookies.
   - Replaced `csurf` with a small session-backed CSRF implementation to avoid a
     transitive dependency on older `cookie` versions. Admin endpoints still
     require a valid `X-CSRF-Token` header for state-changing requests.
  - Added `GET /api/auth/csrf-token` for the SPA to obtain a CSRF token.
- Input validation
  - Admin endpoints use Zod schemas and the `validate` middleware for updates and creation where applicable.
- Logging & error handling
  - Sensitive fields redacted in logs (password, cookies, etc.).
  - Production error messages are masked for 500 errors.

## How the CSRF flow should work (frontend)
1. On admin page load, fetch the CSRF token from the API:

   GET /api/auth/csrf-token

   The response JSON contains `data.csrfToken`.

2. Set that token as a header for subsequent admin requests (example header):

   X-CSRF-Token: <token>

3. Ensure requests include credentials (cookies) and that the frontend origin matches `FRONTEND_URL` configured in the backend.

### Frontend example (axios)
In the frontend you can fetch the token and attach it to admin requests. The project includes a helper in `web/src/services/api.ts` which:

- Fetches `GET /api/auth/csrf-token` once and caches it in memory.
- Automatically attaches `X-CSRF-Token` to requests whose URL starts with `/admin`.

Example header to include in admin requests:

```
X-CSRF-Token: <token>
```

## Running checks locally
From the `api` directory you can run the provided `check` script which runs lint, types, tests, and an `npm audit` quick check:

```bash
cd "$(pwd)/api"
npm run check
```

If `npm audit` finds issues of concern, consider applying patches or upgrading dependencies.

## Next steps / recommendations
- Add CI workflow to run `npm run check` on PRs.
  - A GitHub Actions workflow was added at `.github/workflows/ci.yml` which runs lint, type-check, tests and a quick audit in the `api` package.
- Add tests for CSRF-protected admin flows (requires authenticated session setup in tests).
- Consider account lockout for admin users instead of hard rate-limiting by IP alone.
- Rotate session secrets and ensure they are stored in secure vaults in production.

---
