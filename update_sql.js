// Add calendar fields to time_entries using fetch API
import fetch from 'node-fetch';

const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const apiKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

async function updateSchema() {
  try {
    // Get metadata about the time_entries table
    console.log('Getting table metadata...');

    const response = await fetch(`${supabaseUrl}/rest/v1/time_entries?select=id&limit=1`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        apikey: apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get metadata: ${await response.text()}`);
    }

    console.log('Successfully connected to time_entries table');
    console.log('Please execute the following SQL through the Supabase dashboard:');
    console.log(`
    ALTER TABLE public.time_entries
    ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
    `);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

updateSchema();
