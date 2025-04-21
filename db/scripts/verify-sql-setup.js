import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifySetup() {
  console.log('🔍 Verifying database setup...');

  // 1. Check if project_documents table exists
  console.log('\n1. Checking project_documents table...');

  const { data: documents, error: docError } = await supabase
    .from('project_documents')
    .select('*')
    .limit(1);

  if (docError && docError.code === '42P01') {
    console.log('❌ project_documents table does NOT exist - SQL setup unsuccessful');
  } else if (docError) {
    console.log('⚠️ Error checking project_documents:', docError.message);
  } else {
    console.log('✅ project_documents table exists!');
  }

  // 2. Check if convert_estimate_to_project function exists
  console.log('\n2. Checking convert_estimate_to_project function...');

  const { data: funcResult, error: funcError } = await supabase.rpc('convert_estimate_to_project', {
    p_estimate_id: 'TEST-ID-NOT-REAL',
  });

  if (funcError && funcError.message.includes('does not exist')) {
    console.log('❌ convert_estimate_to_project function does NOT exist - SQL setup unsuccessful');
  } else if (funcError && funcError.message.includes('Estimate not found')) {
    console.log('✅ convert_estimate_to_project function exists and is working correctly!');
    console.log('   (Error "Estimate not found" is expected for a non-existent ID)');
  } else if (funcError) {
    console.log('⚠️ Function exists but returned unexpected error:', funcError.message);
  } else {
    console.log('⚠️ Unexpected success response from function with non-existent ID:', funcResult);
  }

  // Summary
  console.log('\n📋 Setup verification summary:');
  if (
    !(docError && docError.code === '42P01') &&
    funcError &&
    funcError.message.includes('Estimate not found')
  ) {
    console.log('✅ SUCCESS: All required database objects exist!');
    console.log('   You can now use the convert_estimate_to_project function in your application.');
  } else {
    console.log('❌ INCOMPLETE: Some database objects are missing.');
    console.log('   Please run the SQL statements in the Supabase SQL Editor.');
  }
}

// Run the verification
verifySetup();
