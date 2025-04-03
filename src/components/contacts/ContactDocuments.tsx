
import React from 'react';
import DocumentsSection from '@/components/documents/DocumentsSection';
import { EntityType } from '@/components/documents/schemas/documentSchema';

interface ContactDocumentsProps {
  contactId: string;
}

const ContactDocuments: React.FC<ContactDocumentsProps> = ({ contactId }) => {
  return (
    <DocumentsSection
      entityType="CONTACT"
      entityId={contactId}
      title="Contact Documents"
      description="Upload and manage documents associated with this contact"
      showMetrics={true}
    />
  );
};

export default ContactDocuments;
