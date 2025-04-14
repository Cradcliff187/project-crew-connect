import React, { useEffect, useState } from 'react';
import { Contact } from '@/pages/Contacts';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { StatusOption } from '@/components/common/status/UniversalStatusControl';

interface ContactStatusHistoryProps {
  contact: Contact;
  className?: string;
}

const ContactStatusHistory: React.FC<ContactStatusHistoryProps> = ({ contact, className = '' }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Define status options for contacts
  const statusOptions: StatusOption[] = [
    { value: 'PROSPECT', label: 'Prospect', color: 'blue' },
    { value: 'ACTIVE', label: 'Active', color: 'green' },
    { value: 'INACTIVE', label: 'Inactive', color: 'neutral' },
  ];

  useEffect(() => {
    if (contact.id) {
      fetchHistory();
    }
  }, [contact.id]);

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('activitylog')
        .select('*')
        .eq('referenceid', contact.id)
        .eq('moduletype', 'CONTACT')
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Transform the data to match our expected format
      const formattedHistory =
        data?.map(item => ({
          status: item.status,
          previous_status: item.previousstatus,
          changed_date: item.timestamp,
          changed_by: item.useremail,
          notes: item.detailsjson ? JSON.parse(item.detailsjson)?.notes : item.action,
        })) || [];

      setHistory(formattedHistory);
    } catch (error: any) {
      console.error('Error fetching contact status history:', error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Status History</CardTitle>
      </CardHeader>
      <CardContent>
        {!contact.id ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Contact information is required to view status history.
            </AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="text-center py-4">Loading history...</div>
        ) : (
          <StatusHistoryView
            history={history}
            statusOptions={statusOptions}
            currentStatus={contact.status || 'PROSPECT'}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ContactStatusHistory;
