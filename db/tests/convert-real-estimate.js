import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function convertRealEstimate() {
  try {
    // Find an unconverted estimate
    console.log('Finding an unconverted estimate...');

    const { data: estimates, error: estError } = await supabase
      .from('estimates')
      .select('estimateid, status')
      .is('projectid', null)
      .neq('status', 'converted')
      .limit(5);

    if (estError) {
      console.error('Error finding estimates:', estError);
      return;
    }

    if (!estimates || estimates.length === 0) {
      console.log('No unconverted estimates found');
      return;
    }

    // Choose the first available estimate
    const estimateId = estimates[0].estimateid;
    console.log(`Found estimate to convert: ${estimateId}`);

    // Call the function to convert it
    console.log(`Converting estimate ${estimateId} to project...`);

    const { data, error } = await supabase.rpc('convert_estimate_to_project', {
      p_estimate_id: estimateId,
    });

    if (error) {
      console.error('Conversion error:', error);
      return;
    }

    console.log(`Conversion successful! New project ID: ${data}`);

    // Verify the estimate was updated
    const { data: updatedEst, error: updateError } = await supabase
      .from('estimates')
      .select('estimateid, status, projectid')
      .eq('estimateid', estimateId)
      .single();

    if (updateError) {
      console.error('Error fetching updated estimate:', updateError);
    } else {
      console.log('Updated estimate:', updatedEst);

      if (updatedEst.status === 'converted' && updatedEst.projectid === data) {
        console.log('✅ SUCCESS: Estimate was properly converted to project');
      } else {
        console.log('⚠️ WARNING: Estimate conversion may be incomplete');
      }
    }

    // Try to get the new project
    const { data: project, error: projError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', data)
      .single();

    if (projError) {
      console.error('Error fetching the created project:', projError);
    } else {
      console.log('New project details:', project);
    }
  } catch (error) {
    console.error('General error:', error);
  }
}

convertRealEstimate();
