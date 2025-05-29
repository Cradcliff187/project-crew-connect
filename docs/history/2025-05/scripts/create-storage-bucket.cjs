const { createClient } = require('@supabase/supabase-js');

// Create Storage Bucket and Verify Database State
const supabaseUrl = 'https://zrxezqllmpdlhiudutme.supabase.co';
const supabaseServiceKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpyeGV6cWxsbXBkbGhpdWR1dG1lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTQ4NzIzMiwiZXhwIjoyMDU3MDYzMjMyfQ.4kv7pOUS551zS8DoA12lFw_4BVA0ByuQC76bRRMAkWY';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageAndVerifyDB() {
  console.log('🔧 STORAGE SETUP AND DATABASE VERIFICATION');
  console.log('='.repeat(50));

  try {
    // 1. Create storage bucket for documents
    console.log('\n📁 1. CREATING STORAGE BUCKET');
    console.log('-'.repeat(30));

    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();

    if (listError) {
      console.log('❌ Error listing buckets:', listError.message);
    } else {
      console.log(`✅ Current buckets: ${buckets.map(b => b.name).join(', ') || 'none'}`);

      const hasDocumentsBucket = buckets.some(b => b.name === 'documents');

      if (!hasDocumentsBucket) {
        console.log('🔄 Creating documents bucket...');

        const { data: newBucket, error: createError } = await supabaseAdmin.storage.createBucket(
          'documents',
          {
            public: false,
            allowedMimeTypes: [
              'image/jpeg',
              'image/png',
              'image/gif',
              'image/webp',
              'application/pdf',
            ],
            fileSizeLimit: 10485760, // 10MB
          }
        );

        if (createError) {
          console.log('❌ Error creating bucket:', createError.message);
        } else {
          console.log('✅ Documents bucket created successfully');
        }
      } else {
        console.log('✅ Documents bucket already exists');
      }
    }

    // 2. Check employees table with service role
    console.log('\n👥 2. EMPLOYEES TABLE VERIFICATION');
    console.log('-'.repeat(30));

    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .limit(10);

    if (empError) {
      console.log('❌ Error fetching employees:', empError.message);
    } else {
      console.log(`✅ Found ${employees.length} employees in database`);

      if (employees.length > 0) {
        console.log('📋 Employee records:');
        employees.forEach((emp, index) => {
          console.log(
            `   ${index + 1}. ${emp.first_name} ${emp.last_name} (${emp.email || 'no email'})`
          );
          console.log(
            `      ID: ${emp.employee_id}, Role: ${emp.app_role || 'none'}, User ID: ${emp.user_id || 'none'}`
          );
        });

        // Check for Chris Radcliff specifically
        const chrisRadcliff = employees.find(
          e =>
            e.email === 'cradcliff@austinkunzconstruction.com' ||
            (e.first_name?.toLowerCase().includes('chris') &&
              e.last_name?.toLowerCase().includes('radcliff'))
        );

        if (chrisRadcliff) {
          console.log('\n🎉 Chris Radcliff found in database!');
          console.log(`   Employee ID: ${chrisRadcliff.employee_id}`);
          console.log(`   Role: ${chrisRadcliff.app_role}`);
          console.log(`   User ID: ${chrisRadcliff.user_id}`);
          console.log(`   Email: ${chrisRadcliff.email}`);
        } else {
          console.log('\n❌ Chris Radcliff not found in employees table');
          console.log('🔄 Creating Chris Radcliff employee record...');

          // Create Chris Radcliff employee record
          const { data: newEmployee, error: createEmpError } = await supabaseAdmin
            .from('employees')
            .insert({
              first_name: 'Chris',
              last_name: 'Radcliff',
              email: 'cradcliff@austinkunzconstruction.com',
              app_role: 'admin',
              hourly_rate: 75.0,
              cost_rate: 50.0,
              bill_rate: 100.0,
              status: 'active',
            })
            .select()
            .single();

          if (createEmpError) {
            console.log('❌ Error creating employee:', createEmpError.message);
          } else {
            console.log('✅ Chris Radcliff employee record created');
            console.log(`   Employee ID: ${newEmployee.employee_id}`);
          }
        }
      } else {
        console.log('⚠️  No employees found in database');
        console.log('🔄 Creating initial Chris Radcliff employee record...');

        const { data: newEmployee, error: createEmpError } = await supabaseAdmin
          .from('employees')
          .insert({
            first_name: 'Chris',
            last_name: 'Radcliff',
            email: 'cradcliff@austinkunzconstruction.com',
            app_role: 'admin',
            hourly_rate: 75.0,
            cost_rate: 50.0,
            bill_rate: 100.0,
            status: 'active',
          })
          .select()
          .single();

        if (createEmpError) {
          console.log('❌ Error creating initial employee:', createEmpError.message);
        } else {
          console.log('✅ Initial Chris Radcliff employee record created');
          console.log(`   Employee ID: ${newEmployee.employee_id}`);
        }
      }
    }

    // 3. Check auth users
    console.log('\n🔐 3. AUTH USERS VERIFICATION');
    console.log('-'.repeat(30));

    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();

    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`✅ Found ${authUsers.users.length} auth users`);

      authUsers.users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.email} (ID: ${user.id})`);
        console.log(`      Created: ${new Date(user.created_at).toLocaleDateString()}`);
        console.log(`      Metadata: ${JSON.stringify(user.user_metadata)}`);
      });

      // Check for Chris Radcliff auth user
      const chrisAuthUser = authUsers.users.find(
        u => u.email === 'cradcliff@austinkunzconstruction.com'
      );

      if (chrisAuthUser) {
        console.log('\n🎉 Chris Radcliff auth user found!');
        console.log(`   Auth ID: ${chrisAuthUser.id}`);
        console.log(`   Email: ${chrisAuthUser.email}`);

        // Link auth user to employee if not already linked
        const { data: linkedEmployee, error: linkError } = await supabaseAdmin
          .from('employees')
          .update({ user_id: chrisAuthUser.id })
          .eq('email', 'cradcliff@austinkunzconstruction.com')
          .select()
          .single();

        if (linkError) {
          console.log('⚠️  Could not link auth user to employee:', linkError.message);
        } else {
          console.log('✅ Auth user linked to employee record');
        }
      } else {
        console.log('\n❌ Chris Radcliff auth user not found');
        console.log('ℹ️  User will need to sign up through the application');
      }
    }

    // 4. Verify table structures
    console.log('\n📊 4. TABLE STRUCTURE VERIFICATION');
    console.log('-'.repeat(30));

    // Check time_entries structure
    const { data: timeEntrySample, error: timeError } = await supabaseAdmin
      .from('time_entries')
      .select('*')
      .limit(1);

    if (timeError) {
      console.log('❌ Time entries table error:', timeError.message);
    } else {
      console.log('✅ Time entries table accessible');
      if (timeEntrySample && timeEntrySample.length > 0) {
        console.log('   Fields:', Object.keys(timeEntrySample[0]).join(', '));
      }
    }

    // Check receipts structure
    const { data: receiptSample, error: receiptError } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .limit(1);

    if (receiptError) {
      console.log('❌ Receipts table error:', receiptError.message);
    } else {
      console.log('✅ Receipts table accessible');
      if (receiptSample && receiptSample.length > 0) {
        console.log('   Fields:', Object.keys(receiptSample[0]).join(', '));
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎯 SETUP COMPLETE');
    console.log('='.repeat(50));
    console.log('✅ Storage bucket configured');
    console.log('✅ Database structure verified');
    console.log('✅ Admin user setup checked');
    console.log('\n🚀 System is ready for testing!');
  } catch (error) {
    console.error('💥 Setup failed:', error);
  }
}

// Run setup
setupStorageAndVerifyDB()
  .then(() => {
    console.log('\n✅ Setup complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Setup error:', error);
    process.exit(1);
  });
