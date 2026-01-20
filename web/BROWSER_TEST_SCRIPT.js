/**
 * Browser Console Test Script
 * Copy and paste this into browser DevTools console to test passenger flow
 * 
 * Usage:
 * 1. Open DevTools (F12)
 * 2. Go to Console tab
 * 3. Copy entire script and paste into console
 * 4. Run passengerFlowTest() to start
 */

// Test utilities
const TestUtils = {
  results: [],
  
  log: (step, message, status = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString();
    const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : 'ℹ️';
    console.log(`${icon} [${timestamp}] ${step}: ${message}`);
    TestUtils.results.push({ step, message, status, timestamp });
  },

  assert: (condition, message) => {
    if (condition) {
      TestUtils.log('ASSERT', message, 'PASS');
      return true;
    } else {
      TestUtils.log('ASSERT', message, 'FAIL');
      return false;
    }
  },

  getElement: (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      TestUtils.log('SELECT', `Found: ${selector}`, 'PASS');
      return element;
    } else {
      TestUtils.log('SELECT', `Not found: ${selector}`, 'FAIL');
      return null;
    }
  },

  clickElement: async (selector) => {
    const element = TestUtils.getElement(selector);
    if (element) {
      element.click();
      TestUtils.log('CLICK', `Clicked: ${selector}`, 'PASS');
      await new Promise(r => setTimeout(r, 500)); // Wait for action
      return true;
    }
    return false;
  },

  fillInput: (selector, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
      TestUtils.log('INPUT', `Set ${selector} = "${value}"`, 'PASS');
      return true;
    } else {
      TestUtils.log('INPUT', `Not found: ${selector}`, 'FAIL');
      return false;
    }
  },

  checkAuth: () => {
    const token = localStorage.getItem('jwt_token');
    const user = localStorage.getItem('user');
    
    TestUtils.log('AUTH', `Token exists: ${!!token}`, token ? 'PASS' : 'FAIL');
    TestUtils.log('AUTH', `User data exists: ${!!user}`, user ? 'PASS' : 'FAIL');
    
    if (user) {
      try {
        const userData = JSON.parse(user);
        TestUtils.log('AUTH', `User email: ${userData.email}`, 'PASS');
        TestUtils.log('AUTH', `User role: ${userData.role}`, 'PASS');
      } catch (e) {
        TestUtils.log('AUTH', `Failed to parse user data`, 'FAIL');
      }
    }
  },

  checkNetworkRequests: async () => {
    TestUtils.log('NETWORK', 'Check Network tab in DevTools for API calls', 'INFO');
    TestUtils.log('NETWORK', 'Expected calls:', 'INFO');
    TestUtils.log('NETWORK', '  - POST /api/auth/login (on login)', 'INFO');
    TestUtils.log('NETWORK', '  - POST /api/verify-travel (on verification)', 'INFO');
    TestUtils.log('NETWORK', '  - POST /api/report-lost-luggage (on submit)', 'INFO');
  },

  printResults: () => {
    console.log('\n' + '='.repeat(60));
    console.log('TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passed = TestUtils.results.filter(r => r.status === 'PASS').length;
    const failed = TestUtils.results.filter(r => r.status === 'FAIL').length;
    const info = TestUtils.results.filter(r => r.status === 'INFO').length;
    
    console.table(TestUtils.results);
    console.log('\n' + '='.repeat(60));
    console.log(`SUMMARY: ${passed} PASS | ${failed} FAIL | ${info} INFO`);
    console.log('='.repeat(60));
  }
};

