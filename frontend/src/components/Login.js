'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setSession } from '../lib/session';
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





export default function Login() {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState({
    loginPassword: false,
    signupPassword: false,
    signupConfirm: false,
  });

  // Controlled form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const heroCopy = useMemo(
    () =>
      activeTab === 'login'
        ? {
            heading: 'Welcome Back',
            sub: 'Enter your credentials to access your account',
            cta: 'Sign In',
          }
        : {
            heading: 'Create Account',
            sub: 'Sign up to start analyzing images with AI',
            cta: 'Create Account',
          },
    [activeTab],
  );

  const handlePasswordToggle = (field) =>
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));

  const renderPasswordField = (fieldId, placeholder, ariaLabel) => (
    <div className="space-y-2" key={fieldId}>
      <label htmlFor={fieldId} className={sectionHeadingClasses}>
        {ariaLabel}
      </label>
      <div className={`${inputWrapperClasses} px-1`}>
        <InputIcon>
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </InputIcon>
        <input
          id={fieldId}
          type={showPassword[fieldId] ? 'text' : 'password'}
          placeholder={placeholder}
          className={`${inputClasses} font-medium`}
          autoComplete={fieldId === 'loginPassword' ? 'current-password' : 'new-password'}
          value={
            fieldId === 'loginPassword'
              ? loginPassword
              : fieldId === 'signupPassword'
              ? signupPassword
              : signupConfirm
          }
          onChange={(e) => {
            const v = e.target.value;
            if (fieldId === 'loginPassword') setLoginPassword(v);
            else if (fieldId === 'signupPassword') setSignupPassword(v);
            else setSignupConfirm(v);
          }}
        />
        <PasswordToggle isVisible={showPassword[fieldId]} onClick={() => handlePasswordToggle(fieldId)} />
      </div>
    </div>
  );

  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setErrorMessage('');

    if (activeTab === 'signup') {
      const fullname = signupName.trim();
      const email = signupEmail.trim();
      const password = signupPassword;
      const confirm = signupConfirm;

      if (!fullname || !email || !password) {
        setErrorMessage('Please fill all fields for signup.');
        return;
      }
      if (password !== confirm) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      try {
        setLoading(true);
        const resp = await fetch(`${process.env.NEXT_PUBLIC_DETECT_API}/auth/signup/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullname, email, password }),
        });

  const data = await parseResponse(resp);

        if (resp.ok && (data?.success || data?.access)) {
          // Save session with tokens and basic user info
          setSession({ access: data.access, refresh: data.refresh, user: { email, fullname } });
          // navigate to dashboard
          router.push('/dashboard');
        } else {
          const msg = data?.detail || data?.message || JSON.stringify(data) || 'Signup failed';
          setErrorMessage(String(msg));
        }
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Signup request failed');
      } finally {
        setLoading(false);
      }

      return;
    }

    // Login flow
    try {
      setLoading(true);
      const resp = await fetch(`${process.env.NEXT_PUBLIC_DETECT_API}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail.trim(), password: loginPassword, remember_me: rememberMe }),
      });

      console.log(resp)
  const data = await parseResponse(resp);
      if (resp.ok && (data?.success || data?.access)) {
        // store tokens according to remember setting
        try {
          if (rememberMe && data.refresh) {
            localStorage.setItem('refresh_token', data.refresh);
          } else {
            localStorage.removeItem('refresh_token');
          }
        } catch (e) {
          // ignore
        }
        try {
          if (data.access) sessionStorage.setItem('access_token', data.access);
        } catch (e) {
          // ignore
        }

        // persist only user profile in the generic session helper
        setSession({ user: { email: loginEmail.trim(), fullname: data.fullname ?? (data.user?.fullname ?? '') } });
        router.push('/dashboard');
      } else {
        const msg = data?.detail || data?.message || JSON.stringify(data) || 'Login failed';
        setErrorMessage(String(msg));
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login request failed');
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
            <h2 className="text-3xl font-bold text-slate-900">{heroCopy.heading}</h2>
            <p className="text-sm font-medium text-slate-500">{heroCopy.sub}</p>
          </div>

          <div className="mb-8 flex gap-2 rounded-2xl bg-slate-100 p-1">
            {['login', 'signup'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-lg shadow-blue-500/10'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  aria-pressed={isActive}
                >
                  {tab === 'login' ? 'Sign In' : 'Sign Up'}
                </button>
              );
            })}
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {errorMessage && (
              <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage}</div>
            )}
            {activeTab === 'login' ? (
              <>
                <div className="space-y-2">
                  <label htmlFor="loginEmail" className={sectionHeadingClasses}>
                    Email Address
                  </label>
                  <div className={`${inputWrapperClasses} px-1`}>
                    <InputIcon>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </InputIcon>
                    <input
                      id="loginEmail"
                      type="email"
                      placeholder="you@example.com"
                      className={inputClasses}
                      autoComplete="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                </div>

                {renderPasswordField('loginPassword', 'Enter your password', 'Password')}

                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="rememberMe" className="flex items-center gap-2 text-slate-600">
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      setErrorMessage('');
                      const email = loginEmail.trim();
                      if (!email) {
                        setErrorMessage('Please enter your email before requesting an OTP.');
                        return;
                      }
                      try {
                        setLoading(true);
                        // Use the configured backend base URL so the request doesn't hit the Next dev server
                        const base = process.env.NEXT_PUBLIC_DETECT_API?.trim() || '';
                        const resp = await fetch(`${base}/auth/send-otp/`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                        const data = await parseResponse(resp);
                        if (resp.ok) {
                          // navigate to verify page with email in query
                          router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
                        } else {
                          const msg = data?.detail || data?.message || JSON.stringify(data) || 'Failed to send OTP';
                          setErrorMessage(String(msg));
                        }
                      } catch (err) {
                        setErrorMessage(err instanceof Error ? err.message : 'Failed to send OTP');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label htmlFor="signupName" className={sectionHeadingClasses}>
                    Full Name
                  </label>
                  <div className={`${inputWrapperClasses} px-1`}>
                    <InputIcon>
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </InputIcon>
                    <input
                      id="signupName"
                      type="text"
                      placeholder="John Doe"
                      className={inputClasses}
                      autoComplete="name"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="signupEmail" className={sectionHeadingClasses}>
                    Email Address
                  </label>
                  <div className={`${inputWrapperClasses} px-1`}>
                    <InputIcon>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </InputIcon>
                    <input
                      id="signupEmail"
                      type="email"
                      placeholder="you@example.com"
                      className={inputClasses}
                      autoComplete="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                </div>

                {renderPasswordField('signupPassword', 'Create a password', 'Password')}
                {renderPasswordField('signupConfirm', 'Confirm your password', 'Confirm Password')}
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-blue-700/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (activeTab === 'login' ? 'Signing in…' : 'Creating account…') : heroCopy.cta}
            </button>

            
            </form>
        </section>
      </div>
    </div>
  );
}