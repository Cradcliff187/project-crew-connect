/**
 * Unit Tests for the Calendar Helper Module
 */

const assert = require('assert');
const sinon = require('sinon');
const calendarHelper = require('../server/google-api-helpers/calendar-helper');

describe('Calendar Helper Unit Tests', function () {
  // Mock Google Calendar API client
  let mockCalendar;
  let mockAuthClient;
  let getCalendarClientStub;

  beforeEach(function () {
    // Create mock functions for the Google Calendar API
    mockCalendar = {
      events: {
        list: sinon.stub().resolves({
          data: {
            items: [
              {
                id: 'event1',
                summary: 'Test Event 1',
                start: { dateTime: '2025-05-25T10:00:00Z' },
                end: { dateTime: '2025-05-25T11:00:00Z' },
              },
            ],
          },
        }),
        get: sinon.stub().resolves({
          data: {
            id: 'event1',
            summary: 'Test Event 1',
            description: 'Test Description',
            start: { dateTime: '2025-05-25T10:00:00Z', timeZone: 'America/New_York' },
            end: { dateTime: '2025-05-25T11:00:00Z', timeZone: 'America/New_York' },
            location: 'Test Location',
          },
        }),
        insert: sinon.stub().resolves({
          data: {
            id: 'newEvent1',
            summary: 'New Test Event',
            description: 'New Test Description',
            start: { dateTime: '2025-05-26T10:00:00Z' },
            end: { dateTime: '2025-05-26T11:00:00Z' },
          },
        }),
        update: sinon.stub().resolves({
          data: {
            id: 'event1',
            summary: 'Updated Test Event',
            description: 'Updated Test Description',
            start: { dateTime: '2025-05-25T10:00:00Z' },
            end: { dateTime: '2025-05-25T11:00:00Z' },
          },
        }),
        delete: sinon.stub().resolves({}),
      },
    };

    // Create a mock auth client (can be any object)
    mockAuthClient = {};

    // Stub the getCalendarClient function to return our mock
    getCalendarClientStub = sinon.stub(calendarHelper, 'getCalendarClient').returns(mockCalendar);
  });

  afterEach(function () {
    // Restore the stubbed function
    getCalendarClientStub.restore();
  });

  describe('listEvents', function () {
    it('should list events from the calendar', async function () {
      const result = await calendarHelper.listEvents(mockAuthClient, {
        calendarId: 'primary',
        maxResults: 10,
      });

      assert.strictEqual(result.items.length, 1);
      assert.strictEqual(result.items[0].summary, 'Test Event 1');

      // Verify the calendar client was created with the auth client
      sinon.assert.calledOnce(getCalendarClientStub);
      sinon.assert.calledWith(getCalendarClientStub, mockAuthClient);

      // Verify events.list was called with the expected parameters
      sinon.assert.calledOnce(mockCalendar.events.list);
      const callArgs = mockCalendar.events.list.getCall(0).args[0];
      assert.strictEqual(callArgs.calendarId, 'primary');
      assert.strictEqual(callArgs.maxResults, 10);
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

      assert.strictEqual(result.id, 'newEvent1');
      assert.strictEqual(result.summary, 'New Test Event');

      // Verify events.insert was called with the expected parameters
      sinon.assert.calledOnce(mockCalendar.events.insert);
      const callArgs = mockCalendar.events.insert.getCall(0).args[0];
      assert.strictEqual(callArgs.calendarId, 'primary');

      // Check that the event resource has the expected properties
      const resource = callArgs.resource;
      assert.strictEqual(resource.summary, 'New Test Event');
      assert.strictEqual(resource.description, 'New Test Description');
      assert.strictEqual(resource.extendedProperties.private.entityType, 'test_entity');
      assert.strictEqual(resource.extendedProperties.private.entityId, 'entity123');
    });

    it('should calculate end time if not provided', async function () {
      const eventData = {
        title: 'Event without End Time',
        startTime: '2025-05-26T10:00:00Z',
        targetCalendarId: 'primary',
      };

      await calendarHelper.createEvent(mockAuthClient, eventData);

      sinon.assert.calledOnce(mockCalendar.events.insert);
      const resource = mockCalendar.events.insert.getCall(0).args[0].resource;

      // Start time should be the provided time
      assert.strictEqual(resource.start.dateTime, new Date('2025-05-26T10:00:00Z').toISOString());

      // End time should be 1 hour later
      const expectedEnd = new Date('2025-05-26T11:00:00Z').toISOString();
      assert.strictEqual(resource.end.dateTime, expectedEnd);
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
        'event1',
        eventData,
        'primary'
      );

      assert.strictEqual(result.id, 'event1');
      assert.strictEqual(result.summary, 'Updated Test Event');

      // Verify events.get and events.update were called
      sinon.assert.calledOnce(mockCalendar.events.get);
      sinon.assert.calledOnce(mockCalendar.events.update);

      // Verify the get request used the right parameters
      const getArgs = mockCalendar.events.get.getCall(0).args[0];
      assert.strictEqual(getArgs.calendarId, 'primary');
      assert.strictEqual(getArgs.eventId, 'event1');

      // Verify the update request used the right parameters
      const updateArgs = mockCalendar.events.update.getCall(0).args[0];
      assert.strictEqual(updateArgs.calendarId, 'primary');
      assert.strictEqual(updateArgs.eventId, 'event1');
      assert.strictEqual(updateArgs.resource.summary, 'Updated Test Event');
      assert.strictEqual(updateArgs.resource.description, 'Updated Test Description');
    });
  });

  describe('deleteEvent', function () {
    it('should delete an event from the calendar', async function () {
      await calendarHelper.deleteEvent(mockAuthClient, 'event1', 'primary');

      // Verify events.delete was called with the expected parameters
      sinon.assert.calledOnce(mockCalendar.events.delete);
      const callArgs = mockCalendar.events.delete.getCall(0).args[0];
      assert.strictEqual(callArgs.calendarId, 'primary');
      assert.strictEqual(callArgs.eventId, 'event1');
    });
  });

  describe('getEvent', function () {
    it('should get a single event by ID', async function () {
      const result = await calendarHelper.getEvent(mockAuthClient, 'event1', 'primary');

      assert.strictEqual(result.id, 'event1');
      assert.strictEqual(result.summary, 'Test Event 1');

      // Verify events.get was called with the expected parameters
      sinon.assert.calledOnce(mockCalendar.events.get);
      const callArgs = mockCalendar.events.get.getCall(0).args[0];
      assert.strictEqual(callArgs.calendarId, 'primary');
      assert.strictEqual(callArgs.eventId, 'event1');
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

      // Verify we called the update method
      sinon.assert.notCalled(mockCalendar.events.insert);
      sinon.assert.calledOnce(mockCalendar.events.update);
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
      assert.strictEqual(result.event.id, 'newEvent1');

      // Verify we called the insert method
      sinon.assert.calledOnce(mockCalendar.events.insert);
      sinon.assert.notCalled(mockCalendar.events.update);
    });
  });
});
