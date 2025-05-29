const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('🔗 Connecting to Supabase...');
console.log('URL:', supabaseUrl ? 'Found' : 'Missing');
console.log('Key:', supabaseKey ? 'Found' : 'Missing');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyReceiptFunction() {
  console.log('🚀 Applying create_receipt_record function...\n');

  try {
    const sqlPath = path.join(__dirname, 'db', 'functions', 'create_receipt_record.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('📄 Executing SQL function...');
    const result = await supabase.rpc('execute_sql_command', { sql_command: sql });

    if (result.error) {
      console.error('❌ Error applying function:', result.error);
      process.exit(1);
    }

    console.log('✅ create_receipt_record function applied successfully!');
    console.log('🎉 Receipt upload functionality is now ready to use.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyReceiptFunction();
