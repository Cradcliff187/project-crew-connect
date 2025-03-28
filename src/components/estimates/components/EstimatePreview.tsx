import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { EstimateFormValues, EstimateItem } from '../schemas/estimateFormSchema';
import { calculateEstimateTotals } from '../utils/estimateCalculations';
import { supabase } from '@/integrations/supabase/client';
import { Document } from '@/components/documents/schemas/documentSchema';
import { FileIcon, PaperclipIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface EstimatePreviewProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
}

const EstimatePreview: React.FC<EstimatePreviewProps> = ({ 
  formData,
  selectedCustomerName,
  selectedCustomerAddress
}) => {
  const [customerName, setCustomerName] = React.useState('');
  const [customerAddress, setCustomerAddress] = React.useState('');
  const [attachedDocuments, setAttachedDocuments] = useState<Document[]>([]);
  const [lineItemDocuments, setLineItemDocuments] = useState<{[key: string]: Document}>({});
  
  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };
  
  // Get customer info
  useEffect(() => {
    if (formData.isNewCustomer && formData.newCustomer?.name) {
      setCustomerName(formData.newCustomer.name);
      
      const address = [
        formData.newCustomer.address,
        formData.newCustomer.city,
        formData.newCustomer.state,
        formData.newCustomer.zip
      ].filter(Boolean).join(', ');
      
      setCustomerAddress(address);
    } else {
      setCustomerName(selectedCustomerName || '');
      setCustomerAddress(selectedCustomerAddress || '');
    }
  }, [formData, selectedCustomerName, selectedCustomerAddress]);
  
  // Convert form items to calculation items with required properties
  const calculationItems: EstimateItem[] = formData.items.map(item => ({
    cost: item.cost || '0',
    markup_percentage: item.markup_percentage || '0',
    quantity: item.quantity || '1',
    item_type: item.item_type
  }));
  
  // Calculate totals
  const { 
    totalPrice, 
    contingencyAmount, 
    grandTotal 
  } = calculateEstimateTotals(calculationItems, formData.contingency_percentage || '0');
  
  // Fetch document information
  useEffect(() => {
    const fetchDocuments = async () => {
      // First fetch estimate-level documents
      if (formData.estimate_documents && formData.estimate_documents.length > 0) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .in('document_id', formData.estimate_documents);
          
        if (!error && data) {
          setAttachedDocuments(data);
        }
      }
      
      // Then fetch line item documents
      const itemDocumentIds = formData.items
        .filter(item => item.document_id)
        .map(item => item.document_id);
        
      if (itemDocumentIds.length > 0) {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .in('document_id', itemDocumentIds);
          
        if (!error && data) {
          const documentsMap: {[key: string]: Document} = {};
          data.forEach(doc => {
            documentsMap[doc.document_id] = doc;
          });
          setLineItemDocuments(documentsMap);
        }
      }
    };
    
    fetchDocuments();
  }, [formData]);
  
  return (
    <div className="space-y-6">
      {/* AKC Information (Hardcoded for the example) */}
      <div className="flex flex-col items-start">
        <h2 className="text-xl font-bold text-[#0485ea]">AKC LLC</h2>
        <p className="text-sm text-gray-600">123 Company Street, City, State ZIP</p>
        <p className="text-sm text-gray-600">Phone: (555) 123-4567</p>
        <p className="text-sm text-gray-600">Email: info@akc-llc.com</p>
      </div>
      
      <Separator />
      
      {/* Estimate Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-md font-medium mb-2">Project</h3>
          <p className="text-lg font-bold">{formData.project}</p>
          {formData.description && (
            <p className="text-sm text-gray-600 mt-2">{formData.description}</p>
          )}
        </div>
        
        <div>
          <h3 className="text-md font-medium mb-2">Customer</h3>
          <p className="text-lg font-bold">{customerName}</p>
          {customerAddress && (
            <p className="text-sm text-gray-600">{customerAddress}</p>
          )}
        </div>
      </div>
      
      {/* Attached Documents Section */}
      {attachedDocuments.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <PaperclipIcon className="h-4 w-4 text-[#0485ea]" />
            <h3 className="text-md font-medium">Attached Documents</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachedDocuments.map(doc => (
              <div key={doc.document_id} className="flex items-center gap-2 text-sm border rounded p-2">
                <FileIcon className="h-4 w-4 text-[#0485ea]" />
                <span className="truncate">{doc.file_name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Site Location */}
      {formData.showSiteLocation && (
        <div>
          <h3 className="text-md font-medium mb-2">Site Location</h3>
          <p className="text-sm text-gray-600">
            {[
              formData.location?.address,
              formData.location?.city,
              formData.location?.state,
              formData.location?.zip
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}
      
      <Separator />
      
      {/* Line Items */}
      <div>
        <h3 className="text-md font-medium mb-2">Items</h3>
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="text-left p-3">Description</th>
                  <th className="text-right p-3">Quantity</th>
                  <th className="text-right p-3">Unit Price</th>
                  <th className="text-right p-3">Total</th>
                  <th className="text-center p-3 w-10">Docs</th>
                </tr>
              </thead>
              <tbody>
                {formData.items.map((item, index) => {
                  const cost = parseFloat(item.cost) || 0;
                  const markup = cost * (parseFloat(item.markup_percentage) / 100) || 0;
                  const unitPrice = cost + markup;
                  const quantity = parseFloat(item.quantity || '1') || 1;
                  const total = unitPrice * quantity;
                  
                  return (
                    <tr key={index} className="border-t">
                      <td className="p-3">
                        <div className="font-medium">{item.description}</div>
                        {item.item_type !== 'labor' && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.item_type === 'vendor' ? 'Vendor' : 'Subcontractor'}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-right">{quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(unitPrice)}</td>
                      <td className="p-3 text-right">{formatCurrency(total)}</td>
                      <td className="p-3 text-center">
                        {item.document_id && lineItemDocuments[item.document_id] && (
                          <Badge variant="outline" className="bg-blue-50">
                            <PaperclipIcon className="h-3 w-3" />
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 font-medium">
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right">Subtotal</td>
                  <td className="p-3 text-right">{formatCurrency(totalPrice)}</td>
                  <td></td>
                </tr>
                {parseFloat(formData.contingency_percentage || '0') > 0 && (
                  <tr className="border-t">
                    <td colSpan={3} className="p-3 text-right">
                      Contingency ({formData.contingency_percentage}%)
                    </td>
                    <td className="p-3 text-right">{formatCurrency(contingencyAmount)}</td>
                    <td></td>
                  </tr>
                )}
                <tr className="border-t">
                  <td colSpan={3} className="p-3 text-right font-bold">
                    Total
                  </td>
                  <td className="p-3 text-right font-bold">{formatCurrency(grandTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </CardContent>
        </Card>
      </div>
      
      {/* Total Documents Count */}
      <div className="flex justify-end">
        {(attachedDocuments.length > 0 || Object.keys(lineItemDocuments).length > 0) && (
          <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
            <PaperclipIcon className="h-3 w-3" />
            <span>
              {attachedDocuments.length + Object.keys(lineItemDocuments).length} 
              Document{(attachedDocuments.length + Object.keys(lineItemDocuments).length) !== 1 ? 's' : ''} Attached
            </span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default EstimatePreview;
