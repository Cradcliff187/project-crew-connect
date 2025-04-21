import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConversion() {
  try {
    console.log('Testing function with a dummy estimate ID...');

    // Try calling the function with a fake ID
    const { data, error } = await supabase.rpc('convert_estimate_to_project', {
      p_estimate_id: 'TEST-NONEXISTENT-ID',
    });

    if (error) {
      console.log('Function error:', error);

      if (error.message.includes('Estimate not found')) {
        console.log('✅ Function exists and is working (correctly reports non-existent estimate)');
      } else if (error.message.includes('does not exist')) {
        console.log('❌ Function does not exist');
      } else if (error.message.includes('document_id')) {
        console.log('❌ Function has incorrect document column mapping');
      } else {
        console.log('❓ Unexpected error');
      }
    } else {
      console.log('Unexpected success with fake ID:', data);
    }

    // Try listing available estimates to test with
    console.log('\nListing available estimates...');
    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .limit(5);

    if (estError) {
      console.log('Error listing estimates:', estError);
    } else if (estimates && estimates.length > 0) {
      console.log('Available estimates:');
      estimates.forEach(est => {
        console.log(
          `- ID: ${est.estimateid}, Status: ${est.status}, ProjectID: ${est.projectid || 'null'}`
        );
      });
    } else {
      console.log('No estimates found');
    }
  } catch (err) {
    console.error('General error:', err);
  }
}

testConversion();