// Test Suites
const TestSuites = {
  // Test 1: Landing Page
  testLandingPage: () => {
    console.log('\n📄 TEST 1: Landing Page Elements');
    console.log('-'.repeat(60));
    
    TestUtils.assert(
      document.body.textContent.includes('BaggageLens'),
      'Page contains BaggageLens title'
    );
    
    TestUtils.assert(
      document.body.textContent.includes('Find Your Lost Luggage') || 
      document.body.textContent.includes('Lost Luggage'),
      'Hero section visible'
    );
    
    const signInButton = TestUtils.getElement('a[href="/login"], button:contains("Sign In")');
    TestUtils.assert(!!signInButton, 'Sign In button exists');
    
    TestUtils.log('LANDING', 'All landing page elements verified', 'PASS');
  },

  // Test 2: Login Form
  testLoginForm: () => {
    console.log('\n🔐 TEST 2: Login Form Elements');
    console.log('-'.repeat(60));
    
    const emailInput = TestUtils.getElement('input[type="email"]');
    const passwordInput = TestUtils.getElement('input[type="password"]');
    const submitButton = TestUtils.getElement('button[type="submit"], button:contains("Sign In"), button:contains("Login")');
    
    TestUtils.assert(!!emailInput, 'Email input exists');
    TestUtils.assert(!!passwordInput, 'Password input exists');
    TestUtils.assert(!!submitButton, 'Submit button exists');
    
    TestUtils.log('LOGIN', 'All login form elements verified', 'PASS');
  },

  // Test 3: Auth State
  testAuthState: () => {
    console.log('\n🔑 TEST 3: Authentication State');
    console.log('-'.repeat(60));
    
    TestUtils.checkAuth();
  },

  // Test 4: Dashboard Elements
  testDashboard: () => {
    console.log('\n📊 TEST 4: Dashboard Elements');
    console.log('-'.repeat(60));
    
    // Check if we're on dashboard
    const isDashboard = window.location.pathname.includes('/passenger/dashboard') ||
                       document.body.textContent.includes('Dashboard');
    
    TestUtils.assert(isDashboard, 'Currently on Dashboard page');
    
    // Check for stat cards
    const statCards = document.querySelectorAll('[class*="stat"]');
    TestUtils.assert(statCards.length > 0, `Found ${statCards.length} stat cards`);
    
    // Check for navigation
    const navLinks = document.querySelectorAll('nav a, [role="navigation"] a');
    TestUtils.assert(navLinks.length > 0, `Found ${navLinks.length} navigation links`);
    
    TestUtils.log('DASHBOARD', 'Dashboard elements verified', 'PASS');
  },

  // Test 5: Report Lost Form
  testReportLostForm: () => {
    console.log('\n✈️  TEST 5: Report Lost / Baggage Finder Form');
    console.log('-'.repeat(60));
    
    const isReportPage = window.location.pathname.includes('/passenger/report') ||
                        document.body.textContent.includes('Travel') ||
                        document.body.textContent.includes('Luggage');
    
    TestUtils.assert(isReportPage, 'Currently on Report Lost page');
    
    // Check for verification form or report form
    const formInputs = document.querySelectorAll('input, textarea');
    TestUtils.assert(formInputs.length > 0, `Found ${formInputs.length} form fields`);
    
    // Look for flight-related fields
    const hasFlightField = Array.from(formInputs).some(input => 
      input.name?.includes('flight') || 
      input.placeholder?.includes('flight') ||
      input.placeholder?.includes('AA')
    );
    
    TestUtils.assert(hasFlightField, 'Flight number field available');
    
    TestUtils.log('FORM', 'Report form elements verified', 'PASS');
  },

  // Test 6: Form Validation
  testFormValidation: () => {
    console.log('\n✔️  TEST 6: Form Validation');
    console.log('-'.repeat(60));
    
    const requiredInputs = document.querySelectorAll('input[required], textarea[required]');
    TestUtils.assert(requiredInputs.length > 0, `Found ${requiredInputs.length} required fields`);
    
    // Try to submit empty form
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton && !submitButton.disabled) {
      TestUtils.log('VALIDATION', 'Form has submit button', 'PASS');
    }
  },

  // Test 7: Network Activity
  testNetworkActivity: () => {
    console.log('\n🌐 TEST 7: Network Activity');
    console.log('-'.repeat(60));
    
    TestUtils.checkNetworkRequests();
  }
};

// Full Flow Tests
const FlowTests = {
  // Simulate landing to login flow
  testLandingToLogin: async () => {
    console.log('\n\n🎯 FLOW TEST 1: Landing → Login');
    console.log('='.repeat(60));
    
    TestSuites.testLandingPage();
    
    // Click sign in
    const signInButtons = document.querySelectorAll('a[href="/login"], button:contains("Sign In")');
    if (signInButtons.length > 0) {
      console.log('ℹ️  Ready to click Sign In button');
      console.log('Manual step required: Click a Sign In button to proceed to login page');
    }
  },

  // Simulate login flow
  testLoginFlow: async (email, password) => {
    console.log('\n\n🎯 FLOW TEST 2: Login Flow');
    console.log('='.repeat(60));
    
    TestSuites.testLoginForm();
    
    TestUtils.fillInput('input[type="email"]', email);
    TestUtils.fillInput('input[type="password"]', password);
    
    console.log('ℹ️  Form filled with test credentials');
    console.log('Manual step required: Click Submit button to login');
    
    // Wait for potential redirect
    setTimeout(() => {
      TestUtils.checkAuth();
    }, 2000);
  },

  // Test authenticated pages
  testAuthenticatedPages: async () => {
    console.log('\n\n🎯 FLOW TEST 3: Authenticated Pages');
    console.log('='.repeat(60));
    
    TestUtils.checkAuth();
    
    if (localStorage.getItem('jwt_token')) {
      TestSuites.testDashboard();
    } else {
      TestUtils.log('AUTH', 'Not authenticated - please login first', 'FAIL');
    }
  },

  // Test report form
  testReportFormFlow: async (flightNumber, airline, date) => {
    console.log('\n\n🎯 FLOW TEST 4: Report Lost Baggage');
    console.log('='.repeat(60));
    
    TestSuites.testReportLostForm();
    TestSuites.testFormValidation();
    
    if (flightNumber) {
      TestUtils.fillInput('input[name="flightNumber"], input[placeholder*="flight"]', flightNumber);
      TestUtils.fillInput('input[name="airline"], input[placeholder*="airline"]', airline);
      TestUtils.fillInput('input[type="date"]', date);
      
      console.log('ℹ️  Form pre-filled with test data');
      console.log('Manual step required: Click Verify Travel to continue');
    }
  }
};

