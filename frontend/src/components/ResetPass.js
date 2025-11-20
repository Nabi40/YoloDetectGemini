'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { parseResponse } from '../lib/api';

export default function ResetPass() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const qEmail = searchParams?.get('email') ?? '';
    const qOtp = searchParams?.get('otp') ?? '';
    if (qEmail) setEmail(qEmail);
    if (qOtp) setOtp(qOtp);
  }, [searchParams]);

  async function handleReset(event) {
    event.preventDefault();
    setErrorMessage('');

    if (!password) {
      setErrorMessage('Please enter a new password.');
      return;
    }
    if (password !== confirm) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      // Try multiple common reset endpoints in case the backend uses a slightly different path
      

      let lastError = null;
      for (const path of candidates) {
        const url = `${process.env.NEXT_PUBLIC_DETECT_API}/auth/replace-password/`;
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password }),
          });

          // Attempt to parse response (will throw if not JSON)
          const data = await parseResponse(resp);

          if (resp.ok && data?.success) {
            router.push('/');
            return;
          }

          // If server responded JSON but not success, surface message
          lastError = data?.detail || data?.message || JSON.stringify(data);
          // continue to next candidate
        } catch (err) {
          // keep lastError and try next candidate
          lastError = err instanceof Error ? err.message : String(err);
        }
      }

      setErrorMessage(lastError || 'Failed to reset password');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Reset request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 px-4 py-12 font-[family:'Inter',sans-serif]">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl shadow-black/25 lg:flex">
        <section className="flex flex-1 flex-col justify-center p-8 lg:p-12">
          <div className="mb-9 space-y-2">
            <h2 className="text-3xl font-bold text-slate-900">Reset Password</h2>
            <p className="text-sm font-medium text-slate-500">Enter a new password for your account</p>
          </div>

          <form className="space-y-6" onSubmit={handleReset}>
            {errorMessage && <div className="rounded-md bg-rose-50 p-3 text-sm font-semibold text-rose-700">{errorMessage}</div>}

            <div className="space-y-2">
              <label htmlFor="resetEmail" className="text-[15px] font-semibold text-slate-700 mb-2">Email Address</label>
              <input
                id="resetEmail"
                type="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="resetOtp" className="text-[15px] font-semibold text-slate-700 mb-2">OTP</label>
              <input
                id="resetOtp"
                type="text"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-[15px] font-semibold text-slate-700 mb-2">New Password</label>
              <input
                id="newPassword"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-[15px] font-semibold text-slate-700 mb-2">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-linear-to-r from-blue-600 to-blue-800 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5 hover:shadow-blue-700/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
