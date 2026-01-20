/**
 * Test Data for Passenger Flow Testing
 * Use these sample data sets to test the passenger flow
 */

export const TestUsers = {
  // Standard passenger user
  passenger: {
    email: 'passenger@example.com',
    password: 'TestPassword123!',
    name: 'Test Passenger',
    role: 'passenger',
    id: 'test-user-123'
  },

  // Passenger with no reports
  newPassenger: {
    email: 'new.passenger@example.com',
    password: 'SecurePass456!',
    name: 'New Traveler',
    role: 'passenger',
    id: 'test-user-new'
  },

  // Passenger with multiple reports
  activePassenger: {
    email: 'active.passenger@example.com',
    password: 'ActivePass789!',
    name: 'Active Traveler',
    role: 'passenger',
    id: 'test-user-active',
    reports: 5,
    matches: 2
  },

  // Invalid credentials for testing error handling
  invalidUser: {
    email: 'notexist@example.com',
    password: 'WrongPassword123!'
  }
};

export const TestFlights = {
  // Valid flights for verification
  validFlights: [
    {
      flightNumber: 'AA100',
      airline: 'American Airlines',
      departureCity: 'JFK',
      arrivalCity: 'LAX',
      date: '2024-01-20',
      expectedScore: 85,
      expectedStatus: 'verified'
    },
    {
      flightNumber: 'UA200',
      airline: 'United Airlines',
      departureCity: 'ORD',
      arrivalCity: 'SFO',
      date: '2024-01-19',
      expectedScore: 90,
      expectedStatus: 'verified'
    },
    {
      flightNumber: 'DL300',
      airline: 'Delta Air Lines',
      departureCity: 'ATL',
      arrivalCity: 'MIA',
      date: '2024-01-18',
      expectedScore: 88,
      expectedStatus: 'verified'
    }
  ],

  // Flights that might not be found (manual review needed)
  unknownFlights: [
    {
      flightNumber: 'XX999',
      airline: 'Fake Airlines',
      departureCity: 'ABC',
      arrivalCity: 'XYZ',
      date: '2024-01-20',
      expectedScore: 20,
      expectedStatus: 'review'
    },
    {
      flightNumber: 'TEST01',
      airline: 'Test Airlines',
      departureCity: 'TST',
      arrivalCity: 'TST',
      date: '2024-01-20',
      expectedScore: 35,
      expectedStatus: 'review'
    }
  ],

  // Borderline flights (likely but not confirmed)
  likelyFlights: [
    {
      flightNumber: 'BA400',
      airline: 'British Airways',
      departureCity: 'LHR',
      arrivalCity: 'JFK',
      date: '2024-01-20',
      expectedScore: 65,
      expectedStatus: 'likely'
    },
    {
      flightNumber: 'LH500',
      airline: 'Lufthansa',
      departureCity: 'FRA',
      arrivalCity: 'ORD',
      date: '2024-01-19',
      expectedScore: 55,
      expectedStatus: 'likely'
    }
  ]
};

export const TestLuggage = {
  // Common luggage descriptions for reporting
  luggage: [
    {
      description: 'Black Samsonite suitcase, 24 inches, with TSA lock and luggage tag',
      color: 'Black',
      brand: 'Samsonite',
      dateLost: '2024-01-20',
      location: 'JFK Airport, Terminal 4',
      contact: '+1-555-123-4567',
      distinguishingFeatures: 'Red ribbon on handle, small scratch on corner'
    },
    {
      description: 'Blue carry-on duffel bag with laptop compartment',
      color: 'Blue',
      brand: 'North Face',
      dateLost: '2024-01-19',
      location: 'ORD Airport, Baggage Claim Area C',
      contact: '+1-555-234-5678',
      distinguishingFeatures: 'Torn pocket on side, name tag inside'
    },
    {
      description: 'Burgundy Delsey hard shell luggage with spinner wheels',
      color: 'Burgundy',
      brand: 'Delsey',
      dateLost: '2024-01-18',
      location: 'Miami International Airport',
      contact: '+1-555-345-6789',
      distinguishingFeatures: 'One wheel damaged, sticker collection on back'
    },
    {
      description: 'Gray backpack style carry-on with multiple pockets',
      color: 'Gray',
      brand: 'Osprey',
      dateLost: '2024-01-20',
      location: 'SFO Terminal 2, Security Area',
      contact: '+1-555-456-7890',
      distinguishingFeatures: 'Company logo embroidered, water bottle pouch'
    },
    {
      description: 'Vintage brown leather suitcase, medium size, antique locks',
      color: 'Brown',
      brand: 'Vintage',
      dateLost: '2024-01-17',
      location: 'LaGuardia Airport, Departures',
      contact: '+1-555-567-8901',
      distinguishingFeatures: 'Vintage travel stickers, ornate handle'
    }
  ]
};

