import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Initialize Supabase client
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODcyMzIsImV4cCI6MjA1NzA2MzIzMn0.zbmttNoNRALsW1aRV4VjodpitI_3opfNGhDgydcGhmQ';
const supabase = createClient(supabaseUrl, supabaseKey);

// Check if we have any app logs in a local file
function checkLocalLogFiles() {
  console.log('\nChecking for local log files...');

  // Common log locations
  const possibleLogPaths = ['./logs', './log', './tmp/logs', './data/logs', '../logs'];

  let logFound = false;

  possibleLogPaths.forEach(logPath => {
    try {
      if (fs.existsSync(logPath)) {
        console.log(`Found log directory: ${logPath}`);
        const files = fs.readdirSync(logPath);

        if (files.length > 0) {
          console.log(`Log files found in ${logPath}:`);
          files.forEach(file => {
            console.log(`- ${file}`);
          });

          // Check most recent log file for conversion info
          const logFiles = files
            .filter(f => f.endsWith('.log') || f.endsWith('.txt'))
            .map(f => ({
              name: f,
              time: fs.statSync(path.join(logPath, f)).mtime.getTime(),
            }))
            .sort((a, b) => b.time - a.time);

          if (logFiles.length > 0) {
            const recentLog = logFiles[0].name;
            console.log(`\nExamining most recent log file: ${recentLog}`);

            const logContent = fs.readFileSync(path.join(logPath, recentLog), 'utf8');
            const lines = logContent.split('\n');

            // Look for conversion-related logs
            const conversionLogs = lines.filter(
              line =>
                line.includes('convert') ||
                line.includes('estimate') ||
                line.includes('project') ||
                line.includes('EST-')
            );

            if (conversionLogs.length > 0) {
              console.log(`Found ${conversionLogs.length} conversion-related log entries:`);
              conversionLogs.forEach(line => {
                console.log(`  ${line}`);
              });
              logFound = true;
            } else {
              console.log('No conversion-related logs found in this file.');
            }
          }
        } else {
          console.log(`No log files found in ${logPath}`);
        }
      }
    } catch (err) {
      // Ignore errors for paths that don't exist
    }
  });

  if (!logFound) {
    console.log('No relevant log files found in the common locations.');
  }
}

/**
 * Examine the database for clues about the conversion method
 */
async function inspectDatabaseForClues() {
  try {
    console.log('\nExamining database for conversion method clues...');

    // 1. First check the estimate for timestamps
    const { data: estimate, error: estimateError } = await supabase
      .from('estimates')
      .select('*')
      .eq('status', 'converted')
      .limit(1)
      .single();

    if (estimateError) {
      console.error(`Error fetching estimate: ${estimateError.message}`);
      return;
    }

    console.log(`\nExamining estimate with ID: ${estimate.estimateid}`);

    // Compare created_at and updated_at to determine if conversion happened immediately
    const createdAt = new Date(estimate.created_at || estimate.datecreated);
    const updatedAt = new Date(estimate.updated_at);
    const timeDiff = Math.abs(updatedAt - createdAt) / 1000 / 60; // Minutes

    console.log(`Created: ${createdAt.toISOString()}`);
    console.log(`Last updated: ${updatedAt.toISOString()}`);
    console.log(`Time difference: ${timeDiff.toFixed(2)} minutes`);

    if (timeDiff < 5) {
      console.log('✓ Conversion happened very quickly after creation (< 5 minutes)');
      console.log(
        '  This suggests it may have been converted immediately or through automated means.'
      );
    } else {
      console.log('✓ Conversion happened some time after creation.');
      console.log('  This suggests a manual conversion through the UI.');
    }

    // 2. Check if the project has very similar timestamps to the estimate's update time
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('projectid', estimate.projectid)
      .single();

    if (projectError) {
      console.error(`Error fetching project: ${projectError.message}`);
      return;
    }

    const projectCreatedAt = new Date(project.created_at || project.createdon);
    const projectEstimateDiff = Math.abs(projectCreatedAt - updatedAt) / 1000 / 60; // Minutes

    console.log(`Project created: ${projectCreatedAt.toISOString()}`);
    console.log(
      `Time between estimate update and project creation: ${projectEstimateDiff.toFixed(2)} minutes`
    );

    if (projectEstimateDiff < 1) {
      console.log('✓ Project was created almost immediately after estimate update');
      console.log('  This strongly suggests a direct conversion through the UI button.');
    }

    // Check if SimpleConvert method was more likely used
    const projectNameSimple =
      project.projectname.includes('Simple Project') || project.projectname.includes('from EST-');

    if (projectNameSimple) {
      console.log('✓ Project name format suggests the Simple Convert method was used');
    }

    // 3. Check for any logs in the form of comments/notes
    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .or(`description.ilike.%${estimate.estimateid}%,text.ilike.%${estimate.estimateid}%`)
      .order('created_at', { ascending: false })
      .limit(5);

    if (!notesError && notes && notes.length > 0) {
      console.log(`\nFound ${notes.length} notes that might be related to the conversion:`);
      notes.forEach((note, i) => {
        console.log(`\n[NOTE ${i + 1}]`);
        console.log(`  ${note.description || note.text}`);
        console.log(`  Created: ${note.created_at}`);
      });
    } else {
      console.log('\nNo notes found related to this conversion.');
    }

    // 4. Final diagnosis based on all clues
    console.log('\n=== CONVERSION METHOD DIAGNOSIS ===');

    // If there were timestamps for status changes, analyze the sequence
    if (estimate.approveddate) {
      console.log(`Approved date: ${estimate.approveddate}`);
    }
    if (estimate.sentdate) {
      console.log(`Sent date: ${estimate.sentdate}`);
    }

    // The most likely conversion path based on our findings
    console.log('\nMOST LIKELY CONVERSION METHOD:');

    if (projectNameSimple) {
      console.log('👉 The "Simple Convert" button was used in the dialog');
      console.log('   This method bypasses the normal status validation and directly:');
      console.log('   1. Creates a new project');
      console.log('   2. Links the estimate to the project');
      console.log('   3. Sets the estimate status to "converted"');
    } else if (projectEstimateDiff < 1) {
      console.log('👉 The standard "Convert to Project" button was clicked');
      console.log('   But since there was a status validation issue, the system:');
      console.log('   1. Tried the database function first, which failed');
      console.log('   2. Fell back to the JavaScript implementation');
      console.log('   3. The JavaScript implementation successfully bypassed validation');
    } else {
      console.log('👉 Unable to conclusively determine the exact conversion method');
      console.log('   But the conversion was successful regardless of the method used.');
    }
  } catch (error) {
    console.error('Error inspecting database for clues:', error);
  }
}

// Main function to run all checks
async function main() {
  console.log('=== CONVERSION METHOD INVESTIGATION ===');

  // Check for local application logs
  checkLocalLogFiles();

  // Inspect database timestamps and project data for clues
  await inspectDatabaseForClues();

  console.log('\nInvestigation complete.');
}

// Run the main function
main().catch(error => {
  console.error('Error in main function:', error);
});
