/**
 * Google Calendar Webhook Handler
 *
 * This edge function handles incoming webhook notifications from Google Calendar
 * and triggers synchronization for calendar events.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.22.0';

// CORS headers for preflight requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define a type for the environment
type Env = {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
};

Deno.serve(async req => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get Supabase environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Verify Supabase configuration
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables');
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    // Initialize Supabase client with service role for admin access
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract Google Calendar webhook headers
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceId = req.headers.get('x-goog-resource-id');
    const resourceState = req.headers.get('x-goog-resource-state');
    const resourceUri = req.headers.get('x-goog-resource-uri');
    const messageNumber = req.headers.get('x-goog-message-number');

    console.log('Calendar webhook received:', {
      channelId,
      resourceId,
      resourceState,
      resourceUri,
      messageNumber,
    });

    // Validate required headers
    if (!channelId || !resourceId || !resourceState) {
      return new Response(JSON.stringify({ error: 'Missing required webhook headers' }), {
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
      return new Response(JSON.stringify({ error: 'Channel not recognized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to avoid Google retrying
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
        status: 200, // Return 200 to avoid Google retrying
      });
    }

    // For 'sync' resource state, just acknowledge
    if (resourceState === 'sync') {
      return new Response(JSON.stringify({ status: 'sync acknowledged' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For 'exists' or 'not_exists' states, trigger calendar sync
    if (resourceState === 'exists' || resourceState === 'not_exists') {
      // Call the sync_calendar_changes RPC function
      const { data: syncData, error: syncError } = await supabase.rpc('sync_calendar_changes', {
        p_calendar_id: calendarId,
      });

      if (syncError) {
        console.error('Error in calendar sync:', syncError);
      } else {
        console.log('Calendar sync triggered successfully:', syncData);
      }

      return new Response(JSON.stringify({ status: 'processing', calendar_id: calendarId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // For unrecognized states, log but return success
    console.warn('Unrecognized resource state:', resourceState);
    return new Response(JSON.stringify({ status: 'acknowledged' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Log the error but return 200 to stop Google from retrying
    console.error('Error processing calendar webhook:', error);
    return new Response(JSON.stringify({ error: 'Internal processing error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
});
