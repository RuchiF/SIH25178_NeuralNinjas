# Firebase Authentication Setup Guide

## Files Created

1. **Authentication Components**

   - `src/components/auth/Login.jsx` - Login page with email/password and Google sign-in
   - `src/components/auth/Signup.jsx` - Registration page
   - `src/components/auth/ProtectedRoute.jsx` - Route wrapper for authentication

2. **Firebase Configuration**

   - `src/firebase/config.js` - Firebase initialization (needs configuration)
   - `src/contexts/AuthContext.jsx` - Authentication context provider

3. **App Integration**
   - Updated `src/App.jsx` with authentication routes and provider

## Setup Instructions

### Step 1: Install Firebase Package

Run the following command in the `frontend` directory:

```bash
npm install firebase
```

### Step 2: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### Step 3: Enable Authentication

1. In your Firebase project, go to **Authentication** in the left sidebar
2. Click **Get Started**
3. Enable authentication methods:
   - **Email/Password**: Click on it and toggle "Enable"
   - **Google**: Click on it, toggle "Enable", and configure OAuth consent

### Step 4: Get Firebase Configuration

1. Go to **Project Settings** (gear icon near "Project Overview")
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname (e.g., "Air Quality Dashboard")
5. Copy the Firebase configuration object

### Step 5: Update Firebase Config File

Open `frontend/src/firebase/config.js` and replace the placeholder values:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
```

With your actual Firebase project values from step 4.

### Step 6: Configure Authorized Domains (for Google Sign-In)

1. In Firebase Console, go to **Authentication** > **Settings** > **Authorized domains**
2. Add your domain (for development, `localhost` is already added)
3. For production, add your production domain

## How Authentication Works

### Protected Routes

The `/dashboard/*` routes are now protected. Users must be logged in to access them. Unauthorized users are redirected to `/login`.

### Available Routes

- `/` - Homepage (public)
- `/login` - Login page (public)
- `/signup` - Signup page (public)
- `/dashboard/*` - Dashboard and all sub-routes (protected)

### Authentication Methods

1. **Email/Password**

   - Users can sign up with email and password
   - Password must be at least 6 characters
   - Validation for matching passwords on signup

2. **Google Sign-In**
   - One-click authentication with Google account
   - No password required
   - Faster user onboarding

### Auth Context API

The `useAuth()` hook provides these methods:

```javascript
const { currentUser, login, signup, logout, signInWithGoogle } = useAuth();

// currentUser: Firebase user object (null if not logged in)
// login(email, password): Sign in with email/password
// signup(email, password): Create new account
// logout(): Sign out current user
// signInWithGoogle(): Sign in with Google popup
```

## Testing Authentication

1. Start your dev server: `npm run dev`
2. Navigate to `http://localhost:5173/signup`
3. Create a test account
4. Try logging in with the created account
5. Try accessing `/dashboard` while logged out (should redirect to login)
6. Try Google sign-in (requires Google OAuth configuration)

## Adding Logout Button

You can add a logout button to your Dashboard component:

```javascript
import { useAuth } from "../contexts/AuthContext";

function Dashboard() {
  const { logout, currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // User will be redirected to login by ProtectedRoute
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div>
      <p>Welcome, {currentUser?.email}</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
```

## Security Notes

1. **Never commit** `firebase/config.js` with real credentials to version control
2. Add `config.js` to `.gitignore` if using real credentials
3. Use environment variables for production:
   ```javascript
   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     // ... other config
   };
   ```
4. Set up Firebase Security Rules for production
5. Enable email verification for production users

## Troubleshooting

### "auth/operation-not-allowed"

- Enable the authentication method in Firebase Console

### "auth/invalid-api-key"

- Check your `config.js` has correct API key from Firebase Console

### Google Sign-In not working

- Ensure Google provider is enabled in Firebase Authentication
- Check authorized domains in Firebase Console

### Build errors

- Make sure `firebase` package is installed: `npm install firebase`
- Clear cache: `rm -rf node_modules && npm install`

## Next Steps

1. Install Firebase package
2. Configure Firebase project and update `config.js`
3. Test authentication flow
4. Add logout functionality to Dashboard
5. Customize login/signup page styling
6. Add email verification (optional)
7. Add password reset functionality (optional)
