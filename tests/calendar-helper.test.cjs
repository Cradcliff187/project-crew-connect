/**
 * Unit Tests for the Calendar Helper Module
 */

const assert = require('assert');
const sinon = require('sinon');
const { google } = require('googleapis');
const calendarHelper = require('../server/google-api-helpers/calendar-helper');
const { calendar, mockAuthClient, resetMockData } = require('./mocks/google-calendar-mock.cjs');

describe('Calendar Helper Unit Tests', function () {
  // Use sinon to stub the google.calendar method
  let calendarStub;

  beforeEach(function () {
    // Stub google.calendar to use our mock implementation
    calendarStub = sinon.stub(google, 'calendar').callsFake(calendar);
    // Reset mock data between tests
    resetMockData();
  });

  afterEach(function () {
    // Restore stubs
    sinon.restore();
  });

  describe('listEvents', function () {
    it('should list events from the calendar', async function () {
      const result = await calendarHelper.listEvents(mockAuthClient, {
        calendarId: 'primary',
        maxResults: 1,
      });

      assert.strictEqual(result.items.length, 1);
      assert.strictEqual(result.items[0].summary, 'Test Event 1');
    });
  });

  describe('createEvent', function () {
    it('should create a new event in the calendar', async function () {
      const eventData = {
        title: 'New Test Event',
        description: 'New Test Description',
        startTime: '2025-05-26T10:00:00Z',
        endTime: '2025-05-26T11:00:00Z',
        location: 'New Location',
        entityType: 'test_entity',
        entityId: 'entity123',
        targetCalendarId: 'primary',
      };

      const result = await calendarHelper.createEvent(mockAuthClient, eventData);

      assert.ok(result.id, 'Event ID should be defined');
      assert.strictEqual(result.summary, 'New Test Event');
      assert.strictEqual(result.description, 'New Test Description');
    });

    it('should calculate end time if not provided', async function () {
      const eventData = {
        title: 'Event without End Time',
        startTime: '2025-05-26T10:00:00Z',
        targetCalendarId: 'primary',
      };

      const result = await calendarHelper.createEvent(mockAuthClient, eventData);

      assert.ok(result.id, 'Event ID should be defined');
      assert.strictEqual(result.summary, 'Event without End Time');

      // Check that end time is after start time
      const startTime = new Date(result.start.dateTime);
      const endTime = new Date(result.end.dateTime);
      assert.ok(endTime > startTime, 'End time should be after start time');
    });
  });

  describe('updateEvent', function () {
    it('should update an existing event in the calendar', async function () {
      const eventData = {
        title: 'Updated Test Event',
        description: 'Updated Test Description',
      };

      const result = await calendarHelper.updateEvent(
        mockAuthClient,
        'event1', // This ID exists in our mock data
        eventData,
        'primary'
      );

      assert.strictEqual(result.id, 'event1');
      assert.strictEqual(result.summary, 'Updated Test Event');
      assert.strictEqual(result.description, 'Updated Test Description');
    });
  });

  describe('deleteEvent', function () {
    it('should delete an event from the calendar', async function () {
      await calendarHelper.deleteEvent(mockAuthClient, 'event1', 'primary');

      // Attempting to get the deleted event should throw an error
      try {
        await calendarHelper.getEvent(mockAuthClient, 'event1', 'primary');
        assert.fail('Expected an error when getting deleted event');
      } catch (error) {
        assert.strictEqual(error.code, 404);
      }
    });
  });

  describe('getEvent', function () {
    it('should get a single event by ID', async function () {
      const result = await calendarHelper.getEvent(mockAuthClient, 'event1', 'primary');

      assert.strictEqual(result.id, 'event1');
      assert.strictEqual(result.summary, 'Test Event 1');
    });
  });

  describe('syncScheduleItemWithCalendar', function () {
    it('should update an existing event if google_event_id exists', async function () {
      const scheduleItem = {
        id: 'item1',
        title: 'Schedule Item 1',
        description: 'Item Description',
        start_datetime: '2025-05-25T10:00:00Z',
        end_datetime: '2025-05-25T11:00:00Z',
        google_event_id: 'event1',
      };

      const result = await calendarHelper.syncScheduleItemWithCalendar(
        mockAuthClient,
        scheduleItem,
        'primary'
      );

      assert.strictEqual(result.action, 'updated');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.event.id, 'event1');
    });

    it('should create a new event if google_event_id does not exist', async function () {
      const scheduleItem = {
        id: 'item2',
        title: 'Schedule Item 2',
        description: 'Item Description',
        start_datetime: '2025-05-26T10:00:00Z',
        end_datetime: '2025-05-26T11:00:00Z',
        // No google_event_id
      };

      const result = await calendarHelper.syncScheduleItemWithCalendar(
        mockAuthClient,
        scheduleItem,
        'primary'
      );

      assert.strictEqual(result.action, 'created');
      assert.strictEqual(result.success, true);
      assert.ok(result.event.id, 'Event ID should be defined');
      assert.strictEqual(result.event.summary, 'Schedule Item 2');
    });
  });
});
