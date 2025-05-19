import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createCalendarService, GoogleCalendarClient } from '../../src/services/calendarService';
import { ScheduleItem } from '../../src/types/schedule';

// Create a mock Google Calendar client
const createMockGoogleClient = (): GoogleCalendarClient => ({
  createEvent: vi.fn().mockResolvedValue({ id: 'new-google-id-123', status: 'confirmed' }),
  updateEvent: vi.fn().mockResolvedValue({ id: 'existing-google-id-456', status: 'confirmed' }),
  deleteEvent: vi.fn().mockResolvedValue({}),
  getEvent: vi.fn().mockResolvedValue({
    id: 'google-event-id-789',
    summary: 'Test Event from Google',
    description: 'Event description from Google',
    start: { dateTime: '2023-05-15T10:00:00Z', timeZone: 'UTC' },
    end: { dateTime: '2023-05-15T11:00:00Z', timeZone: 'UTC' },
    status: 'confirmed',
  }),
  syncEvents: vi.fn().mockResolvedValue({ items: [] }),
});

describe('Calendar Service', () => {
  let mockGoogleClient: GoogleCalendarClient;
  let calendarService: ReturnType<typeof createCalendarService>;

  beforeEach(() => {
    mockGoogleClient = createMockGoogleClient();
    calendarService = createCalendarService(mockGoogleClient, {
      timeZone: 'UTC',
      defaultCalendarId: 'test-calendar',
    });

    // Clear mocks between tests
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('createOrUpdateEvent', () => {
    it('should create a new event in Google Calendar when no Google event ID exists', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-123',
        project_id: 'project-1',
        title: 'New Test Event',
        description: 'Test description',
        start_datetime: '2023-05-15T10:00:00Z',
        end_datetime: '2023-05-15T11:00:00Z',
        calendar_integration_enabled: true,
        send_invite: true,
      };

      // Act
      const result = await calendarService.createOrUpdateEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.createEvent).toHaveBeenCalledTimes(1);
      expect(mockGoogleClient.updateEvent).not.toHaveBeenCalled();
      expect(result.google_event_id).toBe('new-google-id-123');
      expect(result.invite_status).toBe('confirmed');
    });

    it('should update an existing event in Google Calendar when a Google event ID exists', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-456',
        project_id: 'project-1',
        title: 'Existing Test Event',
        description: 'Description to update',
        start_datetime: '2023-05-16T14:00:00Z',
        end_datetime: '2023-05-16T15:00:00Z',
        calendar_integration_enabled: true,
        google_event_id: 'existing-google-id-456',
      };

      // Act
      const result = await calendarService.createOrUpdateEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.updateEvent).toHaveBeenCalledTimes(1);
      expect(mockGoogleClient.createEvent).not.toHaveBeenCalled();
      expect(result.invite_status).toBe('confirmed');
    });

    it('should not sync with Google Calendar if integration is disabled', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-789',
        project_id: 'project-1',
        title: 'Non-synced Event',
        description: 'This should not sync',
        start_datetime: '2023-05-17T09:00:00Z',
        end_datetime: '2023-05-17T10:00:00Z',
        calendar_integration_enabled: false,
      };

      // Act
      const result = await calendarService.createOrUpdateEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.createEvent).not.toHaveBeenCalled();
      expect(mockGoogleClient.updateEvent).not.toHaveBeenCalled();
      expect(result).toEqual(scheduleItem);
    });

    it('should handle all-day events correctly', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-allday',
        project_id: 'project-1',
        title: 'All Day Event',
        description: 'This is an all day event',
        start_datetime: '2023-05-18T00:00:00Z',
        end_datetime: '2023-05-18T23:59:59Z',
        is_all_day: true,
        calendar_integration_enabled: true,
      };

      // Act
      await calendarService.createOrUpdateEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.createEvent).toHaveBeenCalledTimes(1);
      const calledWith = mockGoogleClient.createEvent.mock.calls[0][1];
      expect(calledWith.start.date).toBe('2023-05-18');
      expect(calledWith.end.date).toBe('2023-05-18');
      expect(calledWith.start.dateTime).toBeUndefined();
      expect(calledWith.end.dateTime).toBeUndefined();
    });

    it('should add attendees for items with assignees and send_invite set', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-with-attendee',
        project_id: 'project-1',
        title: 'Meeting with Assignee',
        description: 'This has an assignee',
        start_datetime: '2023-05-19T13:00:00Z',
        end_datetime: '2023-05-19T14:00:00Z',
        calendar_integration_enabled: true,
        assignee_id: 'employee@example.com',
        assignee_type: 'employee',
        send_invite: true,
      };

      // Act
      await calendarService.createOrUpdateEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.createEvent).toHaveBeenCalledTimes(1);
      const calledWith = mockGoogleClient.createEvent.mock.calls[0][1];
      expect(calledWith.attendees).toEqual([
        { email: 'employee@example.com', responseStatus: 'needsAction' },
      ]);
    });

    it('should throw and update last_sync_error when Google Calendar API fails', async () => {
      // Arrange
      mockGoogleClient.createEvent.mockRejectedValueOnce(new Error('API error'));

      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-error',
        project_id: 'project-1',
        title: 'Error Event',
        description: 'This will cause an error',
        start_datetime: '2023-05-20T15:00:00Z',
        end_datetime: '2023-05-20T16:00:00Z',
        calendar_integration_enabled: true,
      };

      // Act & Assert
      await expect(calendarService.createOrUpdateEvent(scheduleItem)).rejects.toThrow('API error');
      expect(scheduleItem.last_sync_error).toBe('API error');
    });
  });

  describe('handleGoogleWebhook', () => {
    it('should convert Google Calendar events to schedule items', async () => {
      // Arrange
      const webhookPayload = {
        calendarId: 'test-calendar',
        eventId: 'google-event-id-789',
        resourceState: 'exists',
      };

      // Act
      const result = await calendarService.handleGoogleWebhook(webhookPayload, 'project-1');

      // Assert
      expect(mockGoogleClient.getEvent).toHaveBeenCalledWith(
        'test-calendar',
        'google-event-id-789'
      );
      expect(result).toEqual(
        expect.objectContaining({
          project_id: 'project-1',
          title: 'Test Event from Google',
          description: 'Event description from Google',
          start_datetime: '2023-05-15T10:00:00Z',
          end_datetime: '2023-05-15T11:00:00Z',
          google_event_id: 'google-event-id-789',
          invite_status: 'confirmed',
        })
      );
    });

    it('should return null for non-exists resource states', async () => {
      // Arrange
      const webhookPayload = {
        calendarId: 'test-calendar',
        eventId: 'google-event-id-789',
        resourceState: 'deleted',
      };

      // Act
      const result = await calendarService.handleGoogleWebhook(webhookPayload, 'project-1');

      // Assert
      expect(mockGoogleClient.getEvent).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteEvent', () => {
    it('should delete an event from Google Calendar', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-to-delete',
        project_id: 'project-1',
        title: 'Event to Delete',
        description: 'This will be deleted',
        start_datetime: '2023-05-21T10:00:00Z',
        end_datetime: '2023-05-21T11:00:00Z',
        google_event_id: 'event-to-delete-id',
      };

      // Act
      const result = await calendarService.deleteEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.deleteEvent).toHaveBeenCalledWith(
        'test-calendar',
        'event-to-delete-id'
      );
      expect(result).toBe(true);
    });

    it('should return false when no Google event ID is present', async () => {
      // Arrange
      const scheduleItem: ScheduleItem = {
        id: 'schedule-item-without-google-id',
        project_id: 'project-1',
        title: 'Event without Google ID',
        description: 'This has no Google ID',
        start_datetime: '2023-05-22T10:00:00Z',
        end_datetime: '2023-05-22T11:00:00Z',
        // No google_event_id
      };

      // Act
      const result = await calendarService.deleteEvent(scheduleItem);

      // Assert
      expect(mockGoogleClient.deleteEvent).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('syncAllEvents', () => {
    it('should sync multiple events with Google Calendar', async () => {
      // Arrange
      const scheduleItems: ScheduleItem[] = [
        {
          id: 'schedule-item-1',
          project_id: 'project-1',
          title: 'Event 1',
          description: 'Description 1',
          start_datetime: '2023-05-23T10:00:00Z',
          end_datetime: '2023-05-23T11:00:00Z',
          calendar_integration_enabled: true,
        },
        {
          id: 'schedule-item-2',
          project_id: 'project-1',
          title: 'Event 2',
          description: 'Description 2',
          start_datetime: '2023-05-24T10:00:00Z',
          end_datetime: '2023-05-24T11:00:00Z',
          calendar_integration_enabled: true,
        },
        {
          id: 'schedule-item-3',
          project_id: 'project-1',
          title: 'Event 3 (no sync)',
          description: 'Description 3',
          start_datetime: '2023-05-25T10:00:00Z',
          end_datetime: '2023-05-25T11:00:00Z',
          calendar_integration_enabled: false,
        },
      ];

      // Act
      const results = await calendarService.syncAllEvents(scheduleItems);

      // Assert
      expect(mockGoogleClient.createEvent).toHaveBeenCalledTimes(2);
      expect(results.length).toBe(3);
      expect(results[0].google_event_id).toBe('new-google-id-123');
      expect(results[1].google_event_id).toBe('new-google-id-123');
      expect(results[2].google_event_id).toBeUndefined();
    });
  });

  describe('Utility functions', () => {
    describe('scheduleItemToGoogleEvent', () => {
      it('should correctly format regular and all-day events', () => {
        // Regular event
        const regularItem: ScheduleItem = {
          id: 'regular-event',
          project_id: 'project-1',
          title: 'Regular Event',
          description: 'A regular event with specific times',
          start_datetime: '2023-05-26T09:30:00Z',
          end_datetime: '2023-05-26T10:45:00Z',
        };

        const regularResult = calendarService.scheduleItemToGoogleEvent(regularItem);
        expect(regularResult.summary).toBe('Regular Event');
        expect(regularResult.start.dateTime).toBe('2023-05-26T09:30:00Z');
        expect(regularResult.end.dateTime).toBe('2023-05-26T10:45:00Z');

        // All-day event
        const allDayItem: ScheduleItem = {
          id: 'all-day-event',
          project_id: 'project-1',
          title: 'All Day Event',
          start_datetime: '2023-05-27T00:00:00Z',
          end_datetime: '2023-05-27T23:59:59Z',
          is_all_day: true,
        };

        const allDayResult = calendarService.scheduleItemToGoogleEvent(allDayItem);
        expect(allDayResult.summary).toBe('All Day Event');
        expect(allDayResult.start.date).toBe('2023-05-27');
        expect(allDayResult.end.date).toBe('2023-05-27');
      });
    });

    describe('googleEventToScheduleItem', () => {
      it('should convert Google Calendar events to schedule items', () => {
        // Google Calendar event with time
        const timeGoogleEvent = {
          id: 'time-event-id',
          summary: 'Meeting from Google',
          description: 'A meeting with time',
          start: { dateTime: '2023-05-28T14:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2023-05-28T15:00:00Z', timeZone: 'UTC' },
          status: 'confirmed',
        };

        const timeResult = calendarService.googleEventToScheduleItem(timeGoogleEvent, 'project-1');
        expect(timeResult.title).toBe('Meeting from Google');
        expect(timeResult.start_datetime).toBe('2023-05-28T14:00:00Z');
        expect(timeResult.is_all_day).toBe(false);

        // Google Calendar all-day event
        const allDayGoogleEvent = {
          id: 'all-day-id',
          summary: 'Conference from Google',
          start: { date: '2023-05-29', timeZone: 'UTC' },
          end: { date: '2023-05-30', timeZone: 'UTC' },
          status: 'confirmed',
        };

        const allDayResult = calendarService.googleEventToScheduleItem(
          allDayGoogleEvent,
          'project-1'
        );
        expect(allDayResult.title).toBe('Conference from Google');
        expect(allDayResult.is_all_day).toBe(true);
        expect(allDayResult.start_datetime).toBe('2023-05-29T00:00:00');
        expect(allDayResult.end_datetime).toBe('2023-05-30T23:59:59');
      });

      it('should handle recurrence patterns', () => {
        // Google event with recurrence
        const recurringGoogleEvent = {
          id: 'recurring-id',
          summary: 'Weekly Meeting',
          description: 'Happens every Tuesday',
          start: { dateTime: '2023-05-30T10:00:00Z', timeZone: 'UTC' },
          end: { dateTime: '2023-05-30T11:00:00Z', timeZone: 'UTC' },
          recurrence: ['RRULE:FREQ=WEEKLY;BYDAY=TU;COUNT=10'],
          status: 'confirmed',
        };

        const recurringResult = calendarService.googleEventToScheduleItem(
          recurringGoogleEvent,
          'project-1'
        );
        expect(recurringResult.recurrence).toBeDefined();
        expect(recurringResult.recurrence?.frequency).toBe('weekly');
        expect(recurringResult.recurrence?.weekDays).toEqual(['TU']);
        expect(recurringResult.recurrence?.count).toBe(10);
      });
    });
  });
});
