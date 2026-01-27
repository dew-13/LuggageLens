# BaggageLens Mobile App

A complete Flutter mobile application for finding and tracking lost luggage using AI-powered image matching.

## Features

### 🔐 Authentication
- User registration and login with validation
- JWT token-based authentication
- Persistent session management
- Secure password handling
- Auto-logout on token expiration

### 📦 Luggage Management
- Report lost or found luggage
- Comprehensive luggage details (color, brand, type, description)
- Airport and flight number tracking
- Luggage categorization and status tracking
- Search and filter capabilities

### 🔍 AI Matching
- AI-powered luggage matching
- Confidence scores for matches
- Match confirmation workflow
- View matching suggestions
- Real-time match updates

### 👤 User Profile
- View and edit profile information
- Change password functionality
- Notification preferences
- Help and support section
- Secure logout

### 📊 Dashboard
- Quick statistics (Lost, Found, Matched luggage)
- Recent luggage reports display
- Quick action buttons
- Real-time data updates with refresh

## Project Structure

```
lib/
├── main.dart                      # App entry point & routing config
├── models/                        # Data models
│   ├── user_model.dart           # User data model
│   ├── luggage_model.dart        # Luggage data model
│   └── match_model.dart          # Match result model
├── services/                      # API & business logic
│   ├── api_service.dart          # HTTP API client with Dio
│   └── auth_service.dart         # Authentication logic
├── controllers/                   # GetX state management
│   ├── auth_controller.dart      # Auth state & logic
│   ├── luggage_controller.dart   # Luggage state & logic
│   └── match_controller.dart     # Match state & logic
├── screens/                       # UI screens
│   ├── login_screen.dart         # Login page
│   ├── signup_screen.dart        # Registration page
│   ├── home_screen.dart          # Main home with nav
│   ├── dashboard_screen.dart     # Dashboard/home tab
│   ├── report_screen.dart        # Report luggage tab
│   ├── cases_screen.dart         # Cases/history tab
│   └── profile_screen.dart       # Profile/settings tab
└── widgets/                       # Reusable widgets
    └── luggage_card.dart         # Luggage item card widget
```

## Dependencies

### State Management & Routing
- **GetX** (^4.6.0) - Powerful state management and routing solution

### Networking
- **Dio** (^5.3.0) - Modern HTTP client with interceptors and request management
- **http** (^1.1.0) - Simple HTTP requests

### UI & Design
- **flutter_svg** (^2.0.0) - SVG image rendering
- **cached_network_image** (^3.3.0) - Network image caching and optimization

### Data Persistence
- **shared_preferences** (^2.2.0) - Local key-value storage for app settings
- **hive** (^2.2.0) - Fast local NoSQL database
- **sqflite** (^2.0.0) - SQLite database for Flutter

### Authentication & Security
- **jwt_decoder** (^2.0.0) - JWT token parsing and validation

### Utilities
- **uuid** (^4.0.0) - UUID generation for unique identifiers
- **intl** (^0.20.2) - Internationalization and date/time formatting

## Setup & Installation

### Prerequisites
- Flutter SDK (3.0.0+)
- Dart SDK (included with Flutter)
- Android Studio or Xcode for device emulation
- VS Code or Android Studio as IDE

### Installation Steps

1. **Install dependencies**
   ```bash
   cd mobile
   flutter pub get
   ```

2. **Configure API endpoint**
   - Edit `lib/services/api_service.dart`
   - Update `_baseUrl` to point to your backend
   - Default: `http://localhost:5000/api`

3. **Run on emulator/device**
   ```bash
   flutter run
   ```

4. **Build for release**
   - Android: `flutter build apk --release`
   - iOS: `flutter build ios --release`

## API Integration

The app connects to the BaggageLens backend API. Backend server must be running and accessible.

### Authentication Flow
1. User registers or logs in via login/signup screens
2. Backend validates credentials and returns JWT token
3. Token stored securely in SharedPreferences
4. Token automatically included in all subsequent API requests
5. Invalid/expired tokens trigger re-authentication

### Core API Endpoints

**Authentication**
- `POST /auth/login` - User login with email/password
- `POST /auth/register` - New user registration
- `POST /auth/logout` - User logout and token invalidation

**User Management**
- `GET /users/profile` - Fetch current user profile
- `PUT /users/profile` - Update user profile information

**Luggage Reporting**
- `POST /luggage` - Create new luggage report
- `GET /luggage` - Fetch all user luggage reports with optional status filter
- `GET /luggage/:id` - Get detailed information for specific luggage
- `PUT /luggage/:id` - Update luggage report information
- `DELETE /luggage/:id` - Delete luggage report

**Matching**
- `GET /matches` - Fetch matches for specific luggage
- `PUT /matches/:id` - Confirm or reject match suggestions

## State Management (GetX Architecture)

### Controllers

#### AuthController
Manages user authentication state and operations
- `login()` - Authenticate user with credentials
- `register()` - Create new user account
- `logout()` - Sign out and clear session
- `isAuthenticated` - Observable auth state
- `errorMessage` - Error notifications