export const TestPassports = {
  // Valid passport numbers for testing (format validation only)
  valid: [
    '123456789',
    'A12345678',
    'AB12345678',
    'P12345678',
    '999999999'
  ],

  // Invalid passport numbers
  invalid: [
    'ABC',
    '12345',
    'TOOLONG123456789',
    '!!!!!!',
    ''
  ]
};

export const TestApiResponses = {
  // Successful login response
  loginSuccess: {
    ok: true,
    status: 200,
    body: {
      user: {
        id: 'test-user-123',
        email: 'passenger@example.com',
        name: 'Test Passenger',
        role: 'passenger',
        createdAt: '2023-01-01T00:00:00Z'
      },
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      expiresIn: 604800
    }
  },

  // Login failure response
  loginFailure: {
    ok: false,
    status: 401,
    body: {
      error: 'Invalid email or password',
      message: 'Authentication failed'
    }
  },

  // Successful verification response (high score)
  verificationSuccess: {
    ok: true,
    status: 200,
    body: {
      verified: true,
      score: 85,
      status: 'verified',
      flightNumber: 'AA100',
      airline: 'American Airlines',
      travelDate: '2024-01-20',
      departureCity: 'JFK',
      arrivalCity: 'LAX',
      verificationId: 'ver-123-abc-def',
      confidence: 0.95
    }
  },

  // Verification with manual review required
  verificationReview: {
    ok: true,
    status: 200,
    body: {
      verified: false,
      score: 40,
      status: 'review',
      flightNumber: 'XX999',
      message: 'Flight could not be verified. Please contact support.',
      verificationId: 'ver-456-xyz'
    }
  },

  // Verification with likely status
  verificationLikely: {
    ok: true,
    status: 200,
    body: {
      verified: true,
      score: 65,
      status: 'likely',
      flightNumber: 'BA400',
      airline: 'British Airways',
      message: 'Travel details appear correct but have lower confidence.',
      verificationId: 'ver-789-ghi'
    }
  },

  // Successful report submission
  reportSuccess: {
    ok: true,
    status: 201,
    body: {
      success: true,
      reportId: 'report-123-abc',
      status: 'submitted',
      message: 'Your luggage report has been submitted successfully.',
      nextSteps: [
        'Your case will be reviewed by our support team.',
        'You will receive updates via email at passenger@example.com',
        'You can track your case in the "My Cases" section.'
      ],
      estimatedResolution: '3-7 business days'
    }
  },

  // Report submission with validation error
  reportValidationError: {
    ok: false,
    status: 400,
    body: {
      error: 'Validation failed',
      details: {
        description: 'Description must be at least 10 characters',
        contact: 'Invalid phone number format'
      }
    }
  },

  // Network error simulation
  networkError: {
    ok: false,
    status: 0,
    body: {
      error: 'Network error',
      message: 'Unable to connect to server. Please check your internet connection.'
    }
  }
};

