import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';


export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [token]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Both password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      setIsSuccess(true);
      setMessage(data.message);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-[450px] relative overflow-hidden card-animated">
        <div className="px-8 py-10">
          <h1 className="font-bold text-3xl mb-2 text-center text-white tracking-tight">Reset Password</h1>
          <p className="text-sm text-gray-400 text-center mb-8">Enter your new password below</p>

          {isSuccess ? (
            <div className="bg-green-500/10 border border-green-500/20 text-green-200 px-4 py-3 rounded-lg mb-6">
              <p className="font-semibold mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Success!
              </p>
              <p className="text-sm opacity-90">{message}</p>
              <p className="text-xs mt-2 opacity-75">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg mb-6 flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 px-4 py-3 rounded-lg mb-6">
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 ml-1">New Password</label>
                  <div className="relative group">
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-black/40 focus:border-white/50 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                      minLength="6"
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-1">Minimum 6 characters</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300 ml-1">Confirm Password</label>
                  <div className="relative group">
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:bg-black/40 focus:border-white/50 focus:outline-none text-sm text-white placeholder-gray-500 transition-all"
                      minLength="6"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full bg-white text-black rounded-lg py-3.5 font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-lg shadow-white/10 mt-2"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-transparent text-gray-400 border border-white/10 rounded-lg py-3.5 font-semibold text-sm hover:bg-white/5 hover:text-white transition-all transform active:scale-95"
                >
                  Back to Login
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
