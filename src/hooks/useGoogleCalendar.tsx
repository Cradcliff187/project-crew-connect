import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface CalendarInfo {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  backgroundColor?: string;
  foregroundColor?: string;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}

/**
 * Hook for managing Google Calendar authentication and API calls
 */
export function useGoogleCalendar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
  const [isLoadingCalendars, setIsLoadingCalendars] = useState(false);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/status', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const data = await response.json();

        setIsAuthenticated(data.authenticated);
        if (data.authenticated && data.userInfo) {
          setUserInfo(data.userInfo);
        }
      } catch (error) {
        console.error('Failed to check authentication status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  // Check auth status after login popup closes
  const checkAuthAfterLogin = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/status', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();

      setIsAuthenticated(data.authenticated);
      if (data.authenticated && data.userInfo) {
        setUserInfo(data.userInfo);
        toast({
          title: 'Successfully Connected',
          description: 'Your Google Calendar account has been connected.',
        });
      }
    } catch (error) {
      console.error('Failed to verify authentication:', error);
    }
  }, [toast]);

  // Login function with direct redirect instead of popup
  const login = useCallback(async () => {
    setIsAuthenticating(true);

    try {
      // Instead of using a popup, we'll redirect the user directly to the auth URL
      // This avoids COOP issues completely
      window.location.href = '/auth/google';
    } catch (error) {
      console.error('Failed to authenticate with Google:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Could not connect to Google Calendar.',
        variant: 'destructive',
      });
      setIsAuthenticating(false);
    }
  }, [toast]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setIsAuthenticated(false);
      setUserInfo(null);
      toast({
        title: 'Disconnected',
        description: 'Your Google Calendar account has been disconnected.',
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }, [toast]);

  // Fetch user's calendars
  const refreshCalendars = useCallback(async () => {
    if (!isAuthenticated || !userInfo?.email) return;

    setIsLoadingCalendars(true);
    try {
      const response = await fetch('/api/calendar/list', {
        credentials: 'include',
        headers: {
          'x-user-email': userInfo.email,
        },
      });
      const data = await response.json();

      if (data.success && data.calendars) {
        setCalendars(data.calendars);
      } else {
        console.error('Failed to fetch calendars:', data.error);
      }
    } catch (error) {
      console.error('Error fetching calendars:', error);
    } finally {
      setIsLoadingCalendars(false);
    }
  }, [isAuthenticated, userInfo]);

  // Effect to check auth status when the page loads
  // This handles the redirect back from Google OAuth
  useEffect(() => {
    // Check if we're coming back from Google OAuth
    const url = new URL(window.location.href);
    const authSuccess = url.searchParams.get('auth_success');

    if (authSuccess === 'true') {
      // Remove the auth_success parameter from the URL to avoid issues on reload
      url.searchParams.delete('auth_success');
      window.history.replaceState({}, document.title, url.toString());

      // Check the authentication status
      checkAuthAfterLogin();
      setIsAuthenticating(false);
    }
  }, [checkAuthAfterLogin]);

  return {
    isAuthenticated,
    isAuthenticating,
    login,
    logout,
    userInfo,
    calendars,
    isLoadingCalendars,
    refreshCalendars,
  };
}
