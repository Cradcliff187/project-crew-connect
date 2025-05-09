/**
 * Google Calendar Service
 *
 * A centralized service for all Google Calendar operations.
 * This service handles authentication, event CRUD operations, and synchronization
 * using the unified calendar event model.
 */

import { supabase } from '@/integrations/supabase/client';
import {
  ICalendarEventBase,
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
  CalendarEventResponse,
  GoogleCalendarOptions,
  EntityType,
  AssigneeType,
  CalendarAssignment,
} from '@/types/unifiedCalendar';
import { expandEventToDailyEvents, getDaysBetween } from '@/utils/calendarUtils';

// Constants
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
const CALENDAR_API_URL = `${API_BASE_URL}/calendar`;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1000;

// Development fallback flag
// const IS_DEVELOPMENT = import.meta.env.DEV;

// Shared calendar IDs
const SHARED_CALENDARS = {
  work_order:
    import.meta.env.GOOGLE_CALENDAR_WORK_ORDER ||
    'c_ad5019e5b89334560b5bff86d2f7f7dfa0ae4dda8c0684c40d7737cf29b46be3@group.calendar.google.com',
  project:
    import.meta.env.GOOGLE_CALENDAR_PROJECT ||
    'c_9922ed38fd075f4e7f24561de50df694acadd8df4f8a73026ca4448aa85e55c5@group.calendar.google.com',
  ad_hoc: 'primary',
};

// Auth strategies
type AuthStrategy = 'oauth' | 'service_account';

/**
 * Service class for Google Calendar operations
 */
export class GoogleCalendarService {
  private authToken?: string;
  private organizationCalendarId?: string;
  private _isDevelopmentMode: boolean;

  /**
   * Initialize the Google Calendar service
   * @param authToken Optional auth token to use for API requests
   * @param isDevelopmentMode Optional flag to enable development mode (mock responses) - this param is now for override only
   */
  constructor(authToken?: string, isDevelopmentMode?: boolean) {
    this.authToken = authToken;
    if (typeof isDevelopmentMode === 'boolean') {
      this._isDevelopmentMode = isDevelopmentMode;
    } else {
      // Default behavior: development mode is active if DEV is true AND mode is not 'e2emode'
      this._isDevelopmentMode = import.meta.env.DEV && import.meta.env.MODE !== 'e2emode';
    }
    console.log(
      '[googleCalendarService] Initialized. _isDevelopmentMode:',
      this._isDevelopmentMode,
      'import.meta.env.MODE:',
      import.meta.env.MODE,
      'import.meta.env.DEV:',
      import.meta.env.DEV
    );
  }

  /**
   * Set the auth token for API requests
   * @param token The authentication token
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Enable or disable development mode
   * @param enabled Whether development mode should be enabled
   */
  public setDevelopmentMode(enabled: boolean): void {
    this._isDevelopmentMode = enabled;
  }

  /**
   * Check if the service is in development mode
   */
  public get isDevelopmentMode(): boolean {
    return this._isDevelopmentMode;
  }

  /**
   * Fetch the organization's shared calendar ID for a specific entity type
   * @param entityType Type of entity (work_order, project, etc)
   * @returns The organization calendar ID for that entity type or null if none configured
   */
  public async getEntityCalendarId(entityType: EntityType): Promise<string | null> {
    try {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('calendar_settings')
        .select('calendar_id')
        .eq('entity_type', entityType)
        .eq('is_enabled', true)
        .single();

      if (error) throw error;

      if (data?.calendar_id) {
        return data.calendar_id;
      }

      // Fallback to predefined shared calendars
      return SHARED_CALENDARS[entityType] || null;
    } catch (error) {
      console.error(`Error fetching ${entityType} calendar ID:`, error);
      return SHARED_CALENDARS[entityType] || null;
    }
  }

  /**
   * Fetch the organization's shared calendar ID (legacy)
   * @returns The organization calendar ID or null if none configured
   */
  public async getOrganizationCalendarId(): Promise<string | null> {
    if (this.organizationCalendarId) {
      return this.organizationCalendarId;
    }

    try {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('organization_calendar')
        .select('google_calendar_id')
        .eq('is_enabled', true)
        .single();

      if (error) throw error;

      if (data?.google_calendar_id) {
        this.organizationCalendarId = data.google_calendar_id;
        return data.google_calendar_id;
      }

      return null;
    } catch (error) {
      console.error('Error fetching organization calendar ID:', error);
      return null;
    }
  }

