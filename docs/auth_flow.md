# Authentication Flow

This document outlines the authentication flow in the application, leveraging Supabase for backend authentication and a React Context for frontend state management.

## Core Components

- **Supabase Client (`src/integrations/supabase/client.ts`)**: Initializes the Supabase JS client with `persistSession: true` and `autoRefreshToken: true`.
- **Auth Context (`src/contexts/AuthContext.tsx`)**:
  - `AuthProvider`: A React component that wraps the application. It initializes the session state, listens to Supabase's `onAuthStateChange` events, and provides session data and auth methods (e.g., `signInWithGoogle`, `signOut`) to its children via context.
  - `useAuth()`: A hook for components to access the current session, user, loading state, and auth methods.
  - `useRequireAuth()`: A hook that checks if a user is authenticated. If not (and not already on the login page), it redirects the user to the `/login` page. It should be used to protect routes or components that require authentication.
  - `ensureSession()`: An async utility function that checks for an active session. If none is found, it attempts to refresh the session. If refreshing fails or no session can be established, it returns `null`. Data-fetching hooks (e.g., `useScheduleItems`) call this function before making database requests and handle redirection to login if no session is available.

## Flow Diagram

```mermaid
graph TD
    A[User visits App] --> B{Session Exists? (localStorage)};
    B -- Yes --> C[AuthProvider loads session];
    C --> D{Token Valid?};
    D -- Yes --> E[User Authenticated, App Access];
    D -- No (Expired) --> F[Supabase client auto-refreshes token];
    F -- Success --> E;
    F -- Failure --> G[User needs to Login];
    B -- No --> G;

    G --> H[User visits /login page or is redirected];
    H --> I[User initiates Login (e.g., Google OAuth)];
    I --> J[Supabase handles OAuth redirect / credential verification];
    J -- Success --> K[Session created/persisted];
    K --> L[AuthProvider detects SIGNED_IN event];
    L --> E;
    J -- Failure --> M[Login Error on /login page];

    E --> N[User interacts with App];
    N --> O{DB Call (e.g., useScheduleItems)};
    O -- ensureSession() --> P{Valid Session? (via getSession/refreshSession)};
    P -- Yes --> Q[DB Operation Proceeds];
    P -- No --> R[Redirect to /login];

    E --> S[User clicks Logout];
    S --> T[AuthProvider calls supabase.auth.signOut()];
    T --> U[AuthProvider detects SIGNED_OUT event];
    U --> G;
```

## Detailed Steps

1.  **Application Load**:

    - `AuthProvider` mounts.
    - It attempts to load the session using `supabase.auth.getSession()`. This reads from `localStorage` due to `persistSession: true`.
    - It subscribes to `supabase.auth.onAuthStateChange` to react to login, logout, token refresh events.

2.  **Route Guarding**:

    - `RouteGuard.tsx` (if used globally or on specific routes) or individual components/hooks like `useRequireAuth()` check the session state from `AuthContext`.
    - If `isLoading` is true, a loading state can be shown.
    - If not loading and no session exists, the user is redirected to `/login` (unless they are already on a public page like `/login`).

3.  **Login Process (Example: Google OAuth)**:

    - User clicks a "Login with Google" button.
    - `signInWithGoogle` method from `AuthContext` is called.
    - `supabase.auth.signInWithOAuth({ provider: 'google' })` redirects the user to Google.
    - After Google authentication, user is redirected back to the app (to the `redirectTo` URL specified).
    - Supabase client handles the callback, exchanges code for session, and stores it.
    - `onAuthStateChange` in `AuthProvider` fires with a `SIGNED_IN` event and the new session.
    - `AuthProvider` updates its state, making the session available to the app.
    - User is now authenticated and can access protected parts of the app.

4.  **Authenticated API/Database Calls**:

    - Hooks like `useScheduleItems.tsx` call `await ensureSession()` before any Supabase `insert`, `update`, `delete`, or sensitive `select`.
    - `ensureSession()`:
      - Tries `supabase.auth.getSession()`. If a session exists, it's returned.
      - If no session, it tries `supabase.auth.refreshSession()`. This is useful if the access token expired but the refresh token is still valid. Supabase client with `autoRefreshToken: true` also attempts this automatically, but `ensureSession` provides an explicit check.
      - If refresh succeeds, the new session is returned.
      - If no session can be obtained (initial or after refresh), `null` is returned.
    - If `ensureSession()` returns `null`, the data-fetching hook will typically show an error and redirect the user to `/login`.
    - If a session is available, the Supabase client automatically includes the JWT in the `Authorization` header for RLS to work.

5.  **Token Refresh**:

    - The Supabase client is configured with `autoRefreshToken: true`. It will attempt to refresh the access token in the background before it expires, using the stored refresh token.
    - `onAuthStateChange` will fire with a `TOKEN_REFRESHED` event.
    - `ensureSession()` also provides a manual path to attempt refresh if `getSession()` returns no active session.

6.  **Logout**:
    - User clicks a "Logout" button.
    - `signOut` method from `AuthContext` is called.
    - `supabase.auth.signOut()` clears the session from the client and `localStorage`.
    - `onAuthStateChange` in `AuthProvider` fires with a `SIGNED_OUT` event.
    - `AuthProvider` updates its state (session becomes `null`).
    - The user is typically redirected to `/login` (handled by `RouteGuard` or `useRequireAuth` logic, or directly by `onAuthStateChange` in `AuthProvider`).

## Developer Tips

- **Clearing Session for Testing**:
  - To test unauthenticated states or login flows, you can clear the Supabase session data from your browser's `localStorage`. Open Developer Tools -> Application -> Local Storage. Look for keys starting with `sb-` (e.g., `sb-${YOUR_SUPABASE_PROJECT_REF}-auth-token`) and delete them.
- **Environment Variables**:
  - Ensure your `.env` file (or environment variables in your deployment) has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
  - The Supabase client uses these to connect to your Supabase project.
- **Supabase Dashboard**:
  - Check your Supabase project's Auth settings (e.g., providers enabled, redirect URLs, JWT expiry).
  - Review RLS policies on your tables.
- **Debugging Auth State**:
  - Use the `useAuth()` hook in components to inspect the `session`, `user`, and `isLoading` states.
  - Check browser console logs for messages from `AuthProvider` (e.g., `onAuthStateChange` events) and `ensureSession()`.
  - The `onAuthStateChange` logger in `src/integrations/supabase/client.ts` also provides low-level event logs.

## Handling Expired Refresh Tokens

If a refresh token itself expires or is revoked:

- `supabase.auth.refreshSession()` will fail.
- `ensureSession()` will return `null`.
- The user will be redirected to `/login` by `useRequireAuth` or similar logic in data hooks.
- They will need to sign in again to get a new session and refresh token.
