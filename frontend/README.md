# Frontend - React + Keycloak Authentication

A React + TypeScript + Vite application with Keycloak PKCE authentication.

## Quick Start

```bash
cd frontend
npm install
npm run dev
```

The app will run at `http://localhost:5173`

## Tech Stack

- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Chakra UI v3** - Component library
- **oidc-client-ts** - OpenID Connect client for PKCE authentication
- **Axios** - HTTP client with automatic token injection
- **React Router** - Routing

## Keycloak Authentication Setup

> **Note**: This project uses Keycloak with SSL/HTTPS. Ensure your Keycloak server is accessible via HTTPS. See [../docker-keycloak/README.md](../docker-keycloak/README.md) for Keycloak setup.

### 1. Configure Keycloak Client

Log into Keycloak Admin Console and configure your client with these settings:

**Client ID**: `your-client-id`

**Important Client Settings:**
- **Access Type**: Public
- **Standard Flow Enabled**: ON
- **Valid Redirect URIs**:
  - `http://localhost:5173/auth/callback` (development)
  - `http://localhost:5173/*` (development wildcard)
  - `https://your-production-domain.com/auth/callback` (production)
- **Valid Post Logout Redirect URIs**:
  - `http://localhost:5173/auth/logout` (development)
  - `http://localhost:5173/` (development home)
  - `https://your-production-domain.com/auth/logout` (production)
- **Web Origins**: ⚠️ **CRITICAL - Required to prevent CORS errors**
  - `http://localhost:5173` (for development)
  - Or `*` for development (allows all origins)
  - `https://your-production-domain.com` (for production)
- **PKCE Code Challenge Method**: S256

### 2. Update Configuration

Create a `.env` file in the frontend directory (copy from `.env.example`):

```env
VITE_KEYCLOAK_URL=https://your-keycloak-domain.com
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
VITE_BACKEND_API_URL=http://localhost:8000
```

The configuration in [authConfig.ts](src/auth/authConfig.ts) will automatically use these environment variables.

### 3. Test Authentication Flow

1. Start the dev server: `npm run dev`
2. Click "Sign In with Keycloak"
3. You'll be redirected to Keycloak login
4. After successful login, you'll be redirected back to `/auth/callback`
5. The callback handler will complete authentication and redirect to home
6. You'll see your user information and access token

## Features

✅ **PKCE Flow** - Secure authorization code flow with code challenge
✅ **Automatic Token Renewal** - Silent refresh before expiration
✅ **User Context** - React Context API for auth state management
✅ **Protected Routes** - Route guards for authenticated pages
✅ **Logout** - Complete session termination with Keycloak
✅ **API Integration** - Automatic Bearer token injection

## Project Structure

```
frontend/
├── src/
│   ├── auth/
│   │   ├── authConfig.ts       # OIDC client configuration
│   │   ├── AuthContext.tsx     # Auth provider and hooks
│   │   ├── AuthCallback.tsx    # OAuth callback handler
│   │   └── LogoutCallback.tsx  # Logout handler
│   ├── components/
│   │   ├── ApiTestPage.tsx     # API testing interface
│   │   └── ui/                 # Chakra UI components
│   ├── services/
│   │   └── api.ts              # API client with axios & auth
│   ├── App.tsx                 # Main app component
│   └── main.tsx                # App entry point
├── public/
│   └── silent-renew.html       # Silent token renewal page
└── package.json
```

## Using the Access Token in API Calls

The project uses axios with automatic token injection via interceptors. Simply use the `useApi` hook:

```typescript
import { useApi } from './services/api';

function MyComponent() {
  const { get, post } = useApi();

  const fetchData = async () => {
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
      <button onClick={fetchData}>Fetch Protected Data</button>
      <button onClick={createData}>Create Data</button>
    </>
  );
}
```

The axios instance automatically:
- Adds the Bearer token to all requests
- Handles errors with detailed messages
- Supports GET, POST, PUT, DELETE, PATCH methods

## Environment Variables

The application uses environment variables for configuration. Copy [.env.example](.env.example) to `.env` and update with your values:

```bash
cp .env.example .env
```

Edit `.env` with your Keycloak configuration:

```env
VITE_KEYCLOAK_URL=https://your-keycloak-domain.com
VITE_KEYCLOAK_REALM=your-realm
VITE_KEYCLOAK_CLIENT_ID=your-client-id
VITE_BACKEND_API_URL=http://localhost:8000
```

The configuration in [authConfig.ts](src/auth/authConfig.ts) automatically loads these values.

## Troubleshooting

### CORS Errors ("Failed to fetch" during authentication)
This is the most common error when setting up authentication. It occurs during the token exchange step.

**Symptoms:**
- Authentication redirects to Keycloak successfully
- Login completes
- Redirects back to your app
- Shows "Authentication Error: Failed to fetch"

**Solution:**
1. Log into Keycloak Admin Console: `https://your-keycloak-domain.com/admin`
2. Select your realm (e.g., `your-realm`)
3. Go to **Clients** → click your client ID
4. Scroll down to **Web Origins**
5. Add: `http://localhost:5173` (or `*` for development)
6. Click **Save**
7. Try authenticating again

**Why this happens:** When the frontend tries to POST to Keycloak's token endpoint to exchange the authorization code for tokens, the browser enforces CORS. Without the Web Origins setting, Keycloak doesn't send the proper CORS headers and the browser blocks the request.

### Redirect URI Mismatch
- Verify the redirect URIs in Keycloak match exactly with your app
- Check both `redirect_uri` and `post_logout_redirect_uri` in `authConfig.ts`
- The error will usually show in the browser URL or Keycloak error page

### SSL Certificate Errors
- If you see SSL errors, verify certificates are valid: `sudo certbot certificates`
- Check that the Keycloak URL uses HTTPS in your `.env` file
- Visit the Keycloak URL in your browser and accept the certificate if it's self-signed

### Token Not Being Sent
- Check browser console for authentication errors
- Verify the user is authenticated: use `useAuth()` hook to check `isAuthenticated`
- Ensure axios interceptor is properly configured in `api.ts`

## Development Tools

### ESLint Configuration

For production applications, enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      tseslint.configs.recommendedTypeChecked,
      // Or for stricter rules:
      tseslint.configs.strictTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```

## Building for Production

```bash
npm run build
```

The production build will be in the `dist/` directory.

### Production Checklist

- [ ] Update Keycloak client redirect URIs to include production domain
- [ ] Update Web Origins to include production domain
- [ ] Set proper environment variables for production Keycloak URL
- [ ] Ensure HTTPS is configured for both frontend and Keycloak
- [ ] Test authentication flow in production
- [ ] Configure CORS properly for production API

## Related Documentation

- [Main README](../README.md) - Project overview and architecture
- [Keycloak Setup](../docker-keycloak/README.md) - Keycloak installation and SSL setup
- [Backend API](../backend/README.md) - FastAPI backend documentation
