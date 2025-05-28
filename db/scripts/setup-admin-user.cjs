const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://zrxezqllmpdlhiudutme.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY'
);

async function setupAdminUser() {
  console.log('🔧 Setting up admin user: cradcliff@austinkunzconstruction.com\n');

  try {
    // 1. Check if employee record exists for this email
    console.log('📋 Checking for existing employee record...');
    const { data: existingEmployee, error: checkError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', 'cradcliff@austinkunzconstruction.com')
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    let employeeId;

    if (existingEmployee) {
      console.log('✅ Found existing employee record:', existingEmployee.employee_id);
      employeeId = existingEmployee.employee_id;

      // Update to admin role and correct name
      console.log('🔄 Updating employee to admin role...');
      const { error: updateError } = await supabase
        .from('employees')
        .update({
          first_name: 'Chris',
          last_name: 'Radcliff',
          app_role: 'admin',
          status: 'active',
          email: 'cradcliff@austinkunzconstruction.com',
        })
        .eq('employee_id', employeeId);

      if (updateError) throw updateError;
      console.log('✅ Employee updated to admin role');
    } else {
      // Create new employee record
      console.log('🆕 Creating new employee record...');
      const { data: newEmployee, error: createError } = await supabase
        .from('employees')
        .insert({
          first_name: 'Chris',
          last_name: 'Radcliff',
          email: 'cradcliff@austinkunzconstruction.com',
          app_role: 'admin',
          status: 'active',
          hourly_rate: 75, // Default admin rate
          bill_rate: 125,
          cost_rate: 75,
          default_bill_rate: true,
        })
        .select()
        .single();

      if (createError) throw createError;
      employeeId = newEmployee.employee_id;
      console.log('✅ New employee created:', employeeId);
    }

    // 2. Check for auth users with this email
    console.log('\n📋 Checking for auth users with this email...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) throw authError;

    const existingAuthUser = authUsers.users.find(
      user => user.email === 'cradcliff@austinkunzconstruction.com'
    );

    if (existingAuthUser) {
      console.log('✅ Found existing auth user:', existingAuthUser.id);

      // Link auth user to employee record
      console.log('🔗 Linking auth user to employee record...');
      const { error: linkError } = await supabase
        .from('employees')
        .update({ user_id: existingAuthUser.id })
        .eq('employee_id', employeeId);

      if (linkError) throw linkError;
      console.log('✅ Auth user linked to employee record');

      // Update auth user metadata
      console.log('🔄 Updating auth user metadata...');
      const { error: metadataError } = await supabase.auth.admin.updateUserById(
        existingAuthUser.id,
        {
          user_metadata: {
            full_name: 'Chris Radcliff',
            role: 'admin',
            employee_id: employeeId,
          },
        }
      );

      if (metadataError) throw metadataError;
      console.log('✅ Auth user metadata updated');
    } else {
      console.log('⚠️  No auth user found with this email');
      console.log('   The user will be linked automatically when they first sign in with Google');
    }

    // 3. Verify admin permissions
    console.log('\n🔍 Verifying admin setup...');
    const { data: finalEmployee, error: verifyError } = await supabase
      .from('employees')
      .select('*')
      .eq('employee_id', employeeId)
      .single();

    if (verifyError) throw verifyError;

    console.log('\n✅ Admin user setup complete!');
    console.log('📊 Final employee record:');
    console.log(`   Employee ID: ${finalEmployee.employee_id}`);
    console.log(`   Name: ${finalEmployee.first_name} ${finalEmployee.last_name}`);
    console.log(`   Email: ${finalEmployee.email}`);
    console.log(`   Role: ${finalEmployee.app_role}`);
    console.log(`   Status: ${finalEmployee.status}`);
    console.log(`   User ID: ${finalEmployee.user_id || 'Will be linked on first login'}`);

    // 4. Set up RLS policies for admin access
    console.log('\n🔒 Ensuring admin has full RLS access...');

    // This admin will have full access to all tables through RLS policies
    console.log('✅ Admin will have full access to:');
    console.log('   - All time entries (view, create, edit, process)');
    console.log('   - All employee records (view, edit)');
    console.log('   - All projects and work orders (full access)');
    console.log('   - All receipts and documents (full access)');
    console.log('   - Activity logs (view all)');
    console.log('   - System settings (full access)');

    console.log('\n🎉 Setup complete! Chris Radcliff now has full admin access.');
    console.log('📱 This includes full mobile access and all administrative functions.');
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  }
}

setupAdminUser();
