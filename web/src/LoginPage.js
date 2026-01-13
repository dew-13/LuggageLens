import React, { useState } from 'react';
import signupVideo from './images/signup.mp4';
import loginVideo from './images/login.mp4';
import googleIcon from './images/google.png';
import loginBg from './images/loginbg.jpg';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Login attempt:', { loginEmail, loginPassword });
      // Redirect or show error
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      console.log('Signup attempt:', { signupEmail, signupPassword, signupConfirm });
      // Redirect or show error
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignupSuccess = async (credentialResponse) => {
    try {
      console.log('Google Signup Success:', credentialResponse);
      // TODO: Send credential to backend for verification
      // const response = await fetch('/api/auth/google-signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: credentialResponse.credential })
      // });
      // Redirect on success
    } catch (error) {
      console.error('Signup with Google error:', error);
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      console.log('Google Login Success:', credentialResponse);
      // TODO: Send credential to backend for verification
      // const response = await fetch('/api/auth/google-login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ token: credentialResponse.credential })
      // });
      // Redirect on success
    } catch (error) {
      console.error('Login with Google error:', error);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center px-1" style={{
      backgroundImage: `url(${loginBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      margin: 0,
      padding: 0
    }}>
      <div className={`container rounded-xl overflow-hidden border relative w-[400px] max-w-full min-h-[340px] ${isSignUp ? 'right-panel-active' : ''}`}
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
        {/* Sign Up Form */}
        <div className="form-container sign-up-container absolute top-0 left-0 h-full w-1/2 opacity-0 z-1 transition-all duration-700" style={isSignUp ? { transform: 'translateX(100%)', opacity: 1, zIndex: 5, animation: 'show 0.6s' } : {}}>
          <form onSubmit={handleSignup} className="h-full flex flex-col justify-center items-center px-3 py-4" style={{ background: '#133458' }}>
            <h1 className="font-bold text-sm mb-2 text-white text-center w-full">Create Account</h1>
            <div className="w-full flex flex-col gap-2">
              <div>
                <label className="text-2xs font-semibold text-white text-left block mb-0.5" style={{fontSize: '0.65rem'}}>Email</label>
                <input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} className="w-full bg-white/15 border-none rounded-full py-1 px-2 text-2xs text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 transition-all" style={{fontSize: '0.65rem'}} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-white text-left block mb-0.5" style={{fontSize: '0.65rem'}}>Password</label>
                <input type="password" placeholder="••••••••" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} className="w-full bg-white/15 border-none rounded-full py-1 px-2 text-2xs text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 transition-all" style={{fontSize: '0.65rem'}} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-white text-left block mb-0.5" style={{fontSize: '0.65rem'}}>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={signupConfirm} onChange={e => setSignupConfirm(e.target.value)} className="w-full bg-white/15 border-none rounded-full py-1 px-2 text-2xs text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 transition-all" style={{fontSize: '0.65rem'}} />
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white rounded-full py-1 font-bold text-2xs tracking-widest shadow-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors mt-1" style={{fontSize: '0.65rem'}}>Sign Up</button>

            </div>
          </form>
        </div>
        {/* Sign In Form */}
        <div className="form-container sign-in-container absolute top-0 left-0 h-full w-1/2 z-2 transition-all duration-700" style={isSignUp ? { transform: 'translateX(100%)' } : {}}>
          <form onSubmit={handleLogin} className="h-full flex flex-col justify-center items-center px-3 py-4" style={{ background: '#133458' }}>
            <h1 className="font-bold text-sm mb-2 text-white text-center w-full">Login</h1>
            <div className="w-full flex flex-col gap-2">
              <div>
                <label className="text-2xs font-semibold text-white text-left block mb-0.5" htmlFor="login-email" style={{fontSize: '0.65rem'}}>Username</label>
                <input id="login-email" type="email" placeholder="Paul Flavius" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full bg-white/15 border-none rounded-full py-1 px-2 text-2xs text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 transition-all" style={{fontSize: '0.65rem'}} />
              </div>
              <div>
                <label className="text-2xs font-semibold text-white text-left block mb-0.5" htmlFor="login-password" style={{fontSize: '0.65rem'}}>Password</label>
                <input id="login-password" type="password" placeholder="••••••••" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} className="w-full bg-white/15 border-none rounded-full py-1 px-2 text-2xs text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white/25 transition-all" style={{fontSize: '0.65rem'}} />
              </div>
              <div className="flex items-center mt-0.5">
                <input id="keep-signed-in" type="checkbox" className="accent-white w-2.5 h-2.5 mr-1.5 cursor-pointer" />
                <label htmlFor="keep-signed-in" className="text-2xs text-white select-none cursor-pointer font-medium" style={{fontSize: '0.65rem'}}>Keep me Signed in</label>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white rounded-full py-1 font-bold text-2xs tracking-widest shadow-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors mt-1" style={{fontSize: '0.65rem'}}>Sign In</button>

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
    </div>
  );
}
