'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseResponse } from '../lib/api';

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

export default function SendOtp() {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qEmail = searchParams?.get('email') ?? '';
    if (qEmail) setEmail(qEmail);
  }, [searchParams]);

  async function handleVerifyOtp(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!otp.trim()) {
      setErrorMessage('Please enter the OTP code.');
      return;
    }

    try {
      setLoading(true);
      // TODO: Replace with your actual OTP verification API endpoint
      const resp = await fetch(`${process.env.NEXT_PUBLIC_DETECT_API}/auth/verify-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otp.trim() }),
      });

  const data = await parseResponse(resp);

  if (resp.ok && (data?.success)) {
        // OTP verified -> navigate to reset password page with email and otp
        router.push(`/reset-pass?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp.trim())}`);
      } else {
        const msg = data?.detail || data?.message || JSON.stringify(data) || 'OTP verification failed';
        setErrorMessage(String(msg));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'OTP verification request failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleResendOtp() {
    setErrorMessage('');
    setOtp('');

    try {
      setLoading(true);
      // Post email to send-otp endpoint (resend)
      const resp = await fetch(`${process.env.NEXT_PUBLIC_DETECT_API}/auth/send-otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

  const data = await parseResponse(resp);

      if (resp.ok) {
        // Successfully resent OTP
        setErrorMessage('');
      } else {
        const msg = data?.detail || data?.message || JSON.stringify(data) || 'Failed to resend OTP';
        setErrorMessage(String(msg));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Resend OTP request failed');
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
            <h2 className="text-3xl font-bold text-slate-900">Verify OTP</h2>
            <p className="text-sm font-medium text-slate-500">Enter the OTP code sent to your email</p>
          </div>

          <form className="space-y-6" onSubmit={handleVerifyOtp}>
            {errorMessage && (
              <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage}</div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className={sectionHeadingClasses}>
                Email Address
              </label>
              <div className={`${inputWrapperClasses} px-1`}>
                <InputIcon>
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </InputIcon>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className={inputClasses}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className={sectionHeadingClasses}>
                OTP Code
              </label>
              <div className={`${inputWrapperClasses} px-1`}>
                <InputIcon>
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </InputIcon>
                <input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP code"
                  className={inputClasses}
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-blue-700/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying…' : 'Verify OTP'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                className="font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send OTP again
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

