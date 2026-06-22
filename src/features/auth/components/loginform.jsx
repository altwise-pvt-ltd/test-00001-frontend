import * as React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { login as loginRequest } from '../services/auth';
import { getApiErrorMessage } from '../../../shared/apiError';

const fieldClass =
  'peer w-full rounded-lg border border-border bg-bg/60 px-3.5 pb-2 pt-6 text-base text-text-h ' +
  'outline-none transition-colors duration-200 placeholder-transparent ' +
  'focus:border-accent-border focus:ring-4 focus:ring-accent-bg';

const labelClass =
  'pointer-events-none absolute left-3.5 top-2 font-mono text-[11px] uppercase tracking-[1.5px] text-text/70 ' +
  'transition-all duration-200 ' +
  'peer-placeholder-shown:top-4.5 peer-placeholder-shown:text-sm peer-placeholder-shown:normal-case ' +
  'peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-text/50 ' +
  'peer-focus:top-2 peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[1.5px] peer-focus:text-accent';

const stagger = {
  hidden: { opacity: 0, y: 12 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  }),
};

export function LoginForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const onLogin = useAuthStore((s) => s.onLogin);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState(null);

  // Return the user to wherever a ProtectedRoute bounced them from, or home.
  const from = location.state?.from ?? '/';

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { accessToken } = await loginRequest(email, password);
      await onLogin(accessToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      className="w-full max-w-100"
    >
        <motion.div
          custom={0}
          variants={stagger}
          className="mb-8 flex flex-col items-center text-center"
        >
          <span className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-bg text-accent ring-1 ring-accent-border">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <h1 className="text-[34px] font-semibold leading-tight tracking-[-1px] text-text-h">
            Welcome back
          </h1>
          <p className="mt-2 text-[15px] text-text">
            Sign in to continue to your workspace
          </p>
        </motion.div>

        <motion.form
          custom={1}
          variants={stagger}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-bg/80 p-7 shadow-card backdrop-blur-sm max-[480px]:p-5"
        >
          {error && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-3 text-sm text-red-500"
            >
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="relative mb-4">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={fieldClass}
            />
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
          </div>

          <div className="relative mb-5">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={fieldClass + ' pr-11'}
            />
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-text/60 transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div className="mb-6 flex justify-end">
            <a
              href="#"
              className="font-mono text-[13px] text-accent transition-opacity hover:opacity-70"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-accent px-4 py-3 text-[15px] font-medium text-white transition-all duration-200 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <svg className="animate-spin" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign in
                <svg className="transition-transform duration-200 group-hover:translate-x-0.5" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </>
            )}
          </button>
        </motion.form>

        <motion.p
          custom={2}
          variants={stagger}
          className="mt-6 text-center text-sm text-text"
        >
          Don&apos;t have an account?{' '}
          <a href="#" className="font-medium text-accent transition-opacity hover:opacity-70">
            Create one
          </a>
        </motion.p>
    </motion.div>
  );
}