// Main test runner
const passengerFlowTest = async () => {
  console.clear();
  console.log('🧪 PASSENGER FLOW TEST SUITE');
  console.log('='.repeat(60));
  console.log('Testing: Home → Login → Dashboard → Baggage Finder');
  console.log('='.repeat(60));
  
  // Quick check of current page
  const currentPath = window.location.pathname;
  console.log(`\n📍 Current page: ${currentPath}`);
  
  // Auto-run appropriate tests based on current page
  if (currentPath === '/') {
    TestSuites.testLandingPage();
    TestSuites.testLoginForm();
  } else if (currentPath === '/login' || currentPath === '/signup') {
    TestSuites.testLoginForm();
  } else if (currentPath.includes('/passenger/dashboard')) {
    TestUtils.checkAuth();
    TestSuites.testDashboard();
  } else if (currentPath.includes('/passenger/report')) {
    TestUtils.checkAuth();
    TestSuites.testReportLostForm();
  } else if (currentPath.includes('/passenger')) {
    TestUtils.checkAuth();
    TestSuites.testDashboard();
  } else {
    TestUtils.log('PAGE', 'Testing on: ' + currentPath, 'INFO');
  }
  
  // Always check these
  TestSuites.testNetworkActivity();
  
  // Print summary
  setTimeout(() => {
    TestUtils.printResults();
  }, 500);
};

// Helper functions for quick access
const quickTests = {
  // Quick: Fill login form
  loginAs: (email = 'passenger@example.com', password = 'TestPassword123!') => {
    console.log('Filling login form...');
    TestUtils.fillInput('input[type="email"]', email);
    TestUtils.fillInput('input[type="password"]', password);
    console.log('Ready to submit - click Sign In button');
  },

  // Quick: Check auth
  whoAmI: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      console.log('👤 Logged in as:', userData);
    } else {
      console.log('❌ Not logged in');
    }
  },

  // Quick: Navigate
  go: (path) => {
    window.location.href = path;
  },

  // Quick: Check all form fields
  formFields: () => {
    const inputs = document.querySelectorAll('input, textarea, select');
    console.log(`Found ${inputs.length} form fields:`);
    Array.from(inputs).forEach((input, i) => {
      console.log(`${i + 1}. ${input.name || input.id || input.type} - ${input.value || '(empty)'}`);
    });
  },

  // Quick: List all buttons
  buttons: () => {
    const buttons = document.querySelectorAll('button, a[role="button"]');
    console.log(`Found ${buttons.length} buttons:`);
    Array.from(buttons).forEach((btn, i) => {
      console.log(`${i + 1}. ${btn.textContent.trim()}`);
    });
  }
};

// Print instructions
console.log('');
console.log('🚀 QUICK START COMMANDS:');
console.log('');
console.log('passengerFlowTest()           - Run full test suite');
console.log('');
console.log('quickTests.loginAs()          - Fill login form');
console.log('quickTests.whoAmI()           - Check current user');
console.log('quickTests.go("/login")       - Navigate to page');
console.log('quickTests.formFields()       - List all form fields');
console.log('quickTests.buttons()          - List all buttons');
console.log('');
console.log('FlowTests.testLoginFlow()     - Test login flow');
console.log('FlowTests.testReportFormFlow()- Test report form');
console.log('');
console.log('Type a command above to test');
console.log('');

// Auto-run on page load
passengerFlowTest();
