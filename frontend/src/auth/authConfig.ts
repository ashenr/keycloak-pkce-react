import type { UserManagerSettings } from 'oidc-client-ts';

const authConfig: UserManagerSettings = {
  // Authority URL - OIDC client will auto-discover endpoints from /.well-known/openid-configuration
  authority: 'http://158.39.75.110/realms/naic-monitor',
  client_id: 'naic-monitor-client', // Replace with your actual client ID
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
