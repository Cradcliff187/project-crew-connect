
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';

interface EmailTemplatePreviewCardProps {
  subject: string;
  body: string;
  recipientEmail: string;
}

const EmailTemplatePreviewCard: React.FC<EmailTemplatePreviewCardProps> = ({
  subject,
  body,
  recipientEmail
}) => {
  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardHeader className="py-3 bg-gray-50 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-1.5">
          <Mail className="h-4 w-4 text-[#0485ea]" />
          Email Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">To:</span> {recipientEmail}
          </div>
          <div className="text-sm">
            <span className="font-medium">Subject:</span> {subject}
          </div>
        </div>
        
        <div className="border-t pt-3 mt-3">
          <div className="prose prose-sm max-w-none">
            {body.split('\n').map((paragraph, i) => (
              <p key={i} className="my-2">{paragraph}</p>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailTemplatePreviewCard;
