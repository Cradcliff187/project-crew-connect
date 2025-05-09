/**
 * Unit tests for Google Calendar Service
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import GoogleCalendarService from '../googleCalendarService';
import { CreateCalendarEventInput } from '@/types/unifiedCalendar';

// Mock the fetch function
global.fetch = vi.fn();

// Mock supabase
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { google_calendar_id: 'test-calendar-id' },
              error: null
            }))
          })),
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-event-id', title: 'Test Event' },
            error: null
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({
              data: { id: 'new-event-id' },
              error: null
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            error: null
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({
            error: null
          }))
        }))
      })
    }
  };
});

describe('GoogleCalendarService', () => {
  let service: GoogleCalendarService;

  // Mock response setup
  const mockJsonResponse = (data: any) => {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    });
  };

  const mockErrorResponse = (status = 400, statusText = 'Bad Request') => {
    return Promise.resolve({
      ok: false,
      status,
      statusText,
      json: () => Promise.resolve({ message: 'Error message' })
    });
  };

  beforeEach(() => {
    service = new GoogleCalendarService('test-token');
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('getOrganizationCalendarId', () => {
    it('should fetch and cache the organization calendar ID', async () => {
      const calendarId = await service.getOrganizationCalendarId();
      expect(calendarId).toBe('test-calendar-id');

      // Should use cached value on second call
      const secondCall = await service.getOrganizationCalendarId();
      expect(secondCall).toBe('test-calendar-id');
    });
  });

  describe('isAuthorized', () => {
    it('should return true when authorized', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({ authorized: true })
      );

      const result = await service.isAuthorized();
      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/auth/status'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should return false when not authorized', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({ authorized: false })
      );

      const result = await service.isAuthorized();
      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const result = await service.isAuthorized();
      expect(result).toBe(false);
    });
  });

  describe('createEvent', () => {
    const mockEvent: CreateCalendarEventInput = {
      title: 'Test Event',
      description: 'Test Description',
      start_datetime: '2023-11-08T10:00:00Z',
      end_datetime: '2023-11-08T11:00:00Z',
      is_all_day: false,
      location: 'Test Location',
      calendar_id: 'test-calendar-id',
      sync_enabled: true,
      assignee_type: 'employee',
      assignee_id: 'test-employee-id',
      entity_type: 'project_milestone',
      entity_id: 'test-milestone-id',
      created_by: 'test-user-id'
    };

    it('should create an event successfully', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          success: true,
          event: { ...mockEvent, id: 'new-event-id', google_event_id: 'google-event-id' },
          google_event_id: 'google-event-id'
        })
      );

      const result = await service.createEvent(mockEvent);

      expect(result.success).toBe(true);
      expect(result.google_event_id).toBe('google-event-id');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/events'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining(mockEvent.title)
        })
      );
    });

    it('should handle errors when creating an event', async () => {
      (global.fetch as any).mockResolvedValueOnce(mockErrorResponse());

      await expect(service.createEvent(mockEvent)).rejects.toThrow('Error message');
    });
  });

  describe('updateEvent', () => {
    it('should update an event successfully', async () => {
      // Mock getEventById
      vi.spyOn(service as any, 'getEventById').mockResolvedValueOnce({
        id: 'test-event-id',
        google_event_id: 'google-event-id',
        calendar_id: 'test-calendar-id'
      });

      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          success: true,
          event: { id: 'test-event-id', title: 'Updated Event' },
          google_event_id: 'google-event-id'
        })
      );

      const result = await service.updateEvent('test-event-id', { title: 'Updated Event' });

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/events/google-event-id'),
        expect.objectContaining({
          method: 'PUT',
          body: expect.stringContaining('Updated Event')
        })
      );
    });

    it('should throw an error if the event is not found', async () => {
      vi.spyOn(service as any, 'getEventById').mockResolvedValueOnce(null);

      await expect(service.updateEvent('not-found-id', { title: 'Updated Event' }))
        .rejects.toThrow('Event with ID not-found-id not found');
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event successfully', async () => {
      vi.spyOn(service as any, 'getEventById').mockResolvedValueOnce({
        id: 'test-event-id',
        google_event_id: 'google-event-id',
        calendar_id: 'test-calendar-id'
      });

      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({ success: true })
      );

      const result = await service.deleteEvent('test-event-id');

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/events/google-event-id'),
        expect.objectContaining({
          method: 'DELETE'
        })
      );
    });

    it('should skip Google Calendar deletion if no Google event ID', async () => {
      vi.spyOn(service as any, 'getEventById').mockResolvedValueOnce({
        id: 'test-event-id',
        google_event_id: null,
        calendar_id: 'test-calendar-id'
      });

      vi.spyOn(service as any, 'deleteFromUnifiedTable').mockResolvedValueOnce(true);

      const result = await service.deleteEvent('test-event-id');

      expect(result.success).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('listEvents', () => {
    it('should list events for a time range', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          events: [
            { id: 'event-1', title: 'Event 1' },
            { id: 'event-2', title: 'Event 2' }
          ]
        })
      );

      const result = await service.listEvents(
        '2023-11-01T00:00:00Z',
        '2023-11-30T23:59:59Z',
        'test-calendar-id'
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('event-1');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/events?'),
        expect.any(Object)
      );
    });
  });

  describe('retry mechanism', () => {
    it('should retry failed requests', async () => {
      // First attempt fails, second succeeds
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(mockJsonResponse({ authorized: true }));

      const result = await service.isAuthorized();

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should stop retrying after MAX_RETRY_ATTEMPTS', async () => {
      (global.fetch as any)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'));

      await expect(service.isAuthorized()).rejects.toThrow('Network error');
      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('syncDownChanges', () => {
    beforeEach(() => {
      // Mock updateSyncToken method
      vi.spyOn(service as any, 'updateSyncToken').mockResolvedValue(undefined);

      // Mock processEvent method
      vi.spyOn(service as any, 'processEvent').mockImplementation(async (calendarId, event) => {
        if (event.id === 'error-event') {
          throw new Error('Processing error');
        }
        if (event.id === 'etag-conflict') {
          throw new Error('etag conflict: expected xyz, got abc');
        }
        return {
          action: event.id.includes('new') ? 'created' : 'updated',
          id: `processed-${event.id}`
        };
      });

      // Mock processDeletedEvent method
      vi.spyOn(service as any, 'processDeletedEvent').mockResolvedValue(undefined);

      // Mock logEtagConflict method
      vi.spyOn(service as any, 'logEtagConflict').mockResolvedValue(undefined);
    });

    it('should process events and return change counts', async () => {
      // Mock response with events
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-1', summary: 'New Event 1' },
            { id: 'existing-event-1', summary: 'Existing Event 1' },
            { id: 'deleted-event-1', status: 'cancelled' }
          ],
          nextSyncToken: 'new-sync-token-123'
        })
      );

      const result = await service.syncDownChanges('test-calendar-id', 'old-sync-token');

      expect(result.success).toBe(true);
      expect(result.changes).toEqual({ created: 1, updated: 1, deleted: 1 });
      expect(result.nextSyncToken).toBe('new-sync-token-123');

      // Verify processing methods were called
      expect((service as any).processEvent).toHaveBeenCalledTimes(2);
      expect((service as any).processDeletedEvent).toHaveBeenCalledTimes(1);

      // Verify sync token was updated
      expect((service as any).updateSyncToken).toHaveBeenCalledWith(
        'test-calendar-id',
        'new-sync-token-123'
      );
    });

    it('should handle pagination correctly', async () => {
      // First page with nextPageToken
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-1', summary: 'New Event 1' }
          ],
          nextPageToken: 'page-token-2'
        })
      );

      // Second page with nextSyncToken
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-2', summary: 'New Event 2' }
          ],
          nextSyncToken: 'new-sync-token-456'
        })
      );

      const result = await service.syncDownChanges('test-calendar-id', 'old-sync-token');

      expect(result.success).toBe(true);
      expect(result.changes).toEqual({ created: 2, updated: 0, deleted: 0 });
      expect(result.nextSyncToken).toBe('new-sync-token-456');

      // Check that both fetch calls were made
      expect(global.fetch).toHaveBeenCalledTimes(2);

      // Second call should include the page token
      expect(global.fetch).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining('pageToken=page-token-2'),
        expect.anything()
      );
    });

    it('should handle sync token expiration (410 error)', async () => {
      // First call returns 410 Gone (sync token expired)
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 410,
        statusText: 'Gone',
        json: () => Promise.resolve({ message: 'Sync token expired' })
      });

      // Second call (full sync) succeeds
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-1', summary: 'New Event 1' }
          ],
          nextSyncToken: 'brand-new-sync-token'
        })
      );

      // Mock supabase delete operation for expired token
      const mockDelete = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null })
      });

      // Override the from mock for this specific case
      const originalFrom = (vi.mocked(require('@/integrations/supabase/client').supabase.from) as any);
      vi.mocked(require('@/integrations/supabase/client').supabase.from).mockImplementation((table) => {
        if (table === 'sync_cursors') {
          return {
            delete: mockDelete,
            // Include other methods that might be used
            upsert: vi.fn().mockResolvedValue({ error: null })
          };
        }
        return originalFrom(table);
      });

      const result = await service.syncDownChanges('test-calendar-id', 'expired-token');

      expect(result.success).toBe(true);
      expect(result.changes).toEqual({ created: 1, updated: 0, deleted: 0 });

      // Verify that delete was called for the expired token
      expect(mockDelete).toHaveBeenCalled();

      // Verify that a full sync was performed (second API call)
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should handle event processing errors gracefully', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-1', summary: 'New Event 1' },
            { id: 'error-event', summary: 'Error Event' },
            { id: 'etag-conflict', summary: 'Etag Conflict Event' }
          ],
          nextSyncToken: 'new-sync-token-789'
        })
      );

      const result = await service.syncDownChanges('test-calendar-id', 'old-sync-token');

      // Should still succeed overall even with individual event errors
      expect(result.success).toBe(true);
      expect(result.changes).toEqual({ created: 1, updated: 0, deleted: 0 });

      // Verify etag conflict was logged
      expect((service as any).logEtagConflict).toHaveBeenCalledWith(
        'test-calendar-id',
        'etag-conflict',
        'etag conflict: expected xyz, got abc'
      );
    });

    it('should perform a full sync when no sync token is provided', async () => {
      (global.fetch as any).mockResolvedValueOnce(
        mockJsonResponse({
          items: [
            { id: 'new-event-1', summary: 'New Event 1' }
          ],
          nextSyncToken: 'first-sync-token'
        })
      );

      const result = await service.syncDownChanges('test-calendar-id', null);

      expect(result.success).toBe(true);

      // Verify timeMin was used instead of syncToken
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('timeMin='),
        expect.anything()
      );

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('syncToken='),
        expect.anything()
      );
    });
  });

  describe('performTwoWaySync', () => {
    it('should call syncDownChanges with the current sync token', async () => {
      // Mock supabase to return a sync token
      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { next_sync_token: 'current-sync-token' },
            error: null
          })
        })
      });

      vi.mocked(require('@/integrations/supabase/client').supabase.from).mockImplementation((table) => {
        if (table === 'sync_cursors') {
          return { select: mockSelect };
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({ data: null, error: null })
            })
          })
        };
      });

      // Mock syncDownChanges to return a result
      vi.spyOn(service, 'syncDownChanges').mockResolvedValueOnce({
        success: true,
        changes: { created: 3, updated: 2, deleted: 1 },
        nextSyncToken: 'new-sync-token'
      });

      const result = await service.performTwoWaySync('test-calendar-id');

      expect(result.success).toBe(true);
      expect(result.changes).toEqual({ created: 3, updated: 2, deleted: 1 });

      // Verify syncDownChanges was called with the correct token
      expect(service.syncDownChanges).toHaveBeenCalledWith(
        'test-calendar-id',
        'current-sync-token'
      );
    });
  });
});
