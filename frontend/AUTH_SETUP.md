# Keycloak PKCE Authentication Setup

> **Note**: This project uses Keycloak with SSL/HTTPS. Ensure the Keycloak server is accessible at `https://naic-kc.ashen.no`. See [../docker-keycloak/SSL_SETUP.md](../docker-keycloak/SSL_SETUP.md) for SSL configuration details.

## Configuration Steps

### 1. Update Keycloak Client Configuration

In your `authConfig.ts`, replace `'naic-monitor-client'` with your actual Keycloak client ID.

**Important Keycloak Client Settings:**
- **Access Type**: Public
- **Standard Flow Enabled**: ON
- **Valid Redirect URIs**:
  - `http://localhost:5173/auth/callback` (development)
  - `http://localhost:5173/*` (development wildcard)
  - For production, add your production domain with HTTPS
- **Valid Post Logout Redirect URIs**:
  - `http://localhost:5173/auth/logout` (development)
  - `http://localhost:5173/` (development home)
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
VITE_KEYCLOAK_URL=https://naic-kc.ashen.no
VITE_KEYCLOAK_REALM=naic-monitor
VITE_KEYCLOAK_CLIENT_ID=naic-monitor-client
```

Then update `authConfig.ts` to use:
```typescript
authority: `${import.meta.env.VITE_KEYCLOAK_URL}/realms/${import.meta.env.VITE_KEYCLOAK_REALM}`
```

## Next Steps

1. **Ensure SSL is configured** - See [../docker-keycloak/SSL_SETUP.md](../docker-keycloak/SSL_SETUP.md)
2. **Update client_id** in `src/auth/authConfig.ts`
3. **Configure Keycloak client** with correct redirect URIs (both HTTP for local dev and HTTPS for production)
4. **Test the authentication flow** locally and in production
5. **Implement protected routes** (optional)
6. **Add API integration** with Bearer token

## Troubleshooting

### CORS Errors ("Failed to fetch" during authentication)
This is the most common error when setting up authentication. It occurs during the token exchange step.

**Symptoms:**
- Authentication redirects to Keycloak successfully
- Login completes
- Redirects back to your app
- Shows "Authentication Error: Failed to fetch"

**Solution:**
1. Log into Keycloak Admin Console: `https://naic-kc.ashen.no/admin`
2. Select realm: `naic-monitor`
3. Go to **Clients** → click `naic-monitor-client`
4. Scroll down to **Web Origins**
5. Add: `http://localhost:5173` (or `*` for development)
6. Click **Save**
7. Try authenticating again

**Why this happens:** When the frontend tries to POST to Keycloak's token endpoint to exchange the authorization code for tokens, the browser enforces CORS. Without the Web Origins setting, Keycloak doesn't send the proper CORS headers and the browser blocks the request.

### Redirect URI Mismatch
- Verify the redirect URIs in Keycloak match exactly with your app
- Check both `redirect_uri` and `post_logout_redirect_uri` in `authConfig.ts`

### SSL Certificate Errors
- If you see SSL errors, verify certificates are valid: `sudo certbot certificates`
- Check that the Keycloak URL uses HTTPS: `https://naic-kc.ashen.no`
