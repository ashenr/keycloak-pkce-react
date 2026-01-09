# Configuration Guide

This guide will help you configure the Keycloak PKCE Authentication project for your environment.

## Overview

The project uses environment variables to configure connections between components:

```
Frontend (.env) → Keycloak Server ← Backend (.env)
```

## Prerequisites

Before configuring, ensure you have:
- A running Keycloak server (see [docker-keycloak/ReadMe.md](docker-keycloak/ReadMe.md))
- A configured realm in Keycloak
- A configured public client in Keycloak
- Node.js 18+ and Python 3.9+ installed

## Step-by-Step Configuration

### 1. Configure Keycloak Server

If you're setting up Keycloak using Docker, edit `docker-keycloak/docker-compose.yml`:

```yaml
environment:
  # Set a strong admin password
  KEYCLOAK_ADMIN_PASSWORD: YourSecurePassword123!
  
  # Set your domain name (for production with SSL)
  KC_HOSTNAME: your-keycloak-domain.com
```

For local development without SSL:
```yaml
KC_HOSTNAME: localhost
```

### 2. Configure Keycloak Realm and Client

1. **Access Keycloak Admin Console**:
   - Production: `https://your-keycloak-domain.com/admin`
   - Local: `http://localhost:8080/admin`
   - Login with admin credentials

2. **Create a Realm** (or use existing):
   - Click "Create Realm" button
   - Name it (e.g., `my-app-realm`)
   - Click "Create"

3. **Create a Client**:
   - Navigate to "Clients" → Click "Create client"
   - **General Settings**:
     - Client type: OpenID Connect
     - Client ID: `my-app-client` (remember this!)
   - Click "Next"
   
   - **Capability config**:
     - Client authentication: OFF (public client)
     - Authorization: OFF
     - Authentication flow: 
       - ✅ Standard flow
       - ✅ Direct access grants (optional)
   - Click "Next"
   
   - **Login settings**:
     - Root URL: `http://localhost:5173` (development)
     - Home URL: `http://localhost:5173`
     - Valid redirect URIs:
       - `http://localhost:5173/*`
       - `http://localhost:5173/auth/callback`
       - Add production URLs when deploying
     - Valid post logout redirect URIs:
       - `http://localhost:5173/*`
       - `http://localhost:5173/auth/logout`
     - Web origins: 
       - `http://localhost:5173`
       - Or `*` for development (allows all origins)
   - Click "Save"

4. **Enable PKCE**:
   - In the client settings, go to "Advanced" tab
   - Scroll to "Advanced Settings"
   - Set "Proof Key for Code Exchange Code Challenge Method" to **S256**
   - Click "Save"

### 3. Configure Frontend

1. **Copy the example environment file**:
   ```bash
   cd frontend
   cp .env.example .env
   ```

2. **Edit `.env` file**:
   ```env
   # For production with SSL
   VITE_KEYCLOAK_URL=https://your-keycloak-domain.com
   VITE_KEYCLOAK_REALM=my-app-realm
   VITE_KEYCLOAK_CLIENT_ID=my-app-client
   
   # For local development
   # VITE_KEYCLOAK_URL=http://localhost:8080
   # VITE_KEYCLOAK_REALM=my-app-realm
   # VITE_KEYCLOAK_CLIENT_ID=my-app-client
   ```

3. **Install dependencies and start**:
   ```bash
   npm install
   npm run dev
   ```

### 4. Configure Backend

1. **Copy the example environment file**:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Edit `.env` file**:
   ```env
   # For production with SSL
   KEYCLOAK_URL=https://your-keycloak-domain.com
   KEYCLOAK_REALM=my-app-realm
   CORS_ORIGINS=http://localhost:5173
   
   # For local development
   # KEYCLOAK_URL=http://localhost:8080
   # KEYCLOAK_REALM=my-app-realm
   # CORS_ORIGINS=http://localhost:5173
   ```

3. **Install dependencies and start**:
   ```bash
   # Create virtual environment
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   
   # Start server
   python main.py
   ```

## Configuration Examples

### Local Development Setup

**Frontend `.env`**:
```env
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=dev-realm
VITE_KEYCLOAK_CLIENT_ID=dev-client
```

