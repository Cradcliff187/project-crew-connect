import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function applyFunction() {
  try {
    const sql = fs.readFileSync('create_receipt_record.sql', 'utf8');
    const result = await supabase.rpc('execute_sql_command', { sql_command: sql });

    if (result.error) {
      console.error('Error applying function:', result.error);
      process.exit(1);
    }

    console.log('✅ create_receipt_record function applied successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

applyFunction();
