
import React, { useEffect, useState } from 'react';
import { Contact } from '@/pages/Contacts';
import StatusHistoryView from '@/components/common/status/StatusHistoryView';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

interface ContactStatusHistoryProps {
  contact: Contact;
  className?: string;
}

const ContactStatusHistory: React.FC<ContactStatusHistoryProps> = ({
  contact,
  className = ''
}) => {
  const [showHistory, setShowHistory] = useState(true);
  
  // Determine history table and ID field based on contact type
  const getHistoryConfig = () => {
    return {
      historyTable: 'contact_status_history',
      entityIdField: 'contact_id'
    };
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
        ) : (
          <StatusHistoryView
            entityId={contact.id}
            entityType="CONTACT"
            {...getHistoryConfig()}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default ContactStatusHistory;
