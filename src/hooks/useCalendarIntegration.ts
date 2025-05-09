import { useState } from 'react';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  CalendarEventData,
} from '@/services/calendarService';
import { useToast } from '@/hooks/use-toast';

interface CalendarEventOptions {
  title: string;
  description?: string;
  startTime: string;
  endTime?: string;
  location?: string;
  entityType: 'project_milestone' | 'work_order' | 'contact_interaction' | 'time_entry';
  entityId: string;
  attendees?: string[];
}

interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  error?: any;
  reason?:
    | 'not_authenticated'
    | 'authentication_required'
    | 'api_error'
    | 'user_cancelled'
    | 'rate_limit'
    | 'network_error'
    | 'invalid_parameters';
  retryable?: boolean;
}

/**
 * Hook for handling Google Calendar integration operations.
 * Provides methods for creating, updating, and deleting calendar events.
 */
export function useCalendarIntegration() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, login } = useGoogleCalendar();
  const { toast } = useToast();
  const MAX_RETRIES = 2;

  /**
   * Prompts the user to authenticate with Google Calendar if not already authenticated.
   * @returns True if authenticated or authentication process started, false if user cancelled.
   */
  const ensureAuthenticated = async (): Promise<boolean> => {
    if (!isAuthenticated) {
      const shouldLogin = window.confirm(
        'You need to connect your Google Calendar first. Would you like to do that now?'
      );

      if (shouldLogin) {
        await login();
        toast({
          title: 'Authentication required',
          description: 'Please try again after connecting to Google Calendar',
        });
        return true; // Authentication process started
      }

      return false; // User cancelled
    }

    return true; // Already authenticated
  };

  /**
   * Analysis of API errors to determine if they are retryable and provide better user feedback
   */
  const analyzeError = (
    error: any
  ): { message: string; retryable: boolean; reason: CalendarEventResult['reason'] } => {
    if (!error) {
      return {
        message: 'Unknown error occurred',
        retryable: false,
        reason: 'api_error',
      };
    }

    // Network errors are usually retryable
    if (
      error.message?.includes('network') ||
      error.message?.includes('internet') ||
      error.message?.includes('timeout')
    ) {
      return {
        message: 'Network connection issue. Please check your internet connection.',
        retryable: true,
        reason: 'network_error',
      };
    }

    // Rate limit errors
    if (
      error.message?.includes('quota') ||
      error.message?.includes('rate limit') ||
      error.status === 429 ||
      error.code === 429
    ) {
      return {
        message: 'Too many requests to Google Calendar. Please try again later.',
        retryable: true,
        reason: 'rate_limit',
      };
    }

    // Parameter validation errors
    if (
      error.message?.includes('invalid') ||
      error.message?.includes('parameter') ||
      error.status === 400 ||
      error.code === 400
    ) {
      return {
        message: 'Invalid data for calendar event.',
        retryable: false,
        reason: 'invalid_parameters',
      };
    }

    // Authentication errors
    if (
      error.message?.includes('auth') ||
      error.message?.includes('login') ||
      error.message?.includes('permission') ||
      error.status === 401 ||
      error.status === 403 ||
      error.code === 401 ||
      error.code === 403
    ) {
      return {
        message: 'Authentication error. Please reconnect your Google account.',
        retryable: false,
        reason: 'authentication_required',
      };
    }

    // Default case
    return {
      message: error.message || 'Error syncing with Google Calendar',
      retryable: false,
      reason: 'api_error',
    };
  };

  /**
   * Utility function to retry API calls with exponential backoff
   */
  const retryWithBackoff = async (
    apiCall: () => Promise<any>,
    maxRetries = MAX_RETRIES
  ): Promise<any> => {
    let retries = 0;

    const execute = async (): Promise<any> => {
      try {
        return await apiCall();
      } catch (error) {
        const { retryable } = analyzeError(error);

        if (!retryable || retries >= maxRetries) {
          throw error;
        }

        const delay = Math.pow(2, retries) * 1000; // Exponential backoff
        retries++;

        await new Promise(resolve => setTimeout(resolve, delay));
        return execute();
      }
    };

    return execute();
  };

  /**
   * Creates a new calendar event.
   * @param options Event details
   * @returns Result of the operation
   */
  const createEvent = async (options: CalendarEventOptions): Promise<CalendarEventResult> => {
    const isAuth = await ensureAuthenticated();
    if (!isAuth) {
      return { success: false, reason: 'user_cancelled' };
    }

    if (!isAuthenticated) {
      return { success: false, reason: 'authentication_required' };
    }

    // Validate input parameters
    if (!options.title || !options.startTime) {
      toast({
        title: 'Missing information',
        description: 'Event title and start time are required for calendar events',
        variant: 'destructive',
      });
      return { success: false, reason: 'invalid_parameters' };
    }

    setIsProcessing(true);

    try {
      const response = await retryWithBackoff(() => createCalendarEvent(options));

      toast({
        title: 'Calendar event created',
        description: 'Item has been added to your Google Calendar',
      });

      return { success: true, eventId: response.id };
    } catch (error) {
      console.error('Calendar integration error:', error);
      const { message, retryable, reason } = analyzeError(error);

      toast({
        title: 'Calendar sync failed',
        description: message,
        variant: 'destructive',
      });

      return { success: false, reason, retryable, error };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Updates an existing calendar event.
   * @param eventId The Google Calendar event ID
   * @param options Updated event details
   * @returns Result of the operation
   */
  const updateEvent = async (
    eventId: string,
    options: Partial<CalendarEventOptions>
  ): Promise<CalendarEventResult> => {
    const isAuth = await ensureAuthenticated();
    if (!isAuth) {
      return { success: false, reason: 'user_cancelled' };
    }

    if (!isAuthenticated) {
      return { success: false, reason: 'authentication_required' };
    }

    if (!eventId) {
      toast({
        title: 'Missing information',
        description: 'Cannot update calendar event: missing event ID',
        variant: 'destructive',
      });
      return { success: false, reason: 'invalid_parameters' };
    }

    setIsProcessing(true);

    try {
      await retryWithBackoff(() =>
        updateCalendarEvent(eventId, options as Partial<CalendarEventData>)
      );

      toast({
        title: 'Calendar event updated',
        description: 'Changes have been synced to your Google Calendar',
      });

      return { success: true, eventId };
    } catch (error) {
      console.error('Calendar update error:', error);
      const { message, retryable, reason } = analyzeError(error);

      toast({
        title: 'Calendar sync failed',
        description: message,
        variant: 'destructive',
      });

      return { success: false, reason, retryable, error };
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Deletes a calendar event.
   * @param eventId The Google Calendar event ID
   * @returns Result of the operation
   */
  const deleteEvent = async (eventId: string): Promise<CalendarEventResult> => {
    const isAuth = await ensureAuthenticated();
    if (!isAuth) {
      return { success: false, reason: 'user_cancelled' };
    }

    if (!isAuthenticated) {
      return { success: false, reason: 'authentication_required' };
    }

    if (!eventId) {
      toast({
        title: 'Missing information',
        description: 'Cannot delete calendar event: missing event ID',
        variant: 'destructive',
      });
      return { success: false, reason: 'invalid_parameters' };
    }

    setIsProcessing(true);

    try {
      await retryWithBackoff(() => deleteCalendarEvent(eventId));

      toast({
        title: 'Calendar event removed',
        description: 'Event has been removed from your Google Calendar',
      });

      return { success: true };
    } catch (error) {
      console.error('Calendar deletion error:', error);
      const { message, retryable, reason } = analyzeError(error);

      toast({
        title: 'Calendar sync failed',
        description: message,
        variant: 'destructive',
      });

      return { success: false, reason, retryable, error };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    isAuthenticated,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
