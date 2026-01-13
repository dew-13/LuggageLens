import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Icon,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f4f6f8',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 700,
    },
  },
});

function LandingPage() {
  const navigate = useNavigate();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppBar position="sticky">
        <Toolbar>
          <TravelExploreIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            BaggageLens
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button color="secondary" variant="contained" onClick={() => navigate('/signup')}>
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Smart Luggage Identification
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Find your lost luggage using advanced AI-powered image matching.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate('/login')}>
              Get Started
            </Button>
            <Button variant="outlined" onClick={() => navigate('/signup')}>
              Learn More
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="md">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <CameraAltIcon fontSize="large" color="primary" />
                <Typography gutterBottom variant="h5" component="h2">
                  Upload Images
                </Typography>
                <Typography>
                  Upload clear photos of your lost luggage from multiple angles.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <SmartToyIcon fontSize="large" color="primary" />
                <Typography gutterBottom variant="h5" component="h2">
                  AI Powered
                </Typography>
                <Typography>
                  Advanced neural networks compare images with 92%+ accuracy.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <FlashOnIcon fontSize="large" color="primary" />
                <Typography gutterBottom variant="h5" component="h2">
                  Instant Results
                </Typography>
                <Typography>
                  Get matches in seconds and track your cases in real-time.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Dashboard Preview Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Dashboard Preview
          </Typography>
          <Grid container spacing={4} sx={{ mt: 4 }}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <DashboardIcon fontSize="large" color="primary" />
                  <Typography gutterBottom variant="h5" component="h2">
                    Passenger Dashboard
                  </Typography>
                  <Typography>
                    Track your lost luggage, view AI matches, and manage your cases.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <PeopleIcon fontSize="large" color="primary" />
                  <Typography gutterBottom variant="h5" component="h2">
                    Staff Dashboard
                  </Typography>
                  <Typography>
                    Manage found items, review AI matches, and assist passengers.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="sm">
          <Typography
            component="h2"
            variant="h3"
            align="center"
            color="text.primary"
            gutterBottom
          >
            Ready to Find Your Luggage?
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            Join thousands of travelers who have successfully recovered their lost luggage.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="contained" onClick={() => navigate('/signup')}>
              Create Account
            </Button>
            <Button variant="outlined" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          BaggageLens
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          Smart luggage identification powered by AI
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 5 }}>
          {'© '}
          {new Date().getFullYear()}
          {' BaggageLens. All rights reserved.'}
        </Typography>
      </Box>
    </ThemeProvider>
  );
}

export default LandingPage;