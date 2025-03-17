
import { Building, Mail, Phone, MapPin, MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
  DropdownMenuSubContent
} from '@/components/ui/dropdown-menu';
import StatusBadge from '@/components/ui/StatusBadge';

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

  // Status transition options based on contact type and current status
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(contact)}>View details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(contact)}>Edit contact</DropdownMenuItem>
              
              {/* Status change menu */}
              {contact.status && getStatusOptions().length > 0 && onStatusChange && (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Change status</DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      {getStatusOptions().map((option) => (
                        <DropdownMenuItem 
                          key={option.value}
                          onClick={() => onStatusChange(contact, option.value)}
                        >
                          {option.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              )}
              
              {contact.type === 'supplier' && (
                <DropdownMenuItem>View materials</DropdownMenuItem>
              )}
              {contact.type === 'subcontractor' && (
                <DropdownMenuItem>Assign to project</DropdownMenuItem>
              )}
              {contact.type === 'employee' && (
                <DropdownMenuItem>View timesheet</DropdownMenuItem>
              )}
              {['client', 'customer'].includes(contact.type) && (
                <>
                  <DropdownMenuItem>View projects</DropdownMenuItem>
                  <DropdownMenuItem>View estimates</DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem>Send email</DropdownMenuItem>
              <DropdownMenuItem>Schedule meeting</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600"
                onClick={() => onDelete(contact)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onView(contact)}>
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
