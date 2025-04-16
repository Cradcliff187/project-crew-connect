import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkValidTransitions() {
  try {
    // First check the database function definition - may contain validation logic
    console.log('Getting function definition...');

    const { data: functionDef, error: functionError } = await supabase
      .from('pg_catalog.pg_proc')
      .select('proname, prosrc')
      .ilike('proname', '%validate_estimate_status%')
      .limit(1);

    if (functionError) {
      console.error('Error getting function definition:', functionError);
    } else if (functionDef && functionDef.length > 0) {
      console.log('Found validation function:');
      console.log(functionDef[0].proname);
      console.log('Function source:');
      console.log(functionDef[0].prosrc);
    } else {
      console.log('Validation function not found. Trying with function list...');

      // Get list of all functions
      const { data: allFunctions, error: listError } = await supabase
        .from('pg_catalog.pg_proc')
        .select('proname')
        .eq('pronamespace', 'public')
        .limit(50);

      if (listError) {
        console.error('Error listing functions:', listError);
      } else {
        console.log('Available functions:');
        console.log(allFunctions?.map(f => f.proname).join(', '));
      }
    }

    // Try to test transitions directly
    console.log('\nTesting allowed transitions from different statuses...');

    // Get a draft estimate
    const { data: draftEstimate, error: draftError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .eq('status', 'draft')
      .limit(1);

    if (draftError) {
      console.error('Error finding draft estimate:', draftError);
    } else if (draftEstimate && draftEstimate.length > 0) {
      console.log(`\nFound draft estimate: ${draftEstimate[0].estimateid}`);

      // Try different transitions to see which ones work
      const transitions = ['pending', 'sent', 'approved', 'rejected', 'converted'];

      for (const newStatus of transitions) {
        console.log(`Testing transition from draft to ${newStatus}...`);

        const { error } = await supabase
          .from('estimates')
          .update({ status: newStatus })
          .eq('estimateid', draftEstimate[0].estimateid)
          .eq('status', 'draft');

        if (error) {
          console.log(`❌ Draft → ${newStatus}: INVALID (${error.message})`);
        } else {
          console.log(`✅ Draft → ${newStatus}: VALID`);

          // Revert back to draft for the next test
          await supabase
            .from('estimates')
            .update({ status: 'draft' })
            .eq('estimateid', draftEstimate[0].estimateid);
        }
      }
    } else {
      console.log('No draft estimates found');
    }

    // Check valid transitions in UI logic
    console.log('\nChecking UI-defined valid transitions...');

    const uiTransitions = {
      draft: ['sent'],
      sent: ['approved', 'rejected'],
      pending: ['approved', 'rejected'],
      approved: ['converted'],
      rejected: ['draft'],
      converted: [],
    };

    console.log('Valid transitions according to the UI logic:');
    for (const [fromStatus, toStatuses] of Object.entries(uiTransitions)) {
      console.log(`From ${fromStatus}: ${toStatuses.join(', ') || 'none'}`);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkValidTransitions();