  /**
   * Get the authentication strategy to use for a given entity type
   * @param entityType Type of entity (work_order, project, etc)
   * @returns The auth strategy to use ('oauth' or 'service_account')
   */
  private async getAuthStrategy(entityType: EntityType): Promise<AuthStrategy> {
    const isOAuthEnabled = await this.isAuthorized();

    // If user is authorized with OAuth, use that for personal calendar ops
    if (isOAuthEnabled && entityType === 'ad_hoc') {
      return 'oauth';
    }

    // For shared calendars or if OAuth isn't available, use service account
    return 'service_account';
  }

  /**
   * Check if the user is authorized with Google Calendar
   * @returns True if authorized, false otherwise
   */
  public async isAuthorized(): Promise<boolean> {
    console.log('[googleCalendarService] isAuthorized called.');
    console.log('[googleCalendarService] this._isDevelopmentMode:', this._isDevelopmentMode);

    // In development mode without API endpoints, return mock values
    if (this._isDevelopmentMode) {
      console.log('[googleCalendarService] Running in development mode path.');
      try {
        const response = await fetch(`${API_BASE_URL}/auth/status`, {
          method: 'GET',
          headers: this.getHeaders(),
          credentials: 'include',
        });
        console.log('[googleCalendarService] Dev path - response status:', response.status);
        if (!response.ok) {
          console.log('[googleCalendarService] Dev path - response not ok. Returning false.');
          return false;
        }
        const data = await response.json();
        console.log('[googleCalendarService] Dev path - response data:', data);
        const isAuthenticated = data.authenticated === true;
        console.log(
          '[googleCalendarService] Dev path - isAuthenticated based on data.authenticated:',
          isAuthenticated
        );
        return isAuthenticated;
      } catch (error) {
        console.error('[googleCalendarService] Dev path - catch error:', error);
        return false;
      }
    }

    // In production mode, make the actual API request
    console.log('[googleCalendarService] Running in production mode path.');
    try {
      const response = await fetch(`${API_BASE_URL}/auth/status`, {
        method: 'GET',
        headers: this.getHeaders(),
        credentials: 'include',
      });
      console.log('[googleCalendarService] Prod path - response status:', response.status);
      if (!response.ok) {
        console.log('[googleCalendarService] Prod path - response not ok. Returning false.');
        return false;
      }
      const data = await response.json();
      console.log('[googleCalendarService] Prod path - response data:', data);
      const isAuthenticated = data.authenticated === true;
      console.log(
        '[googleCalendarService] Prod path - isAuthenticated based on data.authenticated:',
        isAuthenticated
      );
      return isAuthenticated;
    } catch (error) {
      console.error(
        '[googleCalendarService] Prod path - Error checking Google Calendar authorization:',
        error
      );
      return false;
    }
  }

