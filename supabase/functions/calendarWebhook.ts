/**
 * Google Calendar Webhook Handler
 *
 * This function handles incoming webhook notifications from Google Calendar
 * and triggers synchronization of changes.
 *
 * TODO for GCP deployment:
 * - Configure Cloud Function with HTTP trigger
 * - Set appropriate IAM permissions for Calendar API access
 * - Configure secrets for API keys and credentials
 * - Set up proper CORS configuration
 */

import { createClient } from '@supabase/supabase-js';
import { corsHeaders } from './_shared/cors';

// Environment variables from Supabase Secrets
// For Deno environment in Supabase Edge Functions, we use process.env
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Initialize Supabase client with service role for admin access
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Channel headers to validate
const GOOGLE_CHANNEL_ID = 'x-goog-channel-id';
const GOOGLE_RESOURCE_ID = 'x-goog-resource-id';
const GOOGLE_RESOURCE_STATE = 'x-goog-resource-state';
const GOOGLE_RESOURCE_URI = 'x-goog-resource-uri';
const GOOGLE_MESSAGE_NUMBER = 'x-goog-message-number';

export const handler = async (req: Request): Promise<Response> => {
  // CORS preflight handling
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Only accept POST requests from Google Calendar
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    // Extract and validate Google Calendar webhook headers
    const channelId = req.headers.get(GOOGLE_CHANNEL_ID);
    const resourceId = req.headers.get(GOOGLE_RESOURCE_ID);
    const resourceState = req.headers.get(GOOGLE_RESOURCE_STATE);
    const resourceUri = req.headers.get(GOOGLE_RESOURCE_URI);
    const messageNumber = req.headers.get(GOOGLE_MESSAGE_NUMBER);

    // Log the incoming webhook for monitoring
    console.log('Calendar webhook received:', {
      channelId,
      resourceId,
      resourceState,
      messageNumber,
    });

    // Validate required headers are present
    if (!channelId || !resourceId || !resourceState) {
      return new Response(JSON.stringify({ error: 'Missing required headers' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Verify this is a registered channel in our database
    const { data: channelData, error: channelError } = await supabase
      .from('push_notification_channels')
      .select('calendar_id')
      .eq('id', channelId)
      .eq('resource_id', resourceId)
      .single();

    if (channelError || !channelData) {
      console.error('Channel validation failed:', channelError);
      // We still return 200 to avoid Google retrying, but log the error
      return new Response(JSON.stringify({ error: 'Channel not recognized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 for unrecognized channels
      });
    }

    // Extract calendar ID from the resource URI or from our database
    let calendarId = channelData.calendar_id;
    if (!calendarId && resourceUri) {
      // Extract from URI - format is usually /calendars/{calendarId}/events
      const matches = resourceUri.match(/\/calendars\/([^\/]+)/);
      if (matches && matches[1]) {
        calendarId = decodeURIComponent(matches[1]);
      }
    }

    if (!calendarId) {
      console.error('Could not determine calendar ID');
      return new Response(JSON.stringify({ error: 'Could not determine calendar ID' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Still return 200 to avoid Google retrying
      });
    }

    // For 'sync' resource state, initiate the synchronization
    if (resourceState === 'sync') {
      // This is just a sync verification message, no action needed
      return new Response(JSON.stringify({ status: 'sync acknowledged' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For 'exists' or 'not_exists' states, trigger calendar sync
    if (resourceState === 'exists' || resourceState === 'not_exists') {
      // Queue the sync operation as a background task
      // This lets us return a quick 200 response while the sync happens asynchronously
      triggerCalendarSync(calendarId).catch(error =>
        console.error('Error triggering calendar sync:', error)
      );

      // Return success immediately
      return new Response(JSON.stringify({ status: 'processing' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For unrecognized states, log but still return success
    console.warn('Unrecognized resource state:', resourceState);
    return new Response(JSON.stringify({ status: 'acknowledged' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Log the error but still return 200 to stop Google from retrying
    console.error('Error processing calendar webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // Still return 200 even for errors to avoid Google retrying
    });
  }
};

/**
 * Trigger calendar synchronization for the specified calendar
 * @param calendarId The Google Calendar ID to sync
 */
async function triggerCalendarSync(calendarId: string): Promise<void> {
  try {
    // Call the syncDownChanges RPC function in Supabase
    const { data, error } = await supabase.rpc('sync_calendar_changes', {
      p_calendar_id: calendarId,
    });

    if (error) {
      throw error;
    }

    console.log('Calendar sync triggered successfully:', data);
  } catch (error) {
    console.error('Error in calendar sync:', error);
    // Log to a monitoring system in production
  }
}

// Export for Edge Functions
export default handler;
