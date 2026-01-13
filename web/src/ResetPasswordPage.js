import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import loginBg from './images/loginbg.jpg';

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
    <div className="min-h-screen md:h-screen flex items-center justify-center px-2 sm:px-4 py-4 md:py-0" style={{
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      margin: 0,
      padding: 0
    }}>
      <div className="rounded-lg md:rounded-xl overflow-hidden border relative w-full md:w-[400px]" style={{
        background: 'rgba(19, 52, 88, 0.5)',
        backdropFilter: 'blur(15px)',
        border: '1.5px solid rgba(255, 255, 255, 0.3)',
        boxShadow: `
          0 0 40px rgba(0, 0, 0, 0.5),
          0 20px 60px rgba(0, 0, 0, 0.4),
          inset 0 1px 20px rgba(255, 255, 255, 0.15),
          inset 0 -2px 15px rgba(0, 0, 0, 0.2),
          0 0 30px rgba(19, 52, 88, 0.6)
        `,
        perspective: '1000px',
        transformStyle: 'preserve-3d'
      }}>
        <div className="px-4 sm:px-8 py-8 sm:py-10">
          <h1 className="font-bold text-lg sm:text-2xl mb-2 text-center text-white">Reset Password</h1>
          <p className="text-xs sm:text-sm text-gray-200 text-center mb-6">Enter your new password below</p>

          {isSuccess ? (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p className="font-semibold mb-2">✓ Success!</p>
              <p className="text-sm">{message}</p>
              <p className="text-xs mt-2">Redirecting to login...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {message && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-2">New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-black placeholder-gray-400"
                    minLength="6"
                  />
                  <p className="text-xs text-gray-300 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-200 block mb-2">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 sm:py-2.5 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm text-black placeholder-gray-400"
                    minLength="6"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !token}
                  className="w-full bg-blue-600 text-white rounded-lg py-2.5 sm:py-3 font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400 transition-colors cursor-pointer"
                >
                  {isLoading ? 'Resetting...' : 'Reset Password'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full bg-transparent text-blue-400 border-2 border-blue-400 rounded-lg py-2.5 sm:py-3 font-semibold text-sm hover:bg-blue-400 hover:text-white transition-colors cursor-pointer"
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
