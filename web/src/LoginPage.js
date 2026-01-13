import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import signupVideo from './images/signup.mp4';
import loginVideo from './images/login.mp4';
import loginBg from './images/loginbg.jpg';
import useAuthStore from './store/authStore';

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
      // Call backend API to login
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
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
      alert('Login error: ' + error.message);
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
    <div className="min-h-screen md:h-screen flex items-center justify-center px-2 sm:px-4 py-4 md:py-0" style={{
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      margin: 0,
      padding: 0
    }}>
      <div className={`container rounded-lg md:rounded-xl overflow-hidden border relative w-full md:w-[650px] min-h-[600px] sm:min-h-[650px] md:min-h-[480px] ${isSignUp ? 'right-panel-active' : ''}`}
        style={{ 
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
          transition: 'all 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55)',
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}>
        {/* Mobile Toggle Buttons */}
        <div className="md:hidden absolute top-0 left-0 right-0 flex z-50 bg-white">
          <button
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${!isSignUp ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-3 font-bold text-sm transition-colors ${isSignUp ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Sign Up
          </button>
        </div>
        {/* Sign Up Form */}
        <div className="form-container sign-up-container absolute top-12 md:top-0 md:right-0 left-0 md:left-auto h-[calc(100%-48px)] md:h-full w-full md:w-1/2 transition-all duration-700" style={isSignUp ? { transform: 'translateX(0)', opacity: 1, zIndex: 5 } : { transform: 'translateX(100%)', opacity: 0, zIndex: 1, pointerEvents: 'none' }}>
          <form onSubmit={handleSignup} className="h-full flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto" style={{ background: '#d9ebee', gap: '8px' }}>
            <h1 className="font-bold text-base sm:text-lg md:text-xl mb-1 text-black text-center w-full">Create Account</h1>
            <div className="w-full flex flex-col gap-2">
              <div>
                <label className="text-xs font-semibold text-black text-left block mb-1" htmlFor="signup-email">Email</label>
                <div className="flex items-center px-2 py-0 rounded-lg border-2 border-gray-200 h-10 sm:h-9 transition-all focus-within:border-blue-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="0 0 32 32" height={16} className="text-gray-600"><g data-name="Layer 3" id="Layer_3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor" /></g></svg>
                  <input id="signup-email" type="email" placeholder="Enter your Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="ml-2 border-none w-full h-full focus:outline-none text-sm text-black placeholder-gray-400 font-poppins" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black text-left block mb-1" htmlFor="signup-password">Password</label>
                <div className="flex items-center px-2 py-0 rounded-lg border-2 border-gray-200 h-10 sm:h-9 transition-all focus-within:border-blue-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-600"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor" /></svg>
                  <input id="signup-password" type="password" placeholder="Enter your Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="ml-2 border-none w-full h-full focus:outline-none text-sm text-black placeholder-gray-400 font-poppins" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black text-left block mb-1" htmlFor="signup-confirm-password">Confirm Password</label>
                <div className="flex items-center px-2 py-0 rounded-lg border-2 border-gray-200 h-10 sm:h-9 transition-all focus-within:border-blue-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-600"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor" /></svg>
                  <input id="signup-confirm-password" type="password" placeholder="Confirm Password" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} className="ml-2 border-none w-full h-full focus:outline-none text-sm text-black placeholder-gray-400 font-poppins" />
                </div>
              </div>
              <div className="flex items-start gap-1.5 mt-0.5">
                <input 
                  id="agree-terms" 
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="w-4 h-4 sm:w-3.5 sm:h-3.5 mt-0.5 cursor-pointer accent-blue-600 rounded flex-shrink-0"
                />
                <label htmlFor="agree-terms" className="text-xs text-black select-none cursor-pointer font-medium leading-tight">
                  I agree to the <a href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</a>
                </label>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-black text-white rounded-lg py-2.5 sm:py-2 font-semibold text-xs sm:text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors mt-3 cursor-pointer">Sign Up</button>
            </div>
            <div className="w-full flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleSignupSuccess}
                onError={() => alert('Registration Failed')}
                useOneTap
              />
            </div>
          </form>
        </div>
        {/* Sign In Form */}
        <div className="form-container sign-in-container absolute top-12 md:top-0 left-0 h-[calc(100%-48px)] md:h-full w-full md:w-1/2 transition-all duration-700" style={isSignUp ? { transform: 'translateX(100%)', opacity: 0, zIndex: 1, pointerEvents: 'none' } : { transform: 'translateX(0)', opacity: 1, zIndex: 5 }}>
          <form onSubmit={handleLogin} className="h-full flex flex-col justify-center items-center px-4 sm:px-6 py-6 sm:py-8" style={{ background: '#d9ebee', gap: '8px' }}>
            <h1 className="font-bold text-base sm:text-lg md:text-xl mb-1 text-black text-center w-full">Login</h1>
            <div className="w-full flex flex-col gap-2">
              <div>
                <label className="text-xs font-semibold text-black text-left block mb-1" htmlFor="login-email">Email</label>
                <div className="flex items-center px-2 py-0 rounded-lg border-2 border-gray-200 h-10 sm:h-9 transition-all focus-within:border-blue-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="0 0 32 32" height={16} className="text-gray-600"><g data-name="Layer 3" id="Layer_3"><path d="m30.853 13.87a15 15 0 0 0 -29.729 4.082 15.1 15.1 0 0 0 12.876 12.918 15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0 -1.031-1.711 13.007 13.007 0 1 1 5.458-6.529 2.149 2.149 0 0 1 -4.158-.759v-10.856a1 1 0 0 0 -2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zm-14.853 8.13a6 6 0 1 1 6-6 6.006 6.006 0 0 1 -6 6z" fill="currentColor" /></g></svg>
                  <input id="login-email" type="email" placeholder="Enter your Email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="ml-2 border-none w-full h-full focus:outline-none text-sm text-black placeholder-gray-400 font-poppins" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-black text-left block mb-1" htmlFor="login-password">Password</label>
                <div className="flex items-center px-2 py-0 rounded-lg border-2 border-gray-200 h-10 sm:h-9 transition-all focus-within:border-blue-500 bg-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width={16} viewBox="-64 0 512 512" height={16} className="text-gray-600"><path d="m336 512h-288c-26.453125 0-48-21.523438-48-48v-224c0-26.476562 21.546875-48 48-48h288c26.453125 0 48 21.523438 48 48v224c0 26.476562-21.546875 48-48 48zm-288-288c-8.8125 0-16 7.167969-16 16v224c0 8.832031 7.1875 16 16 16h288c8.8125 0 16-7.167969 16-16v-224c0-8.832031-7.1875-16-16-16zm0 0" fill="currentColor" /><path d="m304 224c-8.832031 0-16-7.167969-16-16v-80c0-52.929688-43.070312-96-96-96s-96 43.070312-96 96v80c0 8.832031-7.167969 16-16 16s-16-7.167969-16-16v-80c0-70.59375 57.40625-128 128-128s128 57.40625 128 128v80c0 8.832031-7.167969 16-16 16zm0 0" fill="currentColor" /></svg>
                  <input id="login-password" type="password" placeholder="Enter your Password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="ml-2 border-none w-full h-full focus:outline-none text-sm text-black placeholder-gray-400 font-poppins" />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-0.5 gap-2 sm:gap-0">
                <div className="flex items-center gap-1.5">
                  <input 
                    id="keep-signed-in" 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 sm:w-3.5 sm:h-3.5 cursor-pointer accent-blue-600 rounded" 
                  />
                  <label htmlFor="keep-signed-in" className="text-xs text-black select-none cursor-pointer font-medium">Remember me</label>
                </div>
                <span 
                  onClick={() => setShowForgotPassword(true)}
                  className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                >
                  Forgot password?
                </span>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-black text-white rounded-lg py-2.5 sm:py-2 font-semibold text-xs sm:text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors mt-3 cursor-pointer">Sign In</button>
            </div>
            <div className="w-full flex justify-center mt-2">
              <GoogleLogin
                onSuccess={handleGoogleLoginSuccess}
                onError={() => alert('Login Failed')}
                useOneTap
              />
            </div>
          </form>
        </div>
        {/* Overlay */}
        <div className="overlay-container absolute top-0 left-1/2 w-1/2 h-full overflow-hidden z-100 transition-transform duration-700" style={isSignUp ? { transform: 'translateX(-100%)' } : {}}>
          <div className="overlay bg-white text-primary absolute left-[-100%] h-full w-[200%] transition-transform duration-700" style={isSignUp ? { transform: 'translateX(50%)', background: '#fff' } : { background: '#fff' }}>
            <div className="overlay-panel overlay-left absolute flex flex-col items-center justify-center px-1.5 text-center top-0 h-full w-1/2 transition-transform duration-700" style={isSignUp ? { transform: 'translateX(0)' } : { transform: 'translateX(-20%)' }}>
              <h1 className="font-bold text-2xs text-secondary-dark mb-1" style={{fontSize: '0.65rem'}}>Welcome Back!</h1>
              <p className="text-2xs font-light mb-2 text-secondary-dark/70 leading-tight" style={{fontSize: '0.55rem'}}>Reconnect with your lost belongings</p>
              <video
                src={signupVideo}
                className="w-44 h-44 mb-1.5 "
                autoPlay
                loop
                muted
                playsInline
                aria-label="Sign up animation"
              />
              <p className="text-2xs font-light mb-2 text-secondary-dark leading-tight" style={{fontSize: '0.6rem'}}>Already have an account? Sign in to access your luggage tracking and find your belongings</p>
              <button className="ghost bg-transparent text-secondary-dark font-bold text-2xs mt-1" style={{fontSize: '0.65rem'}} onClick={() => setIsSignUp(false)}>Sign In Here</button>
            </div>
            <div className="overlay-panel overlay-right absolute flex flex-col items-center justify-center px-1.5 text-center top-0 h-full w-1/2 right-0 transition-transform duration-700" style={isSignUp ? { transform: 'translateX(20%)' } : { transform: 'translateX(0)' }}>
              <h1 className="font-bold text-2xs text-secondary-dark mb-1" style={{fontSize: '0.65rem'}}>Hello, Friend!</h1>
              <p className="text-2xs font-light mb-2 text-secondary-dark/70 leading-tight" style={{fontSize: '0.55rem'}}>Begin your journey to recovery</p>
              <video
                src={loginVideo}
                className="w-46 h-46 mb-1.5 "
                autoPlay
                loop
                muted
                playsInline
                aria-label="Login animation"
              />
              <p className="text-2xs font-light mb-2 text-secondary-dark leading-tight" style={{fontSize: '0.6rem'}}>Don't have an account? Create one to start tracking your luggage and reunite with your belongings</p>
              <button className="ghost bg-transparent text-secondary-dark font-bold text-2xs mt-1" style={{fontSize: '0.65rem'}} onClick={() => setIsSignUp(true)}>Create Account</button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 max-w-full shadow-lg">
            <h2 className="text-lg font-bold text-black mb-4">Reset Password</h2>
            <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold text-black block mb-2">Enter your email address</label>
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                />
              </div>
              <p className="text-xs text-gray-600">We'll send you a link to reset your password</p>
              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg text-black font-semibold text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isLoading || !forgotEmail}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

