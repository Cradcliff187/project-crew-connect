// Use global fetch in Node.js 18+

async function manualUpdate() {
  try {
    // Supabase credentials
    const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
    const supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';

    // First get a draft estimate
    console.log('Finding a draft estimate...');
    const findResponse = await fetch(
      `${supabaseUrl}/rest/v1/estimates?select=estimateid&status=eq.draft&projectid=is.null&limit=1`,
      {
        method: 'GET',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
      }
    );

    if (!findResponse.ok) {
      console.error('Error finding estimate:', await findResponse.text());
      return;
    }

    const estimates = await findResponse.json();
    if (!estimates || estimates.length === 0) {
      console.log('No draft estimates found');
      return;
    }

    const estimateId = estimates[0].estimateid;
    console.log(`Found draft estimate: ${estimateId}`);

    // Try updating the status directly
    console.log('\nAttempting to update status to approved...');
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/estimates?estimateid=eq.${estimateId}`,
      {
        method: 'PATCH',
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({ status: 'approved' }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error(`❌ Update failed: ${errorText}`);

      // Try a simpler approach - let's try 'sent' instead of 'approved'
      console.log('\nTrying with sent status instead...');
      const sentResponse = await fetch(
        `${supabaseUrl}/rest/v1/estimates?estimateid=eq.${estimateId}`,
        {
          method: 'PATCH',
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify({ status: 'sent' }),
        }
      );

      if (!sentResponse.ok) {
        console.error(`❌ Sent update failed too: ${await sentResponse.text()}`);
      } else {
        console.log('✅ Sent update successful!');
      }
    } else {
      console.log('✅ Update successful!');
      const updated = await updateResponse.json();
      console.log('Updated record:', updated);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

manualUpdate();
