'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseResponse } from '../lib/api';

const API_BASE = process.env.NEXT_PUBLIC_DETECT_API?.trim()

const featureList = [
  {
    title: 'YOLO Object Detection',
    description:
      'Real-time object detection with industry-leading accuracy and performance metrics',
    icon: (
      <path d="M9 11l3 3L22 4" />
    ),
    secondary: <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />,
  },
  {
    title: 'AI-Powered Q&A',
    description:
      "Ask questions about detected objects using Gemini's advanced natural language understanding",
    icon: <circle cx="12" cy="12" r="10" />,
    secondary: (
      <>
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
      </>
    ),
  },
  {
    title: 'Interactive Analysis',
    description: 'Sortable results with detailed confidence scores and bounding box coordinates',
    icon: <rect x="3" y="3" width="7" height="7" />,
    secondary: (
      <>
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </>
    ),
  },
];

const inputWrapperClasses =
  'relative flex items-center rounded-xl border border-slate-200 bg-white shadow-sm transition focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10';
const inputClasses =
  'w-full rounded-xl border-0 bg-transparent py-3 pl-12 pr-12 text-[15px] text-slate-900 placeholder:text-slate-400 focus:outline-none';
const sectionHeadingClasses = 'text-[15px] font-semibold text-slate-700 mb-2';

function FeatureIcon({ icon, secondary }) {
  return (
    <div className="mr-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md">
      <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-white stroke-2" fill="none">
        {icon}
        {secondary}
      </svg>
    </div>
  );
}

function InputIcon({ children }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
      <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={2}>
        {children}
      </svg>
    </span>
  );
}

function PasswordToggle({ isVisible, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
      aria-label={isVisible ? 'Hide password' : 'Show password'}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={2}>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
        {isVisible && <path d="M1 1l22 22" />}
      </svg>
    </button>
  );
}

export default function ReplacePass() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qEmail = searchParams?.get('email') ?? '';
    const qOtp = searchParams?.get('otp') ?? '';
    setEmail(qEmail);
    setOtp(qOtp);
  }, [searchParams]);

  const isTokenMissing = useMemo(() => !email || !otp, [email, otp]);

  const handlePasswordToggle = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  async function handleReplacePassword(event) {
    event.preventDefault();
    setErrorMessage('');

    if (isTokenMissing) {
      setErrorMessage('Missing reset token. Please restart the reset flow.');
      return;
    }

    if (!password || !confirmPassword) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    try {
      setLoading(true);
      const resp = await fetch(`${API_BASE}/auth/replace-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, new_password: password, confirm_password: confirmPassword }),
      });

      const data = await parseResponse(resp);

      if (resp.ok && (data?.success || data?.message)) {
        router.push('/');
      } else {
        const msg = data?.detail || data?.message || JSON.stringify(data) || 'Password reset failed';
        setErrorMessage(String(msg));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-12 font-[family:'Inter',sans-serif]">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/25 lg:flex">
        <section className="relative flex flex-1 flex-col justify-between overflow-hidden bg-linear-to-br from-blue-600 to-blue-900 p-10 text-white">
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="relative z-10 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">AI Vision Platform</p>
            <h1 className="text-3xl font-bold leading-tight lg:text-4xl">Advanced Detection Toolkit</h1>
            <p className="max-w-md text-base text-white/80">
              Advanced object detection and intelligent analysis powered by state-of-the-art machine learning models.
            </p>
          </div>
          <div className="relative z-10 mt-10 space-y-8">
            {featureList.map(({ title, description, icon, secondary }) => (
              <article key={title} className="flex items-start">
                <FeatureIcon icon={icon} secondary={secondary} />
                <div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-1 text-sm text-white/80">{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mb-9 space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-sm font-medium text-slate-500">
              {isTokenMissing ? 'Missing token. Please go back and verify OTP again.' : 'Enter your new password'}
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleReplacePassword}>
            {errorMessage && (
              <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage}</div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className={sectionHeadingClasses}>
                Password
              </label>
              <div className={`${inputWrapperClasses} px-1`}>
                <InputIcon>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </InputIcon>
                <input
                  id="password"
                  type={showPassword.password ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  className={`${inputClasses} font-medium`}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <PasswordToggle
                  isVisible={showPassword.password}
                  onClick={() => handlePasswordToggle('password')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className={sectionHeadingClasses}>
                Confirm Password
              </label>
              <div className={`${inputWrapperClasses} px-1`}>
                <InputIcon>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </InputIcon>
                <input
                  id="confirmPassword"
                  type={showPassword.confirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  className={`${inputClasses} font-medium`}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <PasswordToggle
                  isVisible={showPassword.confirmPassword}
                  onClick={() => handlePasswordToggle('confirmPassword')}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isTokenMissing}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-blue-700/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting password…' : 'Replace Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

