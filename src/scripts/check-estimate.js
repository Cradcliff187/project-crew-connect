// Script to check if an estimate exists
import { supabase } from '../integrations/supabase/client';

async function checkEstimate(estimateId) {
  console.log(`Checking if estimate ${estimateId} exists...`);

  try {
    const { data, error } = await supabase
      .from('estimates')
      .select('*')
      .eq('estimateid', estimateId)
      .single();

    if (error) {
      console.error('Error querying database:', error);
      return;
    }

    if (data) {
      console.log('Estimate found:', data);
      return data;
    } else {
      console.log(`No estimate found with ID ${estimateId}`);
      return null;
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

// Check for the specific estimate
checkEstimate('EST-364978');
