
import React, { useState, useEffect } from 'react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import EstimatePreview from '../EstimatePreview';
import { Card, CardContent } from '@/components/ui/card';
import { PaperclipIcon, FileIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReviewStepProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
}

const ReviewStep = ({ 
  formData, 
  selectedCustomerName, 
  selectedCustomerAddress 
}: ReviewStepProps) => {
  const [attachedDocuments, setAttachedDocuments] = useState<Record<string, any>>({});
  
  // Fetch document info for each document ID
  useEffect(() => {
    const documentIds = [
      ...(formData.estimate_documents || []),
      ...(formData.items?.filter(i => i.document_id).map(i => i.document_id) || [])
    ].filter(Boolean) as string[];
    
    if (documentIds.length === 0) {
      return;
    }
    
    const fetchDocumentInfo = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('document_id, file_name, file_type, category')
          .in('document_id', documentIds);
          
        if (error) {
          console.error('Error fetching documents:', error);
          return;
        }
        
        const docsById = data.reduce((acc: Record<string, any>, doc) => {
          acc[doc.document_id] = doc;
          return acc;
        }, {});
        
        setAttachedDocuments(docsById);
      } catch (err) {
        console.error('Error in document fetch:', err);
      }
    };
    
    fetchDocumentInfo();
  }, [formData.estimate_documents, formData.items]);
  
  const documentCount = (formData.estimate_documents?.length || 0) + 
    (formData.items?.filter(i => i.document_id).length || 0);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Review Your Estimate</h3>
      <div className="border rounded-md p-4">
        <EstimatePreview 
          formData={formData} 
          selectedCustomerName={selectedCustomerName}
          selectedCustomerAddress={selectedCustomerAddress}
        />
      </div>
      
      {documentCount > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h4 className="text-sm font-medium mb-4 flex items-center gap-2">
              <PaperclipIcon className="h-4 w-4" />
              Attached Documents ({documentCount})
            </h4>
            
            <div className="space-y-4">
              {formData.estimate_documents && formData.estimate_documents.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium uppercase text-muted-foreground mb-2">Estimate Documents</h5>
                  <div className="border rounded-md divide-y">
                    {formData.estimate_documents.map((docId, idx) => {
                      const docInfo = attachedDocuments[docId];
                      return (
                        <div key={idx} className="flex items-center p-3">
                          <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">{docInfo?.file_name || 'Document'}</p>
                            {docInfo?.category && (
                              <p className="text-xs text-muted-foreground">Category: {docInfo.category}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {formData.items?.filter(i => i.document_id).length > 0 && (
                <div>
                  <h5 className="text-xs font-medium uppercase text-muted-foreground mb-2">Line Item Attachments</h5>
                  <div className="border rounded-md divide-y">
                    {formData.items.filter(i => i.document_id).map((item, idx) => {
                      const docInfo = item.document_id ? attachedDocuments[item.document_id] : null;
                      return (
                        <div key={idx} className="flex items-center p-3">
                          <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
                          <div>
                            <p className="text-sm font-medium">{docInfo?.file_name || 'Document'}</p>
                            <p className="text-xs text-muted-foreground">
                              For: {item.description || `Item ${idx + 1}`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReviewStep;
