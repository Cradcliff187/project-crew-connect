import { Building, Mail, Phone, MapPin, Star, Eye, Edit, Trash2, Send, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import StatusBadge from '@/components/ui/StatusBadge';
import ActionMenu, { ActionGroup } from '@/components/ui/action-menu';

interface ContactCardProps {
  contact: any;
  onView: (contact: any) => void;
  onEdit: (contact: any) => void;
  onDelete: (contact: any) => void;
  onStatusChange?: (contact: any, newStatus: string) => void;
}

const ContactCard = ({ contact, onView, onEdit, onDelete, onStatusChange }: ContactCardProps) => {
  const getTypeColor = (type: string) => {
    switch(type) {
      case 'client':
        return 'text-blue-700 bg-blue-50';
      case 'customer':
        return 'text-green-700 bg-green-50';
      case 'supplier':
        return 'text-amber-700 bg-amber-50';
      case 'subcontractor':
        return 'text-purple-700 bg-purple-50';
      case 'employee':
        return 'text-[#0485ea] bg-blue-50';
      default:
        return 'text-gray-700 bg-gray-50';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }).format(date);
  };

  const getStatusOptions = () => {
    const type = contact.type;
    const currentStatus = contact.status;
    
    if (!currentStatus) return [];

    if (type === 'client' || type === 'customer') {
      switch (currentStatus) {
        case 'PROSPECT':
          return [{ value: 'ACTIVE', label: 'Convert to Active' }];
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'supplier') {
      switch (currentStatus) {
        case 'POTENTIAL':
          return [{ value: 'APPROVED', label: 'Approve Vendor' }];
        case 'APPROVED':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'APPROVED', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'subcontractor') {
      switch (currentStatus) {
        case 'PENDING':
          return [{ value: 'QUALIFIED', label: 'Mark as Qualified' }];
        case 'QUALIFIED':
          return [{ value: 'ACTIVE', label: 'Convert to Active' }];
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    } else if (type === 'employee') {
      switch (currentStatus) {
        case 'ACTIVE':
          return [{ value: 'INACTIVE', label: 'Mark as Inactive' }];
        case 'INACTIVE':
          return [{ value: 'ACTIVE', label: 'Reactivate' }];
        default:
          return [];
      }
    }
    
    return [];
  };

  const getContactActions = (): ActionGroup[] => {
    const primaryActions: ActionGroup = {
      items: [
        {
          label: 'View details',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => onView(contact)
        },
        {
          label: 'Edit contact',
          icon: <Edit className="h-4 w-4" />,
          onClick: () => onEdit(contact)
        }
      ]
    };

    const typeSpecificActions: ActionGroup = {
      items: []
    };

    if (contact.type === 'supplier') {
      typeSpecificActions.items.push({
        label: 'View materials',
        icon: <Eye className="h-4 w-4" />,
        onClick: () => console.log('View materials')
      });
    } else if (contact.type === 'subcontractor') {
      typeSpecificActions.items.push({
        label: 'Assign to project',
        icon: <Send className="h-4 w-4" />,
        onClick: () => console.log('Assign to project')
      });
    } else if (contact.type === 'employee') {
      typeSpecificActions.items.push({
        label: 'View timesheet',
        icon: <CalendarClock className="h-4 w-4" />,
        onClick: () => console.log('View timesheet')
      });
    } else if (['client', 'customer'].includes(contact.type)) {
      typeSpecificActions.items.push(
        {
          label: 'View projects',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => console.log('View projects')
        },
        {
          label: 'View estimates',
          icon: <Eye className="h-4 w-4" />,
          onClick: () => console.log('View estimates')
        }
      );
    }

    const communicationActions: ActionGroup = {
      items: [
        {
          label: 'Send email',
          icon: <Mail className="h-4 w-4" />,
          onClick: () => console.log('Send email')
        },
        {
          label: 'Schedule meeting',
          icon: <CalendarClock className="h-4 w-4" />,
          onClick: () => console.log('Schedule meeting')
        }
      ]
    };

    const statusOptions = getStatusOptions();
    const statusActions: ActionGroup = {
      items: statusOptions.map(option => ({
        label: option.label,
        onClick: () => onStatusChange && onStatusChange(contact, option.value)
      }))
    };

    const destructiveActions: ActionGroup = {
      items: [
        {
          label: 'Delete',
          icon: <Trash2 className="h-4 w-4" />,
          onClick: () => onDelete(contact),
          className: 'text-red-600'
        }
      ]
    };

    const groups: ActionGroup[] = [primaryActions];

    if (typeSpecificActions.items.length > 0) {
      groups.push(typeSpecificActions);
    }

    groups.push(communicationActions);

    if (statusActions.items.length > 0 && onStatusChange) {
      groups.push(statusActions);
    }

    groups.push(destructiveActions);

    return groups;
  };
  
  return (
    <Card className="premium-card overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium">{contact.name}</h3>
            <div className="flex items-center gap-1 text-sm mt-1 text-muted-foreground">
              <Building className="h-3 w-3" />
              <span>{contact.company || 'Internal'}</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {contact.role && (
                <p className="text-xs rounded-full bg-construction-50 inline-block px-2 py-0.5 text-construction-700">
                  {contact.role}
                </p>
              )}
              <p className={`text-xs rounded-full px-2 py-0.5 capitalize ${getTypeColor(contact.type)}`}>
                {contact.type}
              </p>
              {contact.status && (
                <StatusBadge size="sm" status={contact.status.toLowerCase() as any} />
              )}
              {contact.hourlyRate && (
                <p className="text-xs rounded-full bg-green-50 inline-block px-2 py-0.5 text-green-700">
                  ${contact.hourlyRate}/hr
                </p>
              )}
            </div>
          </div>
          
          <ActionMenu groups={getContactActions()} />
        </div>
        
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-[#0485ea] hover:underline">{contact.email}</a>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="hover:text-[#0485ea]">{contact.phone}</a>
          </div>
          {contact.address && (
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground mt-0.5" />
              <span className="text-muted-foreground">{contact.address}</span>
            </div>
          )}
          {contact.specialty && (
            <div className="flex items-start mt-2">
              <span className="text-muted-foreground">Specialty: {contact.specialty}</span>
            </div>
          )}
          {contact.rating && (
            <div className="flex items-center mt-2">
              <span className="text-muted-foreground mr-1">Rating:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-3.5 w-3.5 ${i < contact.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="px-5 py-3 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
        <span className="text-xs text-muted-foreground">
          {contact.type === 'employee' ? 'Employee since:' : 'Last contacted:'} {formatDate(contact.lastContact)}
        </span>
        <div className="space-x-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ContactCard;
