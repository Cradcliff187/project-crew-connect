import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function directUpdate() {
  try {
    // Find a draft estimate
    console.log('Looking for a draft estimate...');
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .eq('status', 'draft')
      .is('projectid', null)
      .limit(1);

    if (estError) {
      console.error('Error finding estimates:', estError.message);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No draft estimates found');
      return;
    }

    const estimateId = estimates[0].estimateid;
    console.log(`Found draft estimate: ${estimateId}`);

    // Try to update directly
    console.log('\nAttempting status update to approved directly...');
    const { error: updateError } = await supabase
      .from('estimates')
      .update({ status: 'approved' })
      .eq('estimateid', estimateId);

    if (updateError) {
      console.error(`❌ UPDATE FAILED: ${updateError.message}`);
    } else {
      console.log('✅ UPDATE SUCCESSFUL!');
    }

    // Verify the current status
    console.log('\nVerifying current status...');
    const { data: current, error: currentError } = await supabase
      .from('estimates')
      .select('status')
      .eq('estimateid', estimateId)
      .single();

    if (currentError) {
      console.error('Error checking current status:', currentError.message);
    } else {
      console.log(`Current status: ${current.status}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

directUpdate();
