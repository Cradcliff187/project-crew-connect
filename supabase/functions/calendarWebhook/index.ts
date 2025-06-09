import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-goog-channel-token, x-goog-channel-id, x-goog-resource-id',
};

serve(async req => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify webhook token
    const token = req.headers.get('x-goog-channel-token');
    const expectedToken = Deno.env.get('WEBHOOK_TOKEN');

    if (token !== expectedToken) {
      console.error('Invalid webhook token');
      return new Response('Unauthorized', { status: 401, headers: corsHeaders });
    }

    // Parse Google Calendar webhook headers
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceId = req.headers.get('x-goog-resource-id');
    const resourceState = req.headers.get('x-goog-resource-state');
    const resourceUri = req.headers.get('x-goog-resource-uri');

    console.log('Webhook received:', {
      channelId,
      resourceId,
      resourceState,
      resourceUri,
    });

    // Handle sync notification
    if (resourceState === 'sync') {
      console.log('Sync notification received - webhook registered successfully');
      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Extract calendar and event IDs from resourceUri
    // Format: https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events/{eventId}
    const uriMatch = resourceUri?.match(/calendars\/([^\/]+)\/events\/([^\/\?]+)/);
    if (!uriMatch) {
      console.error('Could not parse resource URI:', resourceUri);
      return new Response('Invalid resource URI', { status: 400, headers: corsHeaders });
    }

    const [, calendarId, eventId] = uriMatch;
    console.log('Calendar ID:', calendarId);
    console.log('Event ID:', eventId);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Initialize Google Calendar API with service account
    const serviceAccountKey = JSON.parse(Deno.env.get('GOOGLE_SERVICE_ACCOUNT_KEY') || '{}');

    if (!serviceAccountKey.client_email) {
      console.error('Service account key not configured');
      return new Response('Server configuration error', { status: 500, headers: corsHeaders });
    }

    // Handle different resource states
    switch (resourceState) {
      case 'exists':
        // Event was created or updated
        await handleEventUpdate(supabase, calendarId, eventId, serviceAccountKey);
        break;

      case 'not_exists':
        // Event was deleted
        await handleEventDeletion(supabase, eventId);
        break;

      default:
        console.log('Unknown resource state:', resourceState);
    }

    return new Response('OK', { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Internal error', { status: 500, headers: corsHeaders });
  }
});

async function handleEventUpdate(
  supabase: any,
  calendarId: string,
  eventId: string,
  serviceAccountKey: any
) {
  console.log('Handling event update/creation');

  // Fetch event details from Google Calendar
  const event = await fetchGoogleCalendarEvent(calendarId, eventId, serviceAccountKey);

  if (!event) {
    console.error('Could not fetch event from Google Calendar');
    return;
  }

  // Check if this event already exists in our database
  const { data: existingItems, error: fetchError } = await supabase
    .from('schedule_items')
    .select('*')
    .eq('google_event_id', eventId);

  if (fetchError) {
    console.error('Error fetching existing items:', fetchError);
    return;
  }

  const scheduleData = {
    title: event.summary || 'Untitled Event',
    description: event.description || '',
    start_datetime: event.start?.dateTime || event.start?.date,
    end_datetime: event.end?.dateTime || event.end?.date,
    location: event.location || null,
    calendar_id: calendarId,
    google_event_id: eventId,
    last_synced_at: new Date().toISOString(),
    calendar_integration_enabled: true,
  };

  if (existingItems && existingItems.length > 0) {
    // Update existing schedule item
    console.log('Updating existing schedule item:', existingItems[0].id);

    const { error: updateError } = await supabase
      .from('schedule_items')
      .update(scheduleData)
      .eq('id', existingItems[0].id);

    if (updateError) {
      console.error('Error updating schedule item:', updateError);
    } else {
      console.log('Schedule item updated successfully');
    }
  } else {
    // Create new schedule item (event created directly in Google Calendar)
    console.log('Creating new schedule item from Google Calendar event');

    // Determine project ID based on calendar
    const projectId = await determineProjectFromCalendar(supabase, calendarId);

    const { error: insertError } = await supabase.from('schedule_items').insert({
      ...scheduleData,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error('Error inserting schedule item:', insertError);
    } else {
      console.log('Schedule item created successfully');
    }
  }
}

async function handleEventDeletion(supabase: any, eventId: string) {
  console.log('Handling event deletion');

  const { error } = await supabase.from('schedule_items').delete().eq('google_event_id', eventId);

  if (error) {
    console.error('Error deleting schedule item:', error);
  } else {
    console.log('Schedule item deleted successfully');
  }
}

async function fetchGoogleCalendarEvent(
  calendarId: string,
  eventId: string,
  serviceAccountKey: any
) {
  try {
    // Get access token using service account
    const token = await getServiceAccountToken(serviceAccountKey);

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch event:', response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching Google Calendar event:', error);
    return null;
  }
}

async function getServiceAccountToken(serviceAccountKey: any) {
  // Create JWT for service account authentication
  const header = {
    alg: 'RS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: serviceAccountKey.client_email,
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Note: In production, you'd need to properly sign this JWT with the service account's private key
  // For now, this is a placeholder - you'd need to implement proper JWT signing
  // Consider using a library like jose or jsonwebtoken

  // This is a simplified version - in production, implement proper JWT signing
  throw new Error('JWT signing not implemented - use Google Auth Library');
}

async function determineProjectFromCalendar(supabase: any, calendarId: string): Promise<string> {
  // If it's the shared projects calendar, we need additional logic to determine the project
  // This might require looking at the event description or other metadata

  // For now, return a default project ID
  // In production, implement proper project detection logic
  console.log('Determining project for calendar:', calendarId);

  // You might want to create a "General" project for events created directly in Google Calendar
  const { data: projects } = await supabase
    .from('projects')
    .select('projectid')
    .eq('projectname', 'General')
    .single();

  return projects?.projectid || 'default-project-id';
}
