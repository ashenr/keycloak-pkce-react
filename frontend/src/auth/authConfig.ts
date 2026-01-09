import type { UserManagerSettings } from 'oidc-client-ts';

// Load configuration from environment variables
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'https://your-keycloak-domain.com';
const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'your-realm';
const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'your-client-id';

const authConfig: UserManagerSettings = {
  // Authority URL - OIDC client will auto-discover endpoints from /.well-known/openid-configuration
  authority: `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}`,
  client_id: KEYCLOAK_CLIENT_ID,
  redirect_uri: window.location.origin + '/auth/callback',
  post_logout_redirect_uri: window.location.origin + '/auth/logout',
  response_type: 'code',
  scope: 'openid profile email',

  // Automatic silent renewal (PKCE is enabled by default when using 'code' response_type)
  automaticSilentRenew: true,
  silent_redirect_uri: window.location.origin + '/silent-renew.html',

  // Skip loading userinfo endpoint - user data is already in the ID token
  // This avoids Content-Type issues with Keycloak's userinfo endpoint
  loadUserInfo: false,
};

export default authConfig;
