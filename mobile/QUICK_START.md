# BaggageLens Mobile - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Flutter SDK (3.0+)
- Android Studio / Xcode
- VS Code (recommended)

### Installation

```bash
# 1. Navigate to mobile directory
cd mobile

# 2. Install dependencies
flutter pub get

# 3. Run the app
flutter run
```

## 📱 Available Screens

### 1. Authentication
```dart
// Login
Get.toNamed('/login');

// Signup
Get.toNamed('/signup');
```

### 2. Main Navigation (Bottom Nav)
```dart
// Home Dashboard
_selectedIndex = 0;

// Report Lost Luggage
_selectedIndex = 1;

// My Cases
_selectedIndex = 2;

// Matches
_selectedIndex = 3;

// Profile
_selectedIndex = 4;
```

### 3. Additional Screens
```dart
// Travel Verification
Get.toNamed('/verify-travel');
```

## 🎨 UI Components

### Dark Theme Card
```dart
Container(
  decoration: BoxDecoration(
    color: Colors.white.withOpacity(0.05),
    borderRadius: BorderRadius.circular(16),
    border: Border.all(
      color: Colors.white.withOpacity(0.1),
    ),
  ),
  child: // Your content
)
```

### Primary Button
```dart
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: Colors.white,
    foregroundColor: Colors.black,
    padding: EdgeInsets.symmetric(vertical: 16),
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(12),
    ),
  ),
  child: Text('Button Text'),
)
```

### Form Field
```dart
TextFormField(
  style: TextStyle(color: Colors.white),
  decoration: InputDecoration(
    hintText: 'Enter text',
    hintStyle: TextStyle(color: Colors.white.withOpacity(0.3)),
    filled: true,
    fillColor: Colors.white.withOpacity(0.05),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
    ),
  ),
)
```

## 🔧 State Management (GetX)

### Access Controllers
```dart
// In your widget
final authController = Get.find<AuthController>();
final luggageController = Get.find<LuggageController>();

// Use reactive state
Obx(() => Text(authController.userName.value))
```

### Navigation
```dart
// Navigate to screen
Get.toNamed('/matches');

// Navigate and remove previous
Get.offNamed('/home');

// Go back
Get.back();

// Show snackbar
Get.snackbar(
  'Title',
  'Message',
  backgroundColor: Colors.green,
  colorText: Colors.white,
);
```

## 📊 Data Flow

### 1. Fetch Luggage
```dart
final controller = Get.find<LuggageController>();
await controller.fetchLuggages();

// Access data
Obx(() {
  final luggages = controller.luggages;
  return ListView.builder(
    itemCount: luggages.length,
    itemBuilder: (context, index) {
      return LuggageCard(luggage: luggages[index]);
    },
  );
})
```

### 2. Submit Report
```dart
await controller.reportLuggage(
  type: 'Suitcase',
  color: 'Black',
  location: 'JFK Airport',
  description: 'Large black suitcase',
  imageFile: imageFile,
);
```

### 3. Verify Travel
```dart
// Navigate to verification
Get.toNamed('/verify-travel');

// After verification, proceed to report
Get.offNamed('/report');
```

## 🎯 Common Tasks

### Add New Screen

1. Create screen file:
```dart
// lib/screens/my_screen.dart
import 'package:flutter/material.dart';

class MyScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('My Screen'),
      ),
      body: // Your content
    );
  }
}
```

2. Register route in `main.dart`:
```dart
GetPage(name: '/my-screen', page: () => MyScreen()),
```

3. Navigate to it:
```dart
Get.toNamed('/my-screen');
```

### Add API Endpoint

1. Update `api_service.dart`:
```dart
Future<Response> myEndpoint() async {
  return await get('/api/my-endpoint');
}
```

2. Use in controller:
```dart
final response = await apiService.myEndpoint();
```

### Add Form Validation

```dart
final _formKey = GlobalKey<FormState>();

Form(
  key: _formKey,
  child: Column(
    children: [
      TextFormField(
        validator: (value) {
          if (value == null || value.isEmpty) {
            return 'Field is required';
          }
          return null;
        },
      ),
      ElevatedButton(
        onPressed: () {
          if (_formKey.currentState!.validate()) {
            // Process form
          }
        },
        child: Text('Submit'),
      ),
    ],
  ),
)
```

## 🐛 Debugging

### Enable Debug Logging
```dart
// In api_service.dart
print('API Request: $url');
print('Response: ${response.body}');
```

### Check State
```dart
// In controller
print('Luggages count: ${luggages.length}');
print('Is loading: ${isLoading.value}');
```

### Hot Reload
```bash
# Press 'r' in terminal for hot reload
# Press 'R' for hot restart
```

## 📦 Build & Deploy

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS
```bash
flutter build ios --release
# Then open in Xcode and archive
```

## 🔍 Testing

### Run Tests
```bash
flutter test
```

### Widget Test Example
```dart
testWidgets('Login button test', (WidgetTester tester) async {
  await tester.pumpWidget(MyApp());
  
  final button = find.text('Login');
  expect(button, findsOneWidget);
  
  await tester.tap(button);
  await tester.pump();
});
```

## 📚 Resources

- [Flutter Documentation](https://flutter.dev/docs)
- [GetX Documentation](https://pub.dev/packages/get)
- [Material Design](https://material.io/design)
- [BaggageLens API Docs](../backend/API.md)

## 🆘 Common Issues

### Issue: White screen on startup
**Solution**: Check if controllers are initialized in `main.dart`

### Issue: API calls failing
**Solution**: Verify backend URL in `api_service.dart`

### Issue: Images not loading
**Solution**: Add internet permission in `AndroidManifest.xml`

### Issue: GetX controller not found
**Solution**: Ensure controller is registered with `Get.put()` in `main.dart`

## 💡 Pro Tips

1. **Use GetX for everything**: Navigation, state, dependencies
2. **Keep widgets small**: Break down into reusable components
3. **Follow dark theme**: Use `Colors.white.withOpacity()` for consistency
4. **Test on real devices**: Emulators don't show true performance
5. **Use const constructors**: Improves performance significantly

## 🎉 You're Ready!

Start building amazing features for BaggageLens mobile app!

```dart
// Happy coding! 🚀
Get.toNamed('/success');
```