#### LuggageController
Manages luggage data and operations
- `fetchLuggages()` - Load all user luggage reports
- `reportLuggage()` - Create new luggage report
- `updateLuggage()` - Modify existing report
- `deleteLuggage()` - Remove luggage report
- `lostLuggages` - Filtered lost items list
- `foundLuggages` - Filtered found items list
- `matchedLuggages` - Filtered matched items list

#### MatchController
Manages luggage matching operations
- `fetchMatches()` - Get AI-suggested matches
- `updateMatchStatus()` - Accept/reject match
- `pendingMatches` - Unreviewed matches
- `confirmedMatches` - Confirmed matches

## Screens & Features

### 🔑 Login Screen
- Email and password input fields
- Real-time form validation
- Error message display
- Sign up navigation link
- Loading state indication

### 📝 Signup Screen
- First and last name inputs
- Email validation
- Secure password input
- Terms of service checkbox
- Back to login option
- Loading state indication

### 🏠 Home Screen
- Bottom navigation with 4 tabs
- Smooth tab transitions
- App title with branding
- Notification icon

### 📊 Dashboard
- Personalized welcome greeting
- Statistics cards (Lost/Found/Matched counts)
- Quick action buttons
- Recent luggage reports preview
- Pull-to-refresh capability
- Empty state with prompts

### 📋 Report Screen
- Lost/Found selection toggle
- Luggage type dropdown selector
- Color, brand input fields
- Multi-line description input
- Airport and flight number fields
- Form validation with error messages
- Loading state during submission
- Success/error feedback

### 📂 Cases Screen
- Three-tab interface (Lost/Found/Matched)
- Filterable luggage list
- Pull-to-refresh for updates
- Empty state messaging
- Quick report button
- Luggage card tap to view details

### 👤 Profile Screen
- User profile display
- Profile menu items (Edit, Password, Notifications, Help, About)
- Secure logout with confirmation dialog
- Clean, organized menu layout
- Loading state handling

## Development Guide

### Creating New Screens
```
1. Create screen file: lib/screens/my_screen.dart
2. Create controller if needed: lib/controllers/my_controller.dart
3. Add route in main.dart GetPages
4. Import and use in navigation (Get.toNamed('/route'))
```

### Adding New API Methods
```
1. Add method in lib/services/api_service.dart
2. Add business logic in appropriate controller
3. Handle errors and loading states
4. Implement UI in screens
```

### State Management Best Practices
- Use `.obs` for observable variables
- Use `Obx()` widgets for reactive updates
- Initialize controllers in main.dart with Get.put()
- Access controllers with Get.find<Controller>()
- Update state by assigning to observable properties

## Testing

```bash
# Run all tests
flutter test

# Run tests with coverage
flutter test --coverage

# View coverage report
lcov --summary coverage/lcov.info
```

## Troubleshooting

### Common Issues

**Build fails on clean install**
```bash
flutter clean
flutter pub get
flutter run
```

**API connection failures**
- Verify backend server is running
- Check network connectivity
- Review API endpoint in `api_service.dart`
- Check device network permissions

**Authentication problems**
- Clear app data: `flutter clean`
- Check SharedPreferences for token storage
- Verify JWT token format and expiration
- Review auth endpoint responses

**UI rendering issues**
- Hot restart: `flutter run --hot`
- Full rebuild: `flutter clean && flutter run`
- Check device orientation and screen size

## Performance Optimization

- Image caching with `cached_network_image`
- List virtualization with `ListView`
- Lazy loading for large datasets
- GetX prevents unnecessary widget rebuilds
- Network request batching where possible

## Security Considerations

- JWT tokens stored in SharedPreferences
- HTTPS recommended for production
- Input validation on all forms
- No sensitive data in logs
- API request timeouts configured
- Token refresh on expiration
- Password never logged or cached

## Architecture Overview

### MVVM Pattern with GetX
- **Model** - Data classes (user_model.dart, etc)
- **View** - UI screens and widgets
- **ViewModel** - GetX Controllers managing state and logic

### Reactive Programming
- Observable state with `.obs`
- Auto-rebuilding widgets with `Obx()`
- Event-driven updates
- Stream-based data flow

### Dependency Injection
- Services injected via Get.put()
- Centralized initialization in main.dart
- Easy to mock for testing

## Future Enhancements

- [ ] Biometric authentication (fingerprint/face)
- [ ] Image upload and compression
- [ ] Real-time push notifications
- [ ] Offline support with local database
- [ ] Maps integration for location tracking
- [ ] Direct messaging between users
- [ ] Advanced search and filtering
- [ ] Multi-language support (localization)
- [ ] Dark theme
- [ ] Social sharing features
- [ ] Reward/loyalty system
- [ ] Premium features

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is part of the BaggageLens ecosystem.

## Support

For issues, feature requests, or questions, please visit the main BaggageLens repository or contact the development team.
