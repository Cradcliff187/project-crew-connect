import express from 'express';
import { createCalendarService } from '../../../src/services/calendarService';
import { supabase } from '../../../src/integrations/supabase/client';

const router = express.Router();

// Configure Google Calendar client (implementation would depend on your actual Google API setup)
const googleCalendarClient = {
  createEvent: async (calendarId: string, event: any) => {
    // Implementation would use the Google Calendar API
    console.log(`Creating event in calendar ${calendarId}`, event);
    return { id: 'new-google-id', status: 'confirmed' };
  },
  updateEvent: async (calendarId: string, eventId: string, event: any) => {
    // Implementation would use the Google Calendar API
    console.log(`Updating event ${eventId} in calendar ${calendarId}`, event);
    return { id: eventId, status: 'confirmed' };
  },
  deleteEvent: async (calendarId: string, eventId: string) => {
    // Implementation would use the Google Calendar API
    console.log(`Deleting event ${eventId} from calendar ${calendarId}`);
    return {};
  },
  getEvent: async (calendarId: string, eventId: string) => {
    // Implementation would use the Google Calendar API
    console.log(`Getting event ${eventId} from calendar ${calendarId}`);

    // For demonstration, returns a mock event
    return {
      id: eventId,
      summary: 'Event from Google',
      description: 'This event was updated in Google Calendar',
      start: { dateTime: new Date().toISOString() },
      end: { dateTime: new Date(Date.now() + 3600000).toISOString() },
      status: 'confirmed',
    };
  },
  syncEvents: async (calendarId: string, syncToken?: string) => {
    // Implementation would use the Google Calendar API
    console.log(`Syncing events for calendar ${calendarId} with token ${syncToken}`);
    return { items: [] };
  },
};

// Create calendar service with the Google client
const calendarService = createCalendarService(googleCalendarClient, {
  timeZone: 'America/New_York',
});

/**
 * Google Calendar Webhook Handler
 * Receives notifications when events are changed in Google Calendar
 */
router.post('/', async (req, res) => {
  try {
    console.log('Received webhook from Google Calendar', req.body);

    // Validate the request
    if (!req.body || !req.body.calendarId || !req.body.eventId) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    const { calendarId, eventId, projectId, resourceState } = req.body;

    // If resource was deleted, find and update the corresponding schedule item
    if (resourceState === 'deleted') {
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .update({
          google_event_id: null,
          calendar_integration_enabled: false,
          last_sync_error: 'Event deleted in Google Calendar',
        })
        .eq('google_event_id', eventId)
        .select();

      if (error) {
        console.error('Error updating schedule item after Google Calendar deletion:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      return res.status(200).json({ status: 'deleted', affected_items: data?.length || 0 });
    }

    // For updated events, we need to find the associated project
    if (!projectId) {
      // Try to find the project ID from existing schedule items
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .select('project_id')
        .eq('google_event_id', eventId)
        .single();

      if (error || !data) {
        console.error('Cannot determine project ID for Google Calendar event:', eventId);
        return res.status(400).json({ error: 'Project ID required for new events' });
      }

      req.body.projectId = data.project_id;
    }

    // Process the event update using the calendar service
    const updatedScheduleItem = await calendarService.handleGoogleWebhook(
      req.body,
      req.body.projectId
    );

    if (!updatedScheduleItem) {
      return res.status(200).json({ status: 'no_action_needed' });
    }

    // Check if we need to update an existing item or create a new one
    const { data: existingItem, error: findError } = await (supabase as any)
      .from('schedule_items')
      .select('*')
      .eq('google_event_id', eventId)
      .single();

    let result;

    if (findError || !existingItem) {
      // Create new schedule item
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .insert({
          ...updatedScheduleItem,
          calendar_integration_enabled: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating schedule item from Google Calendar event:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      result = { status: 'created', data };
    } else {
      // Update existing schedule item
      const { data, error } = await (supabase as any)
        .from('schedule_items')
        .update({
          ...updatedScheduleItem,
          calendar_integration_enabled: true,
          last_sync_error: null,
        })
        .eq('id', existingItem.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating schedule item from Google Calendar event:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      result = { status: 'updated', data };
    }

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Error processing Google Calendar webhook:', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Route for testing Google Calendar integration
router.get('/test', async (req, res) => {
  try {
    const calendarId = (req.query.calendarId as string) || 'primary';
    const eventId = req.query.eventId as string;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID required' });
    }

    // Fetch the event from Google Calendar
    const event = await googleCalendarClient.getEvent(calendarId, eventId);

    return res.status(200).json(event);
  } catch (error: any) {
    console.error('Error testing Google Calendar integration:', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

export default router;
