import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/authStore';
import * as jwt_decode from 'jwt-decode';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Divider,
  Chip,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';

function LoginPage() {
    // Custom theme for new color palette
    const theme = createTheme({
      palette: {
        primary: { main: '#133458', contrastText: '#ffffff' },
        secondary: { main: '#96a79c', contrastText: '#133458' },
        background: { default: '#f0f0f1', paper: '#ffffff' },
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontSize: '0.85rem',
              textTransform: 'none',
            },
          },
        },
      },
    });
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, setToken } = useAuthStore();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isSignUp = location.pathname === '/signup';

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');

      const token = credentialResponse.credential;
      const decoded = jwt_decode.jwtDecode(token);

      let role = 'passenger';
      if (decoded.email && (decoded.email.includes('staff') || decoded.email.includes('admin'))) {
        role = 'staff';
      }

      const user = {
        id: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        role: role,
      };

      setUser(user);
      setToken(token);

      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setTimeout(() => {
        navigate(`/${role}`);
      }, 500);
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Failed to sign in with Google. Please try again.');
  };

  const handleDemoLogin = (role) => {
    const mockUser = {
      id: role === 'passenger' ? '1' : '2',
      email: `${role}@example.com`,
      name: role === 'passenger' ? 'John Passenger' : 'Jane Staff',
      role: role,
    };
    setUser(mockUser);
    setToken('demo-token');
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('jwt_token', 'demo-token');
    navigate(`/${role}`);
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs" sx={{ background: '#f0f0f1', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            borderRadius: 3,
            boxShadow: 3,
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <TravelExploreIcon sx={{ m: 1, fontSize: 40, color: '#133458' }} />
          <Typography component="h1" variant="h5" color="primary.main">
            {isSignUp ? 'Create Your Account' : 'Sign In to BaggageLens'}
          </Typography>
          <Box sx={{ mt: 3, width: '100%' }}>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap={false}
              text={isSignUp ? 'signup_with' : 'signin_with'}
              width="100%"
            />

            <Divider sx={{ my: 3, borderColor: '#96a79c' }}>
              <Chip label="Or use demo account" sx={{ bgcolor: '#96a79c', color: '#133458' }} />
            </Divider>

            <Card variant="outlined" sx={{ mb: 1, borderColor: '#96a79c' }}>
              <Button
                fullWidth
                onClick={() => handleDemoLogin('passenger')}
                sx={{ p: 2, textAlign: 'left', color: '#133458' }}
              >
                <Box>
                  <Typography variant="button" display="block">👤 Passenger</Typography>
                  <Typography variant="caption" display="block">passenger@example.com</Typography>
                </Box>
              </Button>
            </Card>
            <Card variant="outlined" sx={{ borderColor: '#96a79c' }}>
              <Button
                fullWidth
                onClick={() => handleDemoLogin('staff')}
                sx={{ p: 2, textAlign: 'left', color: '#133458' }}
              >
                <Box>
                  <Typography variant="button" display="block">👨‍💼 Staff</Typography>
                  <Typography variant="caption" display="block">staff@example.com</Typography>
                </Box>
              </Button>
            </Card>

            <Typography align="center" sx={{ mt: 3, color: '#014769' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <Button onClick={() => navigate(isSignUp ? '/login' : '/signup')} sx={{ color: '#014769' }}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </Button>
            </Typography>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default LoginPage;