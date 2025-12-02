import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { User, UserManager } from 'oidc-client-ts';
import authConfig from './authConfig';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userManager = new UserManager(authConfig);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user on mount
    const loadUser = async () => {
      try {
        const currentUser = await userManager.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to load user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Set up event listeners
    const handleUserLoaded = (loadedUser: User) => {
      setUser(loadedUser);
      setIsLoading(false);
    };

    const handleUserUnloaded = () => {
      setUser(null);
    };

    const handleAccessTokenExpiring = () => {
      console.log('Access token expiring...');
    };

    const handleAccessTokenExpired = () => {
      console.log('Access token expired');
      setUser(null);
    };

    const handleSilentRenewError = (error: Error) => {
      console.error('Silent renew error:', error);
    };

    userManager.events.addUserLoaded(handleUserLoaded);
    userManager.events.addUserUnloaded(handleUserUnloaded);
    userManager.events.addAccessTokenExpiring(handleAccessTokenExpiring);
    userManager.events.addAccessTokenExpired(handleAccessTokenExpired);
    userManager.events.addSilentRenewError(handleSilentRenewError);

    return () => {
      userManager.events.removeUserLoaded(handleUserLoaded);
      userManager.events.removeUserUnloaded(handleUserUnloaded);
      userManager.events.removeAccessTokenExpiring(handleAccessTokenExpiring);
      userManager.events.removeAccessTokenExpired(handleAccessTokenExpired);
      userManager.events.removeSilentRenewError(handleSilentRenewError);
    };
  }, []);

  const login = async () => {
    try {
      await userManager.signinRedirect();
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await userManager.signoutRedirect();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  };

  const getAccessToken = (): string | null => {
    return user?.access_token || null;
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && !user.expired,
    login,
    logout,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { userManager };
