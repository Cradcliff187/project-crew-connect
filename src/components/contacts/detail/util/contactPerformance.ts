
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface PerformanceMetric {
  id: string;
  contact_id: string;
  metric_type: string;
  metric_date: string;
  score: number;
  notes?: string;
  created_at: string;
}

// Fetch performance metrics for a contact
export const fetchPerformanceMetrics = async (contactId: string): Promise<PerformanceMetric[]> => {
  try {
    const { data, error } = await supabase
      .from('contact_performance_metrics')
      .select('*')
      .eq('contact_id', contactId)
      .order('metric_date', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error: any) {
    console.error("Error fetching performance metrics:", error);
    toast({
      title: "Error",
      description: "Failed to load performance metrics.",
      variant: "destructive"
    });
    return [];
  }
};

// Add a new performance metric
export const addPerformanceMetric = async (
  contactId: string,
  metricType: string,
  score: number,
  notes?: string
): Promise<PerformanceMetric | null> => {
  try {
    const { data, error } = await supabase
      .from('contact_performance_metrics')
      .insert({
        contact_id: contactId,
        metric_type: metricType,
        metric_date: new Date().toISOString(),
        score,
        notes: notes || null,
        created_at: new Date().toISOString()
      })
      .select('*')
      .single();
      
    if (error) throw error;
    
    // Update the overall rating in the contacts table (average of all metrics)
    await updateContactRating(contactId);
    
    toast({
      title: "Metric Added",
      description: "Performance metric has been successfully added."
    });
    
    return data;
  } catch (error: any) {
    console.error("Error adding performance metric:", error);
    toast({
      title: "Error",
      description: "Failed to add performance metric.",
      variant: "destructive"
    });
    return null;
  }
};

// Update a contact's overall rating based on performance metrics
const updateContactRating = async (contactId: string): Promise<void> => {
  try {
    // Calculate average score from all metrics
    const { data, error } = await supabase
      .from('contact_performance_metrics')
      .select('score')
      .eq('contact_id', contactId);
      
    if (error) throw error;
    
    if (data && data.length > 0) {
      const totalScore = data.reduce((sum, item) => sum + (Number(item.score) || 0), 0);
      const averageScore = Math.round(totalScore / data.length);
      
      // Update the contact's rating
      await supabase
        .from('contacts')
        .update({
          rating: averageScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', contactId);
    }
  } catch (error) {
    console.error("Error updating contact rating:", error);
  }
};

// Get metric type options based on contact type
export const getMetricTypeOptions = (contactType: string) => {
  if (contactType === 'supplier') {
    return [
      { value: 'PRODUCT_QUALITY', label: 'Product Quality' },
      { value: 'DELIVERY_TIME', label: 'Delivery Time' },
      { value: 'PRICE_COMPETITIVENESS', label: 'Price Competitiveness' },
      { value: 'COMMUNICATION', label: 'Communication' },
      { value: 'OVERALL', label: 'Overall Satisfaction' }
    ];
  }
  
  if (contactType === 'subcontractor') {
    return [
      { value: 'WORK_QUALITY', label: 'Work Quality' },
      { value: 'TIMELINESS', label: 'Timeliness' },
      { value: 'SAFETY', label: 'Safety' },
      { value: 'COMMUNICATION', label: 'Communication' },
      { value: 'OVERALL', label: 'Overall Performance' }
    ];
  }
  
  return [
    { value: 'OVERALL', label: 'Overall Rating' },
    { value: 'COMMUNICATION', label: 'Communication' },
    { value: 'RELIABILITY', label: 'Reliability' }
  ];
};
