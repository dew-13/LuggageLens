import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from './store/authStore';
import apiClient from './services/apiClient';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setToken, setUser } = useAuthStore();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirm, setShowSignupConfirm] = useState(false);

  // Load saved credentials if "Remember me" was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setLoginEmail(savedEmail);
      setLoginPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Call backend API using centralized API client
      const { data } = await apiClient.post('/auth/login', {
        email: loginEmail,
        password: loginPassword
      });

      console.log('Login successful:', data);

      // Handle "Remember me" functionality
      if (rememberMe) {
        localStorage.setItem('savedEmail', loginEmail);
        localStorage.setItem('savedPassword', loginPassword);
      } else {
        localStorage.removeItem('savedEmail');
        localStorage.removeItem('savedPassword');
      }

      // Save token and user info
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update auth store
      setToken(data.token);
      setUser(data.user);

      // Reset form
      setLoginEmail('');
      setLoginPassword('');

      // Redirect to dashboard based on role
      if (data.user.role === 'passenger') {
        navigate('/passenger/dashboard');
      } else if (data.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      alert('Login error: ' + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Validate password confirmation
      if (signupPassword !== signupConfirm) {
        console.error('Passwords do not match');
        alert('Passwords do not match');
        setIsLoading(false);
        return;
      }

      // Call backend API to register new passenger user
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          password: signupPassword,
          role: 'passenger'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data = await response.json();

      // Verify user was created in database
      if (!data.user || !data.user._id || !data.token) {
        throw new Error('User registration incomplete - invalid response from server');
      }

      console.log('Signup successful:', data);
      alert('Registration successful! Please log in.');
      // Reset form
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');
      setIsSignUp(false);
    } catch (error) {
      console.error('Signup error:', error);
      alert('Signup error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      console.log('Google Signup Success');

      // Send Google credential to backend for verification and account creation
      const response = await fetch('http://localhost:5000/api/auth/google-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google signup failed');
      }

      const data = await response.json();
      console.log('Google signup successful:', data);

      // Save token and user info
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update auth store
      setToken(data.token);
      setUser(data.user);

      // Reset form
      setSignupEmail('');
      setSignupPassword('');
      setSignupConfirm('');

      alert('Registration successful! Welcome to BaggageLens');
      setIsSignUp(false);

      // Redirect to dashboard
      setTimeout(() => {
        navigate('/passenger/dashboard');
      }, 500);
    } catch (error) {
      console.error('Signup with Google error:', error);
      alert('Google signup error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      console.log('Google Login Success');

      // Send Google credential to backend for verification
      const response = await fetch('http://localhost:5000/api/auth/google-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: credentialResponse.credential
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Google login failed');
      }

      const data = await response.json();
      console.log('Google login successful:', data);

      // Save token and user info
      localStorage.setItem('jwt_token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Update auth store
      setToken(data.token);
      setUser(data.user);

      // Reset form
      setLoginEmail('');
      setLoginPassword('');

      // Redirect to dashboard based on role
      if (data.user.role === 'passenger') {
        navigate('/passenger/dashboard');
      } else if (data.user.role === 'staff') {
        navigate('/staff/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login with Google error:', error);
      alert('Google login error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send reset email');
      }

      alert('Password reset email sent! Check your inbox.');
      setForgotEmail('');
      setShowForgotPassword(false);
    } catch (error) {
      console.error('Forgot password error:', error);
      alert('Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-transparent">
      <div className={`relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl w-full max-w-[850px] min-h-[600px] overflow-hidden ${isSignUp ? 'right-panel-active' : ''}`}
        style={{
          transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)'
        }}>

        {/* Mobile Toggle Buttons */}
        <div className="md:hidden absolute top-0 left-0 right-0 flex z-50 bg-black/50 border-b border-white/10">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${!isSignUp ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
          >
            Log In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-4 font-bold text-sm transition-colors ${isSignUp ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Sign Up Form */}
        <div className="absolute top-0 h-full transition-all duration-700 w-full md:w-1/2 left-0 opacity-0 z-10 form-container-signup"
          style={isSignUp ? { transform: 'translateX(100%)', opacity: 1, zIndex: 5, pointerEvents: 'auto' } : { transform: 'translateX(0%)', opacity: 0, zIndex: 1, pointerEvents: 'none' }}>
          <form onSubmit={handleSignup} className="h-full flex flex-col justify-center items-center px-8 md:px-12 py-8 bg-transparent text-center">
            <h1 className="font-bold text-3xl mb-6 text-white tracking-tight">Create Account</h1>

            <div className="w-full space-y-4">
              <div className="text-left group">
                <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 block transition-colors group-focus-within:text-white">Email</label>
                <div className="flex items-center px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus-within:bg-black/40 focus-within:border-white/30 transition-all">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    className="ml-3 bg-transparent border-none w-full focus:outline-none text-sm text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="text-left group">
                <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 block transition-colors group-focus-within:text-white">Password</label>
                <div className="flex items-center px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus-within:bg-black/40 focus-within:border-white/30 transition-all">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    placeholder="Create Password"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    className="ml-3 bg-transparent border-none w-full focus:outline-none text-sm text-white placeholder-gray-500"
                  />
                  <button type="button" onClick={() => setShowSignupPassword(!showSignupPassword)} className="text-gray-500 hover:text-white transition-colors">
                    {showSignupPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="text-left group">
                <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 block transition-colors group-focus-within:text-white">Confirm Password</label>
                <div className="flex items-center px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus-within:bg-black/40 focus-within:border-white/30 transition-all">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type={showSignupConfirm ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={signupConfirm}
                    onChange={e => setSignupConfirm(e.target.value)}
                    className="ml-3 bg-transparent border-none w-full focus:outline-none text-sm text-white placeholder-gray-500"
                  />
                  <button type="button" onClick={() => setShowSignupConfirm(!showSignupConfirm)} className="text-gray-500 hover:text-white transition-colors">
                    {showSignupConfirm ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 cursor-pointer accent-white rounded bg-white/10 border-white/20"
                />
                <label htmlFor="agree-terms" className="text-xs text-gray-400 cursor-pointer">
                  I agree to the <a href="/terms" className="text-white underline hover:text-gray-300">Terms and Conditions</a>
                </label>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-white text-black rounded-lg py-3 font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Sign Up
              </button>
            </div>

            <div className="w-full mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-500">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="flex justify-center mt-2">
                <GoogleLogin
                  onSuccess={handleGoogleSignupSuccess}
                  onError={() => alert('Registration Failed')}
                  theme="filled_black"
                  shape="pill"
                  useOneTap
                />
              </div>
            </div>
          </form>
        </div>

        {/* Sign In Form */}
        <div className="absolute top-0 h-full transition-all duration-700 w-full md:w-1/2 left-0 z-20 form-container-signin"
          style={isSignUp ? { transform: 'translateX(100%)', opacity: 0, zIndex: 1, pointerEvents: 'none' } : { transform: 'translateX(0%)', opacity: 1, zIndex: 5, pointerEvents: 'auto' }}>
          <form onSubmit={handleLogin} className="h-full flex flex-col justify-center items-center px-8 md:px-12 py-8 bg-transparent text-center">
            <h1 className="font-bold text-3xl mb-8 text-white tracking-tight">Welcome Back</h1>

            <div className="w-full space-y-4">
              <div className="text-left group">
                <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 block transition-colors group-focus-within:text-white">Email</label>
                <div className="flex items-center px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus-within:bg-black/40 focus-within:border-white/30 transition-all">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="email"
                    placeholder="Enter your Email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="ml-3 bg-transparent border-none w-full focus:outline-none text-sm text-white placeholder-gray-500"
                  />
                </div>
              </div>

              <div className="text-left group">
                <label className="text-xs font-semibold text-gray-300 ml-1 mb-1 block transition-colors group-focus-within:text-white">Password</label>
                <div className="flex items-center px-4 py-3 rounded-lg border border-white/10 bg-white/5 focus-within:bg-black/40 focus-within:border-white/30 transition-all">
                  <svg className="w-4 h-4 text-gray-400 group-focus-within:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    placeholder="Enter Password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="ml-3 bg-transparent border-none w-full focus:outline-none text-sm text-white placeholder-gray-500"
                  />
                  <button type="button" onClick={() => setShowLoginPassword(!showLoginPassword)} className="text-gray-500 hover:text-white transition-colors">
                    {showLoginPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center mt-2 text-xs">
                <div className="flex items-center gap-2">
                  <input
                    id="keep-signed-in"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 cursor-pointer accent-white rounded bg-white/10 border-white/20"
                  />
                  <label htmlFor="keep-signed-in" className="text-gray-400 cursor-pointer hover:text-white transition-colors">Remember me</label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-gray-400 hover:text-white hover:underline transition-colors focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-white text-black rounded-lg py-3 font-bold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Sign In
              </button>
            </div>

            <div className="w-full mt-6">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-xs text-gray-500">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>
              <div className="flex justify-center mt-2">
                <GoogleLogin
                  onSuccess={handleGoogleLoginSuccess}
                  onError={() => alert('Login Failed')}
                  theme="filled_black"
                  shape="pill"
                  useOneTap
                />
              </div>
            </div>
          </form>
        </div>

        {/* Sliding Overlay */}
        <div className="absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 z-50 hidden md:block"
          style={{ transform: isSignUp ? 'translateX(-100%)' : 'translateX(0)' }}>
          <div className="bg-black relative -left-full h-full w-[200%] transition-transform duration-700 flex items-center justify-center border-l border-white/10"
            style={{ transform: isSignUp ? 'translateX(50%)' : 'translateX(0)' }}>

            {/* Left Overlay Panel (Show on Sign Up) */}
            <div className="absolute top-0 flex flex-col items-center justify-center h-full w-1/2 left-0 px-12 text-center transition-transform duration-700 space-y-6"
              style={{ transform: isSignUp ? 'translateX(0)' : 'translateX(-20%)' }}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
              </div>
              <h1 className="font-bold text-3xl text-white">Welcome Back!</h1>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                To keep connected with us please login with your personal info
              </p>
              <button
                className="px-8 py-3 bg-transparent border border-white text-white rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all transform active:scale-95"
                onClick={() => setIsSignUp(false)}
              >
                Sign In
              </button>
            </div>

            {/* Right Overlay Panel (Show on Sign In) */}
            <div className="absolute top-0 flex flex-col items-center justify-center h-full w-1/2 right-0 px-12 text-center transition-transform duration-700 space-y-6"
              style={{ transform: isSignUp ? 'translateX(20%)' : 'translateX(0)' }}>
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 animate-pulse">
                <svg className="w-10 h-10 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h1 className="font-bold text-3xl text-white">Hello, Friend!</h1>
              <p className="text-gray-400 font-light text-sm leading-relaxed">
                Enter your personal details and start your journey with BaggageLens
              </p>
              <button
                className="px-8 py-3 bg-transparent border border-white text-white rounded-lg font-bold text-sm tracking-wider uppercase hover:bg-white hover:text-black transition-all transform active:scale-95"
                onClick={() => setIsSignUp(true)}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60]">
          <div className="bg-black border border-white/20 rounded-xl p-8 w-96 max-w-full shadow-2xl relative">
            <button
              onClick={() => setShowForgotPassword(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold text-white mb-2">Reset Password</h2>
            <p className="text-sm text-gray-400 mb-6">Enter your email address to receive a recovery link.</p>

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-white/50 focus:outline-none text-sm text-white placeholder-gray-600 transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 px-4 py-2.5 border border-white/20 rounded-lg text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="flex-1 px-4 py-2.5 bg-white text-black rounded-lg font-semibold text-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Sending...' : 'Send Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

