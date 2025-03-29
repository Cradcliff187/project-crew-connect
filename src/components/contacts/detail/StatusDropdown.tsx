
import { useStatusOptions } from '@/hooks/useStatusOptions';
import UniversalStatusControl from '@/components/common/status/UniversalStatusControl';

interface StatusDropdownProps {
  contact: any;
  onStatusChange: (contact: any, newStatus: string) => void;
}

const StatusDropdown = ({ contact, onStatusChange }: StatusDropdownProps) => {
  const contactType = contact.contact_type || contact.type || 'client';
  const currentStatus = contact.status || 'active';
  
  // Get appropriate status options based on contact type
  const { statusOptions } = useStatusOptions('CONTACT', currentStatus);
  
  if (!statusOptions.length) return null;
  
  // Since this component is designed for the Contacts module which may have a different
  // structure than our standard models, we'll create a wrapper for the status change event
  const handleStatusChange = () => {
    onStatusChange(contact, currentStatus);
  };
  
  return (
    <UniversalStatusControl 
      entityId={contact.id || contact.customerid || contact.subid || contact.vendorid || ''}
      entityType="CONTACT"
      currentStatus={currentStatus}
      statusOptions={statusOptions}
      tableName={getTableNameFromContactType(contactType)}
      idField={getIdFieldFromContactType(contactType)}
      onStatusChange={handleStatusChange}
      showStatusBadge={true}
      size="sm"
    />
  );
};

// Helper function to determine database table name based on contact type
function getTableNameFromContactType(type: string): string {
  switch (type.toLowerCase()) {
    case 'client':
    case 'customer':
      return 'customers';
    case 'supplier':
    case 'vendor':
      return 'vendors';
    case 'subcontractor':
      return 'subcontractors';
    case 'employee':
      return 'employees';
    default:
      return 'contacts';
  }
}

// Helper function to determine ID field name based on contact type
function getIdFieldFromContactType(type: string): string {
  switch (type.toLowerCase()) {
    case 'client':
    case 'customer':
      return 'customerid';
    case 'supplier':
    case 'vendor':
      return 'vendorid';
    case 'subcontractor':
      return 'subid';
    case 'employee':
      return 'employee_id';
    default:
      return 'id';
  }
}

export default StatusDropdown;
