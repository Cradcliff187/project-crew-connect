import fetch from 'node-fetch';

const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

async function alterTable() {
  try {
    // Direct API call to management API
    console.log('Executing ALTER TABLE statement through management API...');

    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        ApiKey: supabaseKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          ALTER TABLE public.time_entries
          ADD COLUMN IF NOT EXISTS calendar_sync_enabled BOOLEAN DEFAULT FALSE,
          ADD COLUMN IF NOT EXISTS calendar_event_id TEXT;
        `,
      }),
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status} - ${await response.text()}`);
    }

    console.log('Successfully executed ALTER TABLE statement!');

    // Verify the changes
    console.log('\nVerifying time_entries columns...');

    const verifyResponse = await fetch(`${supabaseUrl}/rest/v1/time_entries?select=id&limit=1`, {
      headers: {
        Authorization: `Bearer ${supabaseKey}`,
        ApiKey: supabaseKey,
      },
    });

    if (!verifyResponse.ok) {
      throw new Error(
        `Verification failed: ${verifyResponse.status} - ${await verifyResponse.text()}`
      );
    }

    console.log(
      'Verification successful. You may now check the table structure with check_calendar_schema.js'
    );
  } catch (error) {
    console.error('Error:', error.message);
  }
}

alterTable();
