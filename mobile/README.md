# BaggageLens Mobile App - Flutter

## Overview
BaggageLens Mobile is a Flutter-based passenger application for reporting and tracking lost luggage. The app provides a seamless experience matching the web application's UI/UX design with dark theme aesthetics and modern interactions.

## Features

### 🏠 Dashboard
- Welcome card with personalized greeting
- Statistics overview (Lost, Found, Matched luggage)
- Quick action buttons for common tasks
- Recent reports list with pull-to-refresh

### ✈️ Travel Verification
- Multi-step form for travel details verification
- Flight number validation and auto-fill
- Airport selection with comprehensive database
- Optional fields for enhanced verification (PNR, baggage tag, passport)
- Real-time form validation
- Matches web passenger verification flow

### 📝 Report Lost Luggage
- Image capture/upload functionality
- Detailed luggage description form
- Location and date tracking
- Color and type selection
- Additional notes field

### 📋 Cases Management
- View all reported cases
- Filter by status (Lost, Found, Matched)
- Case details with timeline
- Status updates and notifications

### ⭐ Matches
- AI-powered luggage matching
- Match score visualization (percentage)
- Detailed match comparison
- Claim functionality with verification
- Empty state with helpful prompts

### 👤 Profile
- User information display
- Settings and preferences
- Logout functionality
- Account management

## Screens

### Core Screens
1. **Login Screen** (`login_screen.dart`)
   - Email/password authentication
   - Google Sign-In integration
   - Form validation
   - Navigation to signup

2. **Signup Screen** (`signup_screen.dart`)
   - User registration
   - Email verification
   - Password strength validation
   - Terms acceptance

3. **Home Screen** (`home_screen.dart`)
   - Bottom navigation bar with 5 tabs
   - Persistent app bar with notifications
   - Screen switching logic

4. **Dashboard Screen** (`dashboard_screen.dart`)
   - Hero section with gradient card
   - Statistics grid (4 cards)
   - Quick actions (Verify Travel, Report, Matches)
   - Recent reports list

5. **Travel Verification Screen** (`travel_verification_screen.dart`)
   - Personal details section
   - Travel confirmation with flight verification
   - Auto-fill airports functionality
   - Optional information section
   - Form validation and submission

6. **Report Screen** (`report_screen.dart`)
   - Image picker integration
   - Comprehensive luggage details form
   - Location selection
   - Submit functionality

7. **Cases Screen** (`cases_screen.dart`)
   - List of all reported cases
   - Status badges
   - Pull-to-refresh
   - Case detail navigation

8. **Matches Screen** (`matches_screen.dart`)
   - Potential matches list
   - Match score badges with color coding
   - Match details modal
   - Claim functionality
   - Empty state handling

9. **Profile Screen** (`profile_screen.dart`)
   - User information display
   - Settings options
   - Logout functionality

## Design System

### Color Scheme
- **Primary Background**: Black (`Colors.black`)
- **Card Background**: `Colors.white.withOpacity(0.05)`
- **Borders**: `Colors.white.withOpacity(0.1)`
- **Primary Text**: White
- **Secondary Text**: `Colors.white.withOpacity(0.5)`
- **Accent**: Blue gradient (`Colors.blue.shade400` to `Colors.blue.shade700`)
- **Success**: Green
- **Warning**: Orange
- **Error**: Red

### Typography
- **Headers**: Bold, 18-20px
- **Body**: Regular, 14-16px
- **Captions**: 12-13px
- **Buttons**: Bold, 14-16px

### Components
- **Cards**: Rounded corners (12-16px), backdrop blur effect
- **Buttons**: 
  - Primary: White background, black text
  - Secondary: Blue background, white text
  - Outlined: Transparent with white border
- **Forms**: Dark input fields with white borders
- **Modals**: Bottom sheets with rounded top corners

## State Management

### GetX Controllers
1. **AuthController** - User authentication state
2. **LuggageController** - Luggage reports management
3. **MatchController** - Match suggestions handling

### Services
1. **ApiService** - HTTP client for backend communication
2. **AuthService** - Authentication logic
3. **StorageService** - Local data persistence

## Navigation

### Routes
```dart
/                    -> LoginScreen
/login              -> LoginScreen
/signup             -> SignupScreen
/home               -> HomeScreen (with bottom nav)
/report             -> ReportScreen
/cases              -> CasesScreen
/matches            -> MatchesScreen
/verify-travel      -> TravelVerificationScreen
```

### Bottom Navigation
1. Home (Dashboard)
2. Report (Report Lost Luggage)
3. Cases (My Cases)
4. Matches (Potential Matches)
5. Profile (User Profile)

## Data Models

### LuggageModel
```dart
{
  id: String
  type: String
  color: String
  location: String
  description: String
  status: String
  imageUrl: String?
  createdAt: DateTime
  userId: String
}
```

### UserModel
```dart
{
  id: String
  name: String
  email: String
  phone: String?
  createdAt: DateTime
}
```

## API Integration

### Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/luggage` - Fetch all luggage
- `POST /api/luggage` - Report new luggage
- `GET /api/matches` - Get potential matches
- `POST /api/verify-travel` - Verify travel details
- `GET /api/flight-route` - Auto-fill flight route

## Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  get: ^4.6.6                    # State management & navigation
  http: ^1.1.0                   # HTTP client
  shared_preferences: ^2.2.2     # Local storage
  image_picker: ^1.0.5           # Image selection
  cached_network_image: ^3.3.0   # Image caching
  intl: ^0.18.1                  # Date formatting
```

## Setup Instructions

1. **Install Flutter**
   ```bash
   flutter --version
   ```

2. **Install Dependencies**
   ```bash
   cd mobile
   flutter pub get
   ```

3. **Configure Backend URL**
   Update `lib/services/api_service.dart`:
   ```dart
   static const String baseUrl = 'http://your-backend-url:5000';
   ```

4. **Run the App**
   ```bash
   # Android
   flutter run

   # iOS
   flutter run -d ios

   # Web (for testing)
   flutter run -d chrome
   ```

## Build for Production

### Android
```bash
flutter build apk --release
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage
```

## UI/UX Consistency with Web

The mobile app maintains design consistency with the web passenger portal:

1. **Color Scheme**: Dark theme with white accents
2. **Typography**: Same font hierarchy and sizing
3. **Components**: Matching card styles, buttons, and forms
4. **Flow**: Identical user journey (Verify Travel → Report Luggage → Track Cases)
5. **Interactions**: Similar animations and transitions
6. **Feedback**: Consistent success/error messaging

## Future Enhancements

- [ ] Push notifications for matches
- [ ] Offline mode with local caching
- [ ] QR code scanning for baggage tags
- [ ] Real-time chat with support
- [ ] Multi-language support
- [ ] Biometric authentication
- [ ] AR luggage visualization
- [ ] Integration with airline APIs

## Contributing

1. Follow Flutter style guide
2. Maintain dark theme consistency
3. Add tests for new features
4. Update documentation
5. Use GetX for state management

## License

Copyright © 2026 BaggageLens. All rights reserved.
