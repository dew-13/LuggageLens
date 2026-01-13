import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import LandingPage from './LandingPage';
import LoginPage from './LoginPage';

// Staff Pages
import StaffDashboard from './staff/pages/StaffDashboard';
import StaffCases from './staff/pages/StaffCases';
import StaffMatches from './staff/pages/StaffMatches';
import StaffUsers from './staff/pages/StaffUsers';

// Passenger Pages
import PassengerDashboard from './passenger/pages/PassengerDashboard';
import PassengerMatches from './passenger/pages/PassengerMatches';
import MyCases from './passenger/pages/MyCases';
import ReportLost from './passenger/pages/ReportLost';

import useAuthStore from './store/authStore';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';

function App() {
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedToken = localStorage.getItem('jwt_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
      useAuthStore.setState({
        token: savedToken,
        user: JSON.parse(savedUser)
      });
    }
    
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-gray-900 text-2xl font-semibold">Loading...</div>
    </div>;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <Routes>
          {/* Landing Page - Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<LoginPage />} />

          {/* Staff Routes */}
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/cases" element={<StaffCases />} />
          <Route path="/staff/matches" element={<StaffMatches />} />
          <Route path="/staff/users" element={<StaffUsers />} />

          {/* Passenger Routes */}
          <Route path="/passenger/dashboard" element={<PassengerDashboard />} />
          <Route path="/passenger/cases" element={<MyCases />} />
          <Route path="/passenger/cases/:id" element={<MyCases />} />
          <Route path="/passenger/matches" element={<PassengerMatches />} />
          <Route path="/passenger/report" element={<ReportLost />} />

          {/* Redirect any unknown routes to landing page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