  /**
   * Create a calendar event
   * @param eventData Event data to create
   * @param options Additional Google Calendar options
   * @returns Response with created event
   */
  public async createEvent(
    eventData: CreateCalendarEventInput,
    options?: GoogleCalendarOptions
  ): Promise<CalendarEventResponse> {
    // In development mode without API, return a mock success response
    if (this._isDevelopmentMode) {
      const mockEvent = {
        ...eventData,
        id: `mock-id-${Date.now()}`,
        google_event_id: `mock-google-event-id-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ICalendarEventBase;

      // Check if this is a multi-day event that needs expansion
      if (
        eventData.end_datetime &&
        eventData.start_datetime !== eventData.end_datetime &&
        eventData.is_all_day !== false
      ) {
        const startDate = new Date(eventData.start_datetime);
        const endDate = new Date(eventData.end_datetime);
        const days = getDaysBetween(startDate, endDate);

        if (days > 1) {
          // This is a multi-day event, return just the first day's mock
          const expandedEvents = expandEventToDailyEvents(mockEvent);
          return {
            success: true,
            event: expandedEvents[0],
            google_event_id: expandedEvents[0].google_event_id,
            etag: 'mock-etag',
            multiDayExpanded: true,
            totalDays: days,
          };
        }
      }

      return {
        success: true,
        event: mockEvent,
        google_event_id: `mock-google-event-id-${Date.now()}`,
        etag: 'mock-etag',
      };
    }

    return this.withRetry(async () => {
      // Determine which calendar to use
      const calendarId =
        eventData.calendar_id || (await this.getDefaultCalendarId(eventData.entity_type));

      // Determine auth strategy
      const authStrategy = await this.getAuthStrategy(eventData.entity_type);

      // Check if this is a multi-day event that needs expansion
      if (
        eventData.end_datetime &&
        eventData.start_datetime !== eventData.end_datetime &&
        eventData.is_all_day !== false
      ) {
        const startDate = new Date(eventData.start_datetime);
        const endDate = new Date(eventData.end_datetime);
        const days = getDaysBetween(startDate, endDate);

        if (days > 1) {
          // This is a multi-day event, we need to create multiple events
          console.log(`Expanding multi-day event over ${days} days`);

          // Create a temporary event object that we'll expand
          const baseEvent: ICalendarEventBase = {
            ...(eventData as any),
            id: `temp-id-${Date.now()}`, // Will be replaced by actual DB IDs
            google_event_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            calendar_id: calendarId,
          };

          // Expand into daily events
          const expandedEvents = expandEventToDailyEvents(baseEvent);

          // Create each daily event
          const createdEvents: ICalendarEventBase[] = [];

          for (const dailyEvent of expandedEvents) {
            // Prepare the request data for this day
            const dailyRequestData = {
              ...eventData,
              title: dailyEvent.title, // Include day number in title
              start_datetime: dailyEvent.start_datetime,
              end_datetime: dailyEvent.end_datetime,
              calendar_id: calendarId,
              authStrategy,
              googleOptions: {
                ...options,
                // Only send notifications for the first event
                sendUpdates: dailyEvent.day_number === 1 ? options?.sendUpdates : 'none',
              },
              extended_properties: {
                ...eventData.extended_properties,
                day_number: String(dailyEvent.day_number),
                total_days: String(dailyEvent.total_days),
                original_event_id: dailyEvent.original_event_id || '',
              },
            };

            // Make the API request for this daily event
            const response = await fetch(`${CALENDAR_API_URL}/events`, {
              method: 'POST',
              headers: this.getHeaders(),
              body: JSON.stringify(dailyRequestData),
            });

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(
                errorData.message || `Failed to create daily event: ${response.statusText}`
              );
            }

            const data = await response.json();

            // Store this daily event
            await this.saveToUnifiedTable(data.event);

            // Create assignments if there are attendees for this day
            if (eventData.attendees && eventData.attendees.length > 0) {
              await this.createAssignments(
                eventData.entity_type,
                eventData.entity_id,
                eventData.attendees,
                calendarId,
                data.google_event_id,
                data.etag,
                new Date(dailyEvent.start_datetime),
                new Date(dailyEvent.end_datetime)
              );
            }

            createdEvents.push(data.event);
          }

          // Return information about the first day's event
          return {
            success: true,
            event: createdEvents[0],
            google_event_id: createdEvents[0].google_event_id,
            etag: 'multi-day',
            multiDayExpanded: true,
            totalDays: days,
          };
        }
      }

      // Single day event - normal processing
      const requestData = {
        ...eventData,
        calendar_id: calendarId,
        authStrategy,
        googleOptions: options || {},
      };

      // Make the API request
      const response = await fetch(`${CALENDAR_API_URL}/events`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create event: ${response.statusText}`);
      }

      const data = await response.json();

      // Store in unified_calendar_events table
      const eventId = await this.saveToUnifiedTable(data.event);

      // Create assignments if there are attendees
      if (eventData.attendees && eventData.attendees.length > 0) {
        await this.createAssignments(
          eventData.entity_type,
          eventData.entity_id,
          eventData.attendees,
          calendarId,
          data.google_event_id,
          data.etag,
          new Date(eventData.start_datetime),
          eventData.end_datetime ? new Date(eventData.end_datetime) : null
        );
      }

      return {
        success: true,
        event: data.event,
        google_event_id: data.google_event_id,
        etag: data.etag,
      };
    });
  }

  /**
   * Update an existing calendar event
   * @param eventId Event ID in our system
   * @param updateData Data to update
   * @param options Additional Google Calendar options
   * @returns Response with updated event
   */
  public async updateEvent(
    eventId: string,
    updateData: UpdateCalendarEventInput,
    options?: GoogleCalendarOptions
  ): Promise<CalendarEventResponse> {
    // In development mode without API, return a mock success response
    if (this._isDevelopmentMode) {
      return {
        success: true,
        event: {
          id: eventId,
          ...updateData,
          google_event_id: `mock-google-event-id-${Date.now()}`,
          updated_at: new Date().toISOString(),
        } as ICalendarEventBase,
        google_event_id: `mock-google-event-id-${Date.now()}`,
      };
    }

    return this.withRetry(async () => {
      // Fetch the existing event from our database
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      // Determine auth strategy
      const authStrategy = await this.getAuthStrategy(existingEvent.entity_type as EntityType);

      // Make the API request
      const response = await fetch(`${CALENDAR_API_URL}/events/${existingEvent.google_event_id}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({
          ...updateData,
          calendar_id: updateData.calendar_id || existingEvent.calendar_id,
          authStrategy,
          googleOptions: options || {},
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update event: ${response.statusText}`);
      }

      const data = await response.json();

      // Update in unified_calendar_events table
      await this.updateUnifiedTableEvent(eventId, {
        ...updateData,
        google_event_id: data.google_event_id,
        updated_at: new Date().toISOString(),
      });

      // Update assignments if there are attendees
      if (updateData.attendees && updateData.attendees.length > 0) {
        // First remove existing assignments
        await this.deleteAssignments(
          existingEvent.entity_type as EntityType,
          existingEvent.entity_id
        );

        // Then create new ones
        await this.createAssignments(
          existingEvent.entity_type as EntityType,
          existingEvent.entity_id,
          updateData.attendees,
          existingEvent.calendar_id,
          data.google_event_id,
          data.etag,
          new Date(updateData.start_datetime || existingEvent.start_datetime),
          updateData.end_datetime || existingEvent.end_datetime
            ? new Date(updateData.end_datetime || existingEvent.end_datetime)
            : null
        );
      }

      return {
        success: true,
        event: data.event,
        google_event_id: data.google_event_id,
        etag: data.etag,
      };
    });
  }

  /**
   * Delete a calendar event
   * @param eventId Event ID in our system
   * @returns Success status
   */
  public async deleteEvent(eventId: string): Promise<CalendarEventResponse> {
    // In development mode without API, return a mock success response
    if (this._isDevelopmentMode) {
      return { success: true };
    }

    return this.withRetry(async () => {
      // Fetch the existing event from our database
      const existingEvent = await this.getEventById(eventId);
      if (!existingEvent) {
        throw new Error(`Event with ID ${eventId} not found`);
      }

      // Skip Google Calendar deletion if no Google event ID
      if (!existingEvent.google_event_id) {
        // Just delete from our database
        await this.deleteFromUnifiedTable(eventId);
        return { success: true };
      }

      // Determine auth strategy
      const authStrategy = await this.getAuthStrategy(existingEvent.entity_type as EntityType);

      // Make the API request to delete from Google Calendar
      const response = await fetch(
        `${CALENDAR_API_URL}/events/${existingEvent.google_event_id}?calendarId=${encodeURIComponent(existingEvent.calendar_id)}&authStrategy=${authStrategy}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete event: ${response.statusText}`);
      }

      // Delete from unified_calendar_events table
      await this.deleteFromUnifiedTable(eventId);

      // Delete assignments
      await this.deleteAssignments(
        existingEvent.entity_type as EntityType,
        existingEvent.entity_id
      );

      return { success: true };
    });
  }

  /**
   * List events from Google Calendar within a time range
   * @param startTime Start of time range (ISO string)
   * @param endTime End of time range (ISO string)
   * @param entityType Optional entity type to determine which calendar to use
   * @param calendarId Optional specific calendar ID (overrides entity type)
   * @returns Array of calendar events
   */
  public async listEvents(
    startTime: string,
    endTime: string,
    entityType?: EntityType,
    calendarId?: string
  ): Promise<ICalendarEventBase[]> {
    // In development mode without API, return mock events
    if (this._isDevelopmentMode) {
      return [
        {
          id: 'mock-event-1',
          title: 'Mock Event 1',
          description: 'This is a mock event for development',
          start_datetime: startTime,
          end_datetime: endTime,
          is_all_day: false,
          location: null,
          assignee_type: null,
          assignee_id: null,
          entity_type: entityType || 'work_order',
          entity_id: 'mock-entity-1',
          sync_enabled: true,
          calendar_id: calendarId || SHARED_CALENDARS[entityType || 'work_order'],
          google_event_id: 'mock-google-event-1',
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          attendees: [],
        },
      ];
    }

    return this.withRetry(async () => {
      let calendar: string;

      // Determine which calendar to use
      if (calendarId) {
        calendar = calendarId;
      } else if (entityType) {
        calendar = await this.getDefaultCalendarId(entityType);
      } else {
        calendar = await this.getDefaultCalendarId('ad_hoc');
      }

      // Determine auth strategy
      const authStrategy = await this.getAuthStrategy(entityType || 'ad_hoc');

      // Prepare query parameters
      const params = new URLSearchParams({
        calendarId: calendar,
        timeMin: startTime,
        timeMax: endTime,
        authStrategy,
      });

      // Make the API request
      const response = await fetch(`${CALENDAR_API_URL}/events?${params}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to list events: ${response.statusText}`);
      }

      const data = await response.json();
      return data.events || [];
    });
  }

  /**
   * Sync a specific entity with Google Calendar
   * @param entityType Type of entity (project_milestone, etc.)
   * @param entityId ID of the entity
   * @returns The sync result
   */
  public async syncEntityWithCalendar(
    entityType: EntityType,
    entityId: string
  ): Promise<CalendarEventResponse> {
    // In development mode without API, return a mock success response
    if (this._isDevelopmentMode) {
      return {
        success: true,
        event: {
          id: `mock-id-${Date.now()}`,
          title: 'Mock Synced Event',
          description: 'This is a mock synced event for development',
          start_datetime: new Date().toISOString(),
          end_datetime: new Date(Date.now() + 3600000).toISOString(),
          is_all_day: false,
          location: null,
          assignee_type: null,
          assignee_id: null,
          entity_type: entityType,
          entity_id: entityId,
          sync_enabled: true,
          calendar_id: SHARED_CALENDARS[entityType],
          google_event_id: `mock-google-event-id-${Date.now()}`,
          last_synced_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          created_by: null,
          attendees: [],
        } as ICalendarEventBase,
        google_event_id: `mock-google-event-id-${Date.now()}`,
      };
    }

    return this.withRetry(async () => {
      // Determine auth strategy
      const authStrategy = await this.getAuthStrategy(entityType);

      // Make the API request
      const response = await fetch(`${CALENDAR_API_URL}/sync`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          entity_type: entityType,
          entity_id: entityId,
          authStrategy,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to sync entity: ${response.statusText}`);
      }

      const data = await response.json();

      // Create assignments if there are attendees
      if (data.event.attendees && data.event.attendees.length > 0) {
        await this.createAssignments(
          entityType,
          entityId,
          data.event.attendees,
          data.event.calendar_id,
          data.google_event_id,
          data.etag,
          new Date(data.event.start_datetime),
          data.event.end_datetime ? new Date(data.event.end_datetime) : null
        );
      }

      return {
        success: true,
        event: data.event,
        google_event_id: data.google_event_id,
        etag: data.etag,
      };
    });
  }

  /**
   * Perform a two-way sync with Google Calendar
   * @param calendarId The Google Calendar ID to sync
   * @returns Success status and counts of changes
   */
  public async performTwoWaySync(calendarId: string): Promise<{
    success: boolean;
    changes: { created: number; updated: number; deleted: number };
  }> {
    // In development mode, return mock response
    if (this._isDevelopmentMode) {
      return {
        success: true,
        changes: { created: 2, updated: 1, deleted: 0 },
      };
    }

    return this.withRetry(async () => {
      // Fetch the current sync token
      const { data: cursorData, error: cursorError } = await supabase
        .from('sync_cursors')
        .select('next_sync_token')
        .eq('calendar_id', calendarId)
        .single();

      if (cursorError && cursorError.code !== 'PGRST116') {
        // Not found is okay
        throw cursorError;
      }

      const syncToken = cursorData?.next_sync_token || null;

      // Call syncDownChanges to perform the actual sync
      const result = await this.syncDownChanges(calendarId, syncToken);

      return {
        success: true,
        changes: result.changes,
      };
    });
  }

  /**
   * Sync down changes from Google Calendar
   * @param calendarId The Google Calendar ID to sync
   * @param syncToken Optional sync token for incremental sync
   * @param pageToken Optional page token for continuing a paginated sync
   * @returns Success status, counts of changes, and next sync token
   */
  public async syncDownChanges(
    calendarId: string,
    syncToken: string | null = null,
    pageToken: string | null = null
  ): Promise<{
    success: boolean;
    changes: { created: number; updated: number; deleted: number };
    nextSyncToken: string;
  }> {
    // In development mode, return mock response
    if (this._isDevelopmentMode) {
      return {
        success: true,
        changes: { created: 2, updated: 1, deleted: 0 },
        nextSyncToken: `mock-sync-token-${Date.now()}`,
      };
    }

    // Determine auth strategy - use service account for shared calendars
    const authStrategy: AuthStrategy = 'service_account';

    // Track changes for this sync operation
    const changes = {
      created: 0,
      updated: 0,
      deleted: 0,
    };

    // Prepare query parameters
    const params = new URLSearchParams({
      calendarId,
      authStrategy,
    });

    // Add syncToken if available
    if (syncToken) {
      params.append('syncToken', syncToken);
    } else {
      // If no sync token, use a time-based full sync (past 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      params.append('timeMin', thirtyDaysAgo.toISOString());
    }

    // Add pageToken if available
    if (pageToken) {
      params.append('pageToken', pageToken);
    }

    // Make the API request
    const response = await fetch(`${CALENDAR_API_URL}/events?${params}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle sync token expiration (special case)
      if (response.status === 410 && syncToken) {
        console.warn('Sync token expired, performing full sync');

        // Delete the expired token
        await supabase.from('sync_cursors').delete().eq('calendar_id', calendarId);

        // Restart with a full sync
        return this.syncDownChanges(calendarId, null);
      }

      throw new Error(errorData.message || `Failed to sync events: ${response.statusText}`);
    }

    const data = await response.json();
    const events = data.items || [];
    const nextPageToken = data.nextPageToken || null;
    const newSyncToken = data.nextSyncToken || null;

    // Process each event
    for (const event of events) {
      // Skip events without IDs
      if (!event.id) continue;

      // Check if this is a deletion event
      const isDeleted = event.status === 'cancelled';

      if (isDeleted) {
        // Process deletion
        await this.processDeletedEvent(calendarId, event.id);
        changes.deleted++;
        continue;
      }

      // Process creation or update
      try {
        const result = await this.processEvent(calendarId, event);
        if (result.action === 'created') {
          changes.created++;
        } else if (result.action === 'updated') {
          changes.updated++;
        }
      } catch (error) {
        // Log error but continue processing other events
        console.error(`Error processing event ${event.id}:`, error);

        // Log etag conflict with more details
        if (error instanceof Error && error.message.includes('etag')) {
          await this.logEtagConflict(calendarId, event.id, error.message);
        }
      }
    }

    // If there's a next page, process it recursively
    if (nextPageToken) {
      const nextPageResult = await this.syncDownChanges(calendarId, syncToken, nextPageToken);

      // Merge the changes
      changes.created += nextPageResult.changes.created;
      changes.updated += nextPageResult.changes.updated;
      changes.deleted += nextPageResult.changes.deleted;

      // Use the final sync token
      const finalSyncToken = nextPageResult.nextSyncToken;

      // Store the sync token for future syncs
      if (finalSyncToken) {
        await this.updateSyncToken(calendarId, finalSyncToken);
      }

      return {
        success: true,
        changes,
        nextSyncToken: finalSyncToken,
      };
    }

    // No more pages, store the sync token for future syncs
    if (newSyncToken) {
      await this.updateSyncToken(calendarId, newSyncToken);
    }

    return {
      success: true,
      changes,
      nextSyncToken: newSyncToken || '',
    };
  }

  /**
   * Process a Google Calendar event (create or update)
   * @param calendarId The calendar ID
   * @param event The Google Calendar event
   * @returns The result of the operation
   */
  private async processEvent(
    calendarId: string,
    event: any
  ): Promise<{ action: 'created' | 'updated' | 'skipped'; id?: string }> {
    // Extract entity information from extended properties
    const extendedProps = event.extendedProperties?.private || {};
    const entityType = (extendedProps.entityType as EntityType) || 'ad_hoc';
    const entityId = extendedProps.entityId || 'unknown';

    // Check if we already have this event
    const { data: existingEvents, error } = await supabase
      .from('unified_calendar_events')
      .select('id, google_event_id, etag')
      .eq('google_event_id', event.id)
      .eq('calendar_id', calendarId);

    if (error) {
      throw new Error(`Error checking for existing event: ${error.message}`);
    }

    // Map the Google Calendar event to our unified format
    const eventData: Partial<ICalendarEventBase> = {
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      start_datetime: event.start?.dateTime || event.start?.date,
      end_datetime: event.end?.dateTime || event.end?.date,
      is_all_day: !event.start?.dateTime, // If only date, it's an all-day event
      location: event.location || null,
      entity_type: entityType,
      entity_id: entityId,
      sync_enabled: true,
      calendar_id: calendarId,
      google_event_id: event.id,
      etag: event.etag,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      attendees: event.attendees
        ? event.attendees.map((a: any) => ({
            email: a.email,
            name: a.displayName || a.email,
            response_status: a.responseStatus || 'needsAction',
          }))
        : [],
    };

    // Handle extended properties
    if (Object.keys(extendedProps).length > 0) {
      eventData.extended_properties = extendedProps;
    }

    if (existingEvents && existingEvents.length > 0) {
      const existingEvent = existingEvents[0];

      // Check etag to see if it's actually changed
      if (existingEvent.etag === event.etag) {
        return { action: 'skipped' };
      }

      // Update the event in our database
      const { error: updateError } = await supabase
        .from('unified_calendar_events')
        .update(eventData)
        .eq('id', existingEvent.id);

      if (updateError) {
        throw new Error(`Error updating event: ${updateError.message}`);
      }

      return { action: 'updated', id: existingEvent.id };
    }

    // Create a new event in our database
    const { data: newEvent, error: insertError } = await supabase
      .from('unified_calendar_events')
      .insert([eventData])
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Error creating event: ${insertError.message}`);
    }

    return { action: 'created', id: newEvent.id };
  }

  /**
   * Process a deleted Google Calendar event
   * @param calendarId The calendar ID
   * @param googleEventId The Google Calendar event ID
   */
  private async processDeletedEvent(calendarId: string, googleEventId: string): Promise<void> {
    // Find the event in our database
    const { data: events, error } = await supabase
      .from('unified_calendar_events')
      .select('id, entity_type, entity_id')
      .eq('google_event_id', googleEventId)
      .eq('calendar_id', calendarId);

    if (error) {
      throw new Error(`Error finding event to delete: ${error.message}`);
    }

    if (!events || events.length === 0) {
      // Event not found in our system, nothing to do
      return;
    }

    for (const event of events) {
      // Delete the event from our database
      await supabase.from('unified_calendar_events').delete().eq('id', event.id);

      // Delete related assignments
      if (event.entity_type && event.entity_id) {
        await this.deleteAssignments(event.entity_type as EntityType, event.entity_id);
      }
    }
  }

  /**
   * Update the sync token for a calendar
   * @param calendarId The calendar ID
   * @param syncToken The new sync token
   */
  private async updateSyncToken(calendarId: string, syncToken: string): Promise<void> {
    try {
      const { error } = await supabase.from('sync_cursors').upsert({
        calendar_id: calendarId,
        next_sync_token: syncToken,
        last_sync_time: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error updating sync token:', error);
      }
    } catch (error) {
      console.error('Error updating sync token:', error);
    }
  }

  /**
   * Log an etag conflict for later analysis
   * @param calendarId The calendar ID
   * @param googleEventId The Google Calendar event ID
   * @param errorMessage The error message
   */
  private async logEtagConflict(
    calendarId: string,
    googleEventId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      await supabase.from('sync_conflict_logs').insert({
        calendar_id: calendarId,
        google_event_id: googleEventId,
        error_message: errorMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error logging etag conflict:', error);
    }
  }

  /**
   * Setup push notifications for a calendar
   * @param calendarId The Google Calendar ID to monitor
   * @param webhookUrl The URL that will receive notifications
   * @returns Success status and channel ID
   */
  public async setupPushNotifications(
    calendarId: string,
    webhookUrl: string
  ): Promise<{ success: boolean; channelId: string }> {
    // In development mode, return mock response
    if (this._isDevelopmentMode) {
      const channelId = `mock-channel-${Date.now()}`;
      return {
        success: true,
        channelId,
      };
    }

    return this.withRetry(async () => {
      // Generate a unique channel ID
      const channelId = `channel-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // Calculate expiration (1 week from now)
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + 7);

      // Make the API request to setup push notifications
      const response = await fetch(`${CALENDAR_API_URL}/watch`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          calendarId,
          channelId,
          address: webhookUrl,
          expiration: expiration.getTime().toString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to setup push notifications: ${response.statusText}`
        );
      }

      const data = await response.json();

      // Store the channel information
      const { error } = await supabase.from('push_notification_channels').upsert({
        id: channelId,
        calendar_id: calendarId,
        resource_id: data.resourceId,
        expiration: expiration.toISOString(),
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error storing push notification channel:', error);
      }

      return {
        success: true,
        channelId,
      };
    });
  }

  // ------------------ Private Helper Methods ------------------

  /**
   * Get default HTTP headers for API requests
   * @returns Headers object
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Get the default calendar ID to use for an entity type
   * @param entityType Type of entity
   * @returns Calendar ID to use
   */
  private async getDefaultCalendarId(entityType: EntityType = 'ad_hoc'): Promise<string> {
    const entityCalendarId = await this.getEntityCalendarId(entityType);
    if (entityCalendarId) return entityCalendarId;

    // Fallback to organization calendar for backwards compatibility
    const orgCalendarId = await this.getOrganizationCalendarId();
    if (orgCalendarId) return orgCalendarId;

    // Last resort, use predefined calendar or primary
    return SHARED_CALENDARS[entityType] || 'primary';
  }

  /**
   * Execute a function with retry logic
   * @param fn Function to execute
   * @returns Result of the function
   */
  private async withRetry<T>(fn: () => Promise<T>): Promise<T> {
    // In development mode, don't retry to avoid extra console errors
    if (this._isDevelopmentMode) {
      try {
        return await fn();
      } catch (error) {
        console.error('Operation failed in development mode:', error);
        throw error;
      }
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(`Attempt ${attempt}/${MAX_RETRY_ATTEMPTS} failed:`, lastError);

        // Don't wait after the last attempt
        if (attempt < MAX_RETRY_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * attempt));
        }
      }
    }

    throw lastError || new Error('Operation failed after multiple attempts');
  }

  /**
   * Fetch an event from the unified_calendar_events table
   * @param eventId ID of the event to fetch
   * @returns The event or null if not found
   */
  private async getEventById(eventId: string): Promise<ICalendarEventBase | null> {
    try {
      const { data, error } = await supabase
        .from('unified_calendar_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;
      return data as ICalendarEventBase;
    } catch (error) {
      console.error('Error fetching event:', error);
      return null;
    }
  }

  /**
   * Save an event to the unified_calendar_events table
   * @param event Event data to save
   * @returns The saved event ID
   */
  private async saveToUnifiedTable(event: ICalendarEventBase): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('unified_calendar_events')
        .insert([event])
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving event to unified table:', error);
      throw error;
    }
  }

  /**
   * Update an event in the unified_calendar_events table
   * @param eventId ID of the event to update
   * @param updateData Update data
   * @returns Success status
   */
  private async updateUnifiedTableEvent(
    eventId: string,
    updateData: Partial<ICalendarEventBase>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('unified_calendar_events')
        .update(updateData)
        .eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating event in unified table:', error);
      throw error;
    }
  }

  /**
   * Delete an event from the unified_calendar_events table
   * @param eventId ID of the event to delete
   * @returns Success status
   */
  private async deleteFromUnifiedTable(eventId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('unified_calendar_events').delete().eq('id', eventId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting event from unified table:', error);
      throw error;
    }
  }

  /**
   * Create assignments for attendees
   * @param entityType Type of entity
   * @param entityId ID of the entity
   * @param attendees List of attendees
   * @param calendarId Calendar ID
   * @param googleEventId Google Calendar Event ID
   * @param etag ETag for the event
   * @param startDate Start date
   * @param endDate Optional end date
   */
  private async createAssignments(
    entityType: EntityType,
    entityId: string,
    attendees: { id: string; type: AssigneeType; rate?: number }[],
    calendarId: string,
    googleEventId: string,
    etag: string,
    startDate: Date,
    endDate: Date | null
  ): Promise<void> {
    try {
      // First, convert to assignments
      const assignments: CalendarAssignment[] = attendees.map(attendee => ({
        entity_type: entityType,
        entity_id: entityId,
        assignee_id: attendee.id,
        calendar_id: calendarId,
        google_event_id: googleEventId,
        etag,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate ? endDate.toISOString().split('T')[0] : null,
        rate_per_hour: attendee.rate || null,
      }));

      // Batch insert using RPC
      for (const assignment of assignments) {
        await supabase.rpc('upsert_assignment', {
          p_entity_type: assignment.entity_type,
          p_entity_id: assignment.entity_id,
          p_assignee_id: assignment.assignee_id,
          p_calendar_id: assignment.calendar_id,
          p_google_event_id: assignment.google_event_id,
          p_etag: assignment.etag,
          p_start_date: assignment.start_date,
          p_end_date: assignment.end_date,
          p_rate_per_hour: assignment.rate_per_hour,
        });
      }
    } catch (error) {
      console.error('Error creating assignments:', error);
    }
  }

  /**
   * Delete assignments for an entity
   * @param entityType Type of entity
   * @param entityId ID of the entity
   */
  private async deleteAssignments(entityType: EntityType, entityId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('assignments')
        .delete()
        .match({ entity_type: entityType, entity_id: entityId });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting assignments:', error);
    }
  }
}

// Create a singleton instance for easy import
export const googleCalendarService = new GoogleCalendarService();

// Export the class for testing and advanced use cases
export default GoogleCalendarService;
