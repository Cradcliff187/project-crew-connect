import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the same credentials as the proxy
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProjectStructure() {
  console.log('Checking project and related tables structure...');

  try {
    // 1. First check if projects table exists
    const { data: existingProjects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(5);

    if (projectsError) {
      console.log('Error fetching projects:', projectsError.message);
      return;
    }

    if (existingProjects && existingProjects.length > 0) {
      console.log(`Found ${existingProjects.length} projects in database`);
      console.log('Project table structure:');
      const columns = Object.keys(existingProjects[0]);
      console.log(columns.join(', '));

      console.log('\nSample project:');
      console.log(JSON.stringify(existingProjects[0], null, 2));
    } else {
      console.log('No projects found in database');
    }

    // 2. Check project_budget_items table structure
    console.log('\nChecking project_budget_items table structure:');
    const { data: projectItems, error: itemsError } = await supabase
      .from('project_budget_items')
      .select('*')
      .limit(5);

    if (itemsError && !itemsError.message.includes('does not exist')) {
      console.log('Error fetching project budget items:', itemsError.message);
    } else if (itemsError && itemsError.message.includes('does not exist')) {
      console.log('project_budget_items table does not exist - would need to create it');
    } else {
      if (projectItems && projectItems.length > 0) {
        console.log('Found project budget items, structure:');
        console.log(Object.keys(projectItems[0]).join(', '));
        console.log('\nSample item:');
        console.log(JSON.stringify(projectItems[0], null, 2));
      } else {
        console.log('project_budget_items table exists but is empty');

        // Check the table structure directly
        const { data: tableInfo, error: tableError } = await supabase
          .rpc('check_table_structure', { table_name: 'project_budget_items' })
          .maybeSingle();

        if (tableError) {
          console.log('Error checking table structure:', tableError.message);
        } else if (tableInfo) {
          console.log('Table structure:', tableInfo);
        }
      }
    }

    // 3. Check project_documents table
    console.log('\nChecking project_documents table:');
    const { data: projectDocs, error: docsError } = await supabase
      .from('project_documents')
      .select('*')
      .limit(5);

    if (docsError && docsError.message.includes('does not exist')) {
      console.log('project_documents table does not exist - would need to create it');
    } else if (docsError) {
      console.log('Error fetching project documents:', docsError.message);
    } else {
      if (projectDocs && projectDocs.length > 0) {
        console.log('Found project documents, structure:');
        console.log(Object.keys(projectDocs[0]).join(', '));
      } else {
        console.log('project_documents table exists but is empty');
      }
    }

    // 4. Create a sample project to see what fields are accepted
    console.log('\nTrying to create a test project to check structure:');

    // Create a test object with required fields
    const testProject = {
      projectname: 'TEST_PROJECT_DELETE_ME',
      customername: 'TEST_CUSTOMER',
      jobdescription: 'Test project for structure validation',
      status: 'draft',
      createdon: new Date().toISOString(),
    };

    // Try to insert and immediately delete
    const { data: insertedProject, error: insertError } = await supabase
      .from('projects')
      .insert(testProject)
      .select()
      .single();

    if (insertError) {
      console.log('Error inserting test project:', insertError.message);

      // Try to see what columns we MUST provide
      if (insertError.message.includes('violates not-null constraint')) {
        console.log('Need to provide these fields (not-null constraint):');
        const match = insertError.message.match(/column "([^"]+)"/);
        if (match) {
          console.log(`- ${match[1]}`);
        }
      }
    } else {
      console.log('Successfully created test project, structure:');
      console.log(JSON.stringify(insertedProject, null, 2));

      // Immediately delete the test project
      const { error: deleteError } = await supabase
        .from('projects')
        .delete()
        .eq('projectid', insertedProject.projectid);

      if (deleteError) {
        console.log('Error deleting test project:', deleteError.message);
      } else {
        console.log('Test project deleted successfully');
      }
    }
  } catch (error) {
    console.error('Error checking project structure:', error);
  }
}

// Run the check
checkProjectStructure();
