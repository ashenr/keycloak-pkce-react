# Keycloak PKCE Authentication Setup

## Configuration Steps

### 1. Update Keycloak Client Configuration

In your `authConfig.ts`, replace `'naic-monitor-client'` with your actual Keycloak client ID.

**Important Keycloak Client Settings:**
- **Access Type**: Public
- **Standard Flow Enabled**: ON
- **Valid Redirect URIs**: 
  - `http://localhost:5173/callback`
  - `http://localhost:5173/*` (for development)
- **Web Origins**: `http://localhost:5173` (or `*` for development)
- **PKCE Code Challenge Method**: S256

### 2. Start the Development Server

```bash
cd frontend
npm run dev
```

The app will run at `http://localhost:5173`

### 3. Test Authentication Flow

1. Click "Sign In with Keycloak"
2. You'll be redirected to Keycloak login
3. After successful login, you'll be redirected back to `/auth/callback`
4. The callback handler will complete authentication and redirect to home
5. You'll see your user information and access token

## Features Implemented

✅ **PKCE Flow** - Code challenge method S256
✅ **Automatic Token Renewal** - Silent refresh before expiration
✅ **User Context** - React Context API for auth state
✅ **Callback Handler** - Processes OAuth redirect
✅ **Token Display** - Shows user info and access token
✅ **Logout** - Complete session termination

## Project Structure

```
frontend/src/
├── auth/
│   ├── authConfig.ts       # OIDC client configuration
│   ├── AuthContext.tsx     # Auth provider and hooks
│   └── AuthCallback.tsx    # OAuth callback handler
├── App.tsx                 # Main application with auth UI
└── main.tsx               # App entry with routing
```

## Using the Access Token in API Calls

The project uses axios with automatic token injection via interceptors. Simply use the `useApi` hook:

```typescript
import { useApi } from './services/api';

function MyComponent() {
  const { get, post } = useApi();

  const callAPI = async () => {
    // Token is automatically added to Authorization header
    const data = await get('/api/protected');
    console.log(data);
  };

  const createData = async () => {
    const data = await post('/api/data', { key: 'value' });
    console.log(data);
  };

  return (
    <>
      <button onClick={callAPI}>Call Protected API</button>
      <button onClick={createData}>Create Data</button>
    </>
  );
}
```

The axios instance automatically:
- Adds the Bearer token to all requests
- Handles errors with detailed messages
- Supports GET, POST, PUT, DELETE, PATCH methods

## Environment Variables (Optional)

Create a `.env` file for different environments:

```env
VITE_KEYCLOAK_URL=http://158.39.75.110
VITE_KEYCLOAK_REALM=naic-monitor
VITE_KEYCLOAK_CLIENT_ID=naic-monitor-client
```

Then update `authConfig.ts` to use:
```typescript
authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`
```

## Next Steps

1. **Update client_id** in `src/auth/authConfig.ts`
2. **Configure Keycloak client** with correct redirect URIs
3. **Test the authentication flow**
4. **Implement protected routes** (optional)
5. **Add API integration** with Bearer token
