import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function examineEstimateRevisions() {
  console.log('Examining Estimate Revisions and Their Relationship to Projects...');

  try {
    // 1. Check estimate_revisions table structure
    console.log('\n1. Examining estimate_revisions table structure:');
    const { data: revisionColumns, error: revError } = await supabase
      .from('estimate_revisions')
      .select('*')
      .limit(1);

    if (revError) {
      console.log('Error retrieving estimate_revisions:', revError.message);
    } else if (revisionColumns && revisionColumns.length > 0) {
      console.log('Revision columns:', Object.keys(revisionColumns[0]).join(', '));
      console.log('Sample revision:', JSON.stringify(revisionColumns[0], null, 2));
    } else {
      console.log('No revisions found in the database');
    }

    // 2. Check relationship between revisions and estimates
    console.log('\n2. Checking relationship between revisions and estimates:');
    const { data: estimatesWithRevisions, error: relError } = await supabase
      .from('estimates')
      .select(
        `
        estimateid,
        status,
        projectid,
        estimate_revisions (
          id,
          version,
          is_current,
          status
        )
      `
      )
      .eq('status', 'converted')
      .limit(5);

    if (relError) {
      console.log('Error retrieving estimate-revision relationships:', relError.message);
    } else if (estimatesWithRevisions && estimatesWithRevisions.length > 0) {
      console.log('Converted estimates with their revisions:');
      console.log(JSON.stringify(estimatesWithRevisions, null, 2));
    } else {
      console.log('No converted estimates with revisions found');

      // If no converted estimates were found, try to find any estimates with revisions
      const { data: anyEstimatesWithRevisions, error: anyRelError } = await supabase
        .from('estimates')
        .select(
          `
          estimateid,
          status,
          projectid,
          estimate_revisions (
            id,
            version,
            is_current,
            status
          )
        `
        )
        .limit(5);

      if (anyRelError) {
        console.log('Error retrieving any estimate-revision relationships:', anyRelError.message);
      } else if (anyEstimatesWithRevisions && anyEstimatesWithRevisions.length > 0) {
        console.log('Sample estimates with their revisions:');
        console.log(JSON.stringify(anyEstimatesWithRevisions, null, 2));
      } else {
        console.log('No estimates with revisions found at all');
      }
    }

    // 3. Check if there are any triggers or rules on estimate_revisions table for project conversion
    console.log('\n3. Looking for converted estimates and checking their revisions status:');
    const { data: convertedEstimate, error: convError } = await supabase
      .from('estimates')
      .select('estimateid, projectid, status')
      .eq('status', 'converted')
      .limit(1);

    if (convError) {
      console.log('Error finding converted estimates:', convError.message);
    } else if (convertedEstimate && convertedEstimate.length > 0) {
      const estimateId = convertedEstimate[0].estimateid;
      const projectId = convertedEstimate[0].projectid;

      console.log(`Found converted estimate ${estimateId} linked to project ${projectId}`);

      // Get all revisions for this converted estimate
      const { data: revisions, error: revError } = await supabase
        .from('estimate_revisions')
        .select('*')
        .eq('estimate_id', estimateId);

      if (revError) {
        console.log(`Error getting revisions for estimate ${estimateId}:`, revError.message);
      } else if (revisions && revisions.length > 0) {
        console.log(`Found ${revisions.length} revisions for converted estimate ${estimateId}:`);
        console.log(JSON.stringify(revisions, null, 2));
      } else {
        console.log(`No revisions found for converted estimate ${estimateId}`);
      }
    } else {
      console.log('No converted estimates found to check revisions');
    }
  } catch (error) {
    console.error('Error executing query:', error);
  }
}

// Run the function
examineEstimateRevisions();
