/**
 * Simplified Calendar Helper Tests
 * This tests the basic functionality of the Google Calendar API with our mocking approach
 */

const assert = require('assert');
const sinon = require('sinon');
const { google } = require('googleapis');
const { calendar, mockAuthClient, resetMockData } = require('./mocks/google-calendar-mock.cjs');

describe('Basic Calendar API Tests', function () {
  // Use sinon to stub the google.calendar method
  let calendarStub;
  let calendarApi;

  beforeEach(function () {
    // Stub google.calendar to use our mock implementation
    calendarStub = sinon.stub(google, 'calendar').callsFake(calendar);
    // Get a calendar instance using our mock
    calendarApi = google.calendar({ version: 'v3', auth: mockAuthClient });
    // Reset mock data between tests
    resetMockData();
  });

  afterEach(function () {
    // Restore stubs
    sinon.restore();
  });

  it('should list events from the calendar', async function () {
    const response = await calendarApi.events.list({
      calendarId: 'primary',
      maxResults: 1,
    });

    assert.ok(response.data, 'Response data should exist');
    assert.ok(Array.isArray(response.data.items), 'Items should be an array');
    assert.strictEqual(response.data.items.length, 1);
    assert.strictEqual(response.data.items[0].summary, 'Test Event 1');
  });

  it('should get a single event', async function () {
    const response = await calendarApi.events.get({
      calendarId: 'primary',
      eventId: 'event1',
    });

    assert.ok(response.data, 'Response data should exist');
    assert.strictEqual(response.data.id, 'event1');
    assert.strictEqual(response.data.summary, 'Test Event 1');
  });

  it('should create a new event', async function () {
    const eventData = {
      summary: 'New Test Event',
      description: 'New Test Description',
      start: {
        dateTime: '2025-05-26T10:00:00Z',
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: '2025-05-26T11:00:00Z',
        timeZone: 'America/New_York',
      },
    };

    const response = await calendarApi.events.insert({
      calendarId: 'primary',
      resource: eventData,
    });

    assert.ok(response.data, 'Response data should exist');
    assert.ok(response.data.id, 'Event ID should be defined');
    assert.strictEqual(response.data.summary, 'New Test Event');
  });

  it('should update an existing event', async function () {
    const eventData = {
      summary: 'Updated Test Event',
      description: 'Updated Test Description',
    };

    const response = await calendarApi.events.update({
      calendarId: 'primary',
      eventId: 'event1',
      resource: eventData,
    });

    assert.ok(response.data, 'Response data should exist');
    assert.strictEqual(response.data.id, 'event1');
    assert.strictEqual(response.data.summary, 'Updated Test Event');
  });

  it('should delete an event', async function () {
    await calendarApi.events.delete({
      calendarId: 'primary',
      eventId: 'event1',
    });

    // Trying to get the deleted event should throw an error
    try {
      await calendarApi.events.get({
        calendarId: 'primary',
        eventId: 'event1',
      });
      assert.fail('Expected an error when getting deleted event');
    } catch (error) {
      assert.strictEqual(error.code, 404);
    }
  });
});
