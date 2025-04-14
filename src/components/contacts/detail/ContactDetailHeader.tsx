import { ArrowLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ContactDetailHeaderProps {
  name: string;
  company?: string;
  onClose: () => void;
}

const ContactDetailHeader = ({ name, company, onClose }: ContactDetailHeaderProps) => {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-xl font-medium">{name}</h2>
          {company && <p className="text-sm text-muted-foreground">{company}</p>}
        </div>
      </div>
      <Button variant="ghost" size="icon" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ContactDetailHeader;
