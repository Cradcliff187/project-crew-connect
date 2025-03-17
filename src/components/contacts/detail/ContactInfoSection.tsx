
import { Mail, Phone } from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '@/components/ui/StatusBadge';
import { Star } from '@/components/ui/star';

interface ContactInfoSectionProps {
  contact: any;
}

const ContactInfoSection = ({ contact }: ContactInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-3">Contact Information</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
            <a href={`mailto:${contact.email}`} className="text-[#0485ea] hover:underline">{contact.email}</a>
          </div>
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
            <a href={`tel:${contact.phone}`} className="hover:text-[#0485ea]">{contact.phone}</a>
          </div>
          <div className="flex items-start">
            <Mail className="h-4 w-4 mr-3 text-muted-foreground mt-0.5" />
            <span className="text-muted-foreground">{contact.address}</span>
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Company Information</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">Company:</span>
            <span>{contact.company}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">Role:</span>
            <span>{contact.role}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">Type:</span>
            <span className="capitalize">{contact.type}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">Status:</span>
            {contact.status ? (
              <StatusBadge status={contact.status.toLowerCase() as any} />
            ) : (
              <span>Not set</span>
            )}
          </div>
          {contact.rating && (
            <div className="flex items-center">
              <span className="text-muted-foreground w-24">Rating:</span>
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < contact.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-3">Additional Information</h3>
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">Last Contact:</span>
            <span>{format(new Date(contact.lastContact), 'PP')}</span>
          </div>
          <div className="flex items-center">
            <span className="text-muted-foreground w-24">ID:</span>
            <span className="text-muted-foreground">{contact.id}</span>
          </div>
          {contact.notes && (
            <div className="flex flex-col">
              <span className="text-muted-foreground mb-1">Notes:</span>
              <p className="bg-muted p-3 rounded-md text-sm">{contact.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
