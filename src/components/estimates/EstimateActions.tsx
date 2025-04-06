
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  DownloadCloud, 
  Mail, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2,
  Send,
  Share2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstimateActionsProps {
  status: string;
  onEdit?: () => void;
  onConvert?: () => void;
  onDelete?: () => void;
  onShare?: () => void;
  currentRevision?: any;
  estimateId?: string;
}

const EstimateActions: React.FC<EstimateActionsProps> = ({ 
  status,
  onEdit,
  onConvert,
  onDelete,
  onShare,
  currentRevision,
  estimateId
}) => {
  const isEditable = status === 'draft';
  const isConvertible = status === 'approved';
  const isPending = status === 'sent' || status === 'pending';
  const { toast } = useToast();

  const handleDownload = async () => {
    if (!currentRevision?.pdf_document_id) {
      toast({
        title: 'PDF Not Available',
        description: 'There is no PDF document available to download.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Get document details with URL
      const { data: document, error: docError } = await supabase
        .from('documents_with_urls')
        .select('*')
        .eq('document_id', currentRevision.pdf_document_id)
        .single();
        
      if (docError) throw docError;
      
      if (!document?.url) {
        throw new Error('Document URL not found');
      }
      
      // Download the file
      const response = await fetch(document.url);
      const blob = await response.blob();
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = document.file_name || `Estimate-${estimateId}.pdf`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Log the download action
      await supabase
        .from('document_access_logs')
        .insert({
          document_id: currentRevision.pdf_document_id,
          action: 'DOWNLOAD'
        });
        
      toast({
        title: 'Downloaded',
        description: 'PDF downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast({
        title: 'Download Error',
        description: 'Failed to download the PDF.',
        variant: 'destructive'
      });
    }
  };

  const handleEmail = () => {
    // Switch to the email tab
    const emailTabTrigger = document.querySelector('[value="email"]');
    if (emailTabTrigger && emailTabTrigger instanceof HTMLElement) {
      emailTabTrigger.click();
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <MoreVertical className="h-4 w-4" />
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isEditable && onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Estimate
          </DropdownMenuItem>
        )}
        
        {isConvertible && onConvert && (
          <DropdownMenuItem onClick={onConvert}>
            <FileText className="h-4 w-4 mr-2" />
            Convert to Project
          </DropdownMenuItem>
        )}

        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email Estimate
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDownload} disabled={!currentRevision?.pdf_document_id}>
          <DownloadCloud className="h-4 w-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        
        {onShare && (
          <DropdownMenuItem onClick={onShare} disabled={!currentRevision?.pdf_document_id}>
            <Share2 className="h-4 w-4 mr-2" />
            Share PDF
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="text-red-600" 
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EstimateActions;