export const TestScenarios = {
  // Complete happy path scenario
  happyPath: {
    name: 'Complete Happy Path',
    description: 'User successfully logs in, verifies travel, and reports lost luggage',
    steps: [
      {
        step: 1,
        action: 'Navigate to landing page',
        url: '/',
        expected: 'Landing page loads'
      },
      {
        step: 2,
        action: 'Click Sign In',
        expected: 'Navigate to login page'
      },
      {
        step: 3,
        action: 'Login with valid credentials',
        data: TestUsers.passenger,
        expected: 'Redirect to dashboard'
      },
      {
        step: 4,
        action: 'Click Report Lost Luggage',
        expected: 'Navigate to /passenger/report'
      },
      {
        step: 5,
        action: 'Fill flight verification',
        data: TestFlights.validFlights[0],
        expected: 'Verification succeeds with score 85+'
      },
      {
        step: 6,
        action: 'Fill luggage report',
        data: TestLuggage.luggage[0],
        expected: 'Report submits successfully'
      },
      {
        step: 7,
        action: 'Verify success message',
        expected: 'Success notification appears'
      }
    ]
  },

  // Login failure scenario
  loginFailureScenario: {
    name: 'Login Failure Handling',
    description: 'User attempts login with incorrect credentials',
    steps: [
      {
        step: 1,
        action: 'Navigate to login',
        expected: 'Login form displayed'
      },
      {
        step: 2,
        action: 'Enter invalid credentials',
        data: TestUsers.invalidUser,
        expected: 'Login form displayed'
      },
      {
        step: 3,
        action: 'Click Sign In',
        expected: 'Error message appears'
      },
      {
        step: 4,
        action: 'Verify user not logged in',
        expected: 'Token not in localStorage'
      }
    ]
  },

  // Verification failure scenario
  verificationFailureScenario: {
    name: 'Flight Verification Failure',
    description: 'User enters invalid flight number',
    steps: [
      {
        step: 1,
        action: 'Navigate to report form (authenticated)',
        expected: 'Verification form displayed'
      },
      {
        step: 2,
        action: 'Enter unknown flight',
        data: TestFlights.unknownFlights[0],
        expected: 'Form validates'
      },
      {
        step: 3,
        action: 'Click Verify Travel',
        expected: 'API called, response indicates review needed'
      },
      {
        step: 4,
        action: 'Verify error message',
        expected: 'Cannot proceed with score <45'
      }
    ]
  },

  // Form validation scenario
  formValidationScenario: {
    name: 'Form Validation',
    description: 'Test form validation on empty/invalid inputs',
    steps: [
      {
        step: 1,
        action: 'Navigate to report form',
        expected: 'Form displayed'
      },
      {
        step: 2,
        action: 'Click Submit without filling',
        expected: 'Validation errors appear'
      },
      {
        step: 3,
        action: 'Fill only optional fields',
        expected: 'Submit still disabled'
      },
      {
        step: 4,
        action: 'Fill all required fields',
        expected: 'Submit button enabled'
      }
    ]
  }
};

export const TestMetrics = {
  // Performance targets
  performance: {
    landingPageLoad: { target: 2000, unit: 'ms' },
    loginApiResponse: { target: 1000, unit: 'ms' },
    verificationApiResponse: { target: 2000, unit: 'ms' },
    reportSubmissionResponse: { target: 1000, unit: 'ms' },
    totalFlowTime: { target: 20000, unit: 'ms' },
    formInteractivity: { target: 100, unit: 'ms' }
  },

  // Accessibility requirements
  accessibility: {
    formLabels: 'All inputs must have labels',
    keyboardNavigation: 'All buttons must be keyboard accessible',
    colorContrast: 'WCAG AA compliant',
    altText: 'All images must have alt text',
    ariaAttributes: 'Critical elements must have ARIA labels'
  },

  // Browser compatibility
  browsers: [
    { name: 'Chrome', version: '90+' },
    { name: 'Firefox', version: '88+' },
    { name: 'Safari', version: '14+' },
    { name: 'Edge', version: '90+' }
  ],

  // Mobile devices
  mobileDevices: [
    { name: 'iPhone SE', width: 375, height: 667 },
    { name: 'iPhone 12', width: 390, height: 844 },
    { name: 'iPhone 13 Pro Max', width: 428, height: 926 },
    { name: 'Galaxy S21', width: 360, height: 800 },
    { name: 'iPad', width: 768, height: 1024 },
    { name: 'iPad Pro', width: 1024, height: 1366 }
  ]
};

// Export all test data
export default {
  TestUsers,
  TestFlights,
  TestLuggage,
  TestPassports,
  TestApiResponses,
  TestScenarios,
  TestMetrics
};