**Backend `.env`**:
```env
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=dev-realm
CORS_ORIGINS=http://localhost:5173
```

**Keycloak Docker `docker-compose.yml`**:
```yaml
KC_HOSTNAME: localhost
KEYCLOAK_ADMIN_PASSWORD: admin123
```

### Production Setup with SSL

**Frontend `.env`**:
```env
VITE_KEYCLOAK_URL=https://auth.mycompany.com
VITE_KEYCLOAK_REALM=production
VITE_KEYCLOAK_CLIENT_ID=webapp-client
```

**Backend `.env`**:
```env
KEYCLOAK_URL=https://auth.mycompany.com
KEYCLOAK_REALM=production
CORS_ORIGINS=https://app.mycompany.com,https://www.mycompany.com
```

**Keycloak Docker `docker-compose.yml`**:
```yaml
KC_HOSTNAME: auth.mycompany.com
KEYCLOAK_ADMIN_PASSWORD: <strong-secure-password>
```

**Keycloak Client Settings**:
- Valid redirect URIs: `https://app.mycompany.com/*`
- Web origins: `https://app.mycompany.com`

## Testing Your Configuration

### 1. Verify Keycloak is Running

```bash
# Check if Keycloak is accessible
curl http://localhost:8080/health  # Local
curl https://your-keycloak-domain.com/health  # Production
```

### 2. Test Frontend Authentication

1. Start the frontend: `npm run dev`
2. Open browser: http://localhost:5173
3. Click "Sign In with Keycloak"
4. Should redirect to Keycloak login page
5. Enter credentials and login
6. Should redirect back to your app with user info displayed

### 3. Test Backend API

1. Start the backend: `python main.py`
2. Get an access token from the frontend (check browser console or network tab)
3. Test protected endpoint:
   ```bash
   curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
        http://localhost:8000/api/protected
   ```
4. Should return user information

## Troubleshooting

### Issue: CORS Error During Authentication

**Symptom**: Browser console shows "Failed to fetch" or CORS error during token exchange.

**Solution**: 
1. Go to Keycloak Admin Console
2. Navigate to your client settings
3. Scroll to "Web Origins"
4. Add `http://localhost:5173` (or your frontend URL)
5. Click "Save"

### Issue: Invalid Redirect URI

**Symptom**: Keycloak shows "Invalid redirect URI" error after login.

**Solution**:
1. Check that redirect URIs in Keycloak match your frontend URL exactly
2. Ensure you have both specific and wildcard URIs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:5173/*`

### Issue: Backend Cannot Validate Token

**Symptom**: Backend returns 401 Unauthorized when calling protected endpoints.

**Solution**:
1. Verify backend `.env` has correct `KEYCLOAK_URL` and `KEYCLOAK_REALM`
2. Check that the realm name matches exactly (case-sensitive)
3. Ensure Keycloak is accessible from the backend server
4. Verify the token hasn't expired (default: 5 minutes)

### Issue: Environment Variables Not Loading

**Frontend Symptom**: Uses default placeholder values.

**Solution**:
1. Ensure `.env` file is in the `frontend` directory (not root)
2. Restart the dev server: `npm run dev`
3. Verify variable names start with `VITE_`

**Backend Symptom**: Uses default placeholder values.

**Solution**:
1. Ensure `.env` file is in the `backend` directory (not root)
2. Verify `python-dotenv` is installed: `pip install python-dotenv`
3. Restart the backend server

## Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore` for a reason
2. **Use strong passwords** - Especially for Keycloak admin account
3. **Use HTTPS in production** - See [docker-keycloak/ReadMe.md](docker-keycloak/ReadMe.md) for SSL setup
4. **Restrict CORS origins** - Don't use `*` in production
5. **Keep dependencies updated** - Regularly update Keycloak, npm packages, and Python packages
6. **Enable MFA** - Configure multi-factor authentication in Keycloak for production
7. **Monitor logs** - Keep an eye on authentication failures and suspicious activity

## Additional Resources

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [OIDC Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [PKCE RFC 7636](https://tools.ietf.org/html/rfc7636)
- [Frontend README](frontend/README.md)
- [Backend README](backend/README.md)
- [Keycloak Setup Guide](docker-keycloak/ReadMe.md)
