import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { FileTextIcon, FileIcon } from 'lucide-react';
import { calculateEstimateTotals } from '../utils/estimateCalculations';

interface EstimateFormValues {
  items: any[];
  contingency_percentage?: string;
  project?: string;
  description?: string;
  isNewCustomer?: boolean;
  newCustomer?: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  showSiteLocation?: boolean;
  location?: {
    address?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

interface EstimatePreviewProps {
  formData: EstimateFormValues;
  selectedCustomerName: string | null;
  selectedCustomerAddress: string | null;
  selectedCustomerId?: string | null;
}

const EstimatePreview: React.FC<EstimatePreviewProps> = ({
  formData,
  selectedCustomerName,
  selectedCustomerAddress,
  selectedCustomerId
}) => {
  const [activeTab, setActiveTab] = useState('summary');
  
  const transformedItems = Array.isArray(formData.items) 
    ? formData.items.map(item => ({
        cost: item.cost || '0',
        markup_percentage: item.markup_percentage || '0',
        quantity: item.quantity || '1',
        unit_price: item.unit_price || '0',
        total_price: parseFloat(item.quantity || '1') * parseFloat(item.unit_price || '0')
      }))
    : [];
  
  const { subtotal, contingencyAmount, grandTotal } = calculateEstimateTotals(
    transformedItems, 
    formData.contingency_percentage || '0'
  );

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const customerName = formData.isNewCustomer
    ? formData.newCustomer?.name
    : selectedCustomerName;

  const customerAddress = formData.isNewCustomer && formData.newCustomer
    ? `${formData.newCustomer.address || ''}, ${formData.newCustomer.city || ''}, ${formData.newCustomer.state || ''} ${formData.newCustomer.zip || ''}`
    : selectedCustomerAddress;

  const jobSiteLocation = formData.showSiteLocation && formData.location
    ? `${formData.location.address || ''}, ${formData.location.city || ''}, ${formData.location.state || ''} ${formData.location.zip || ''}`
    : customerAddress;

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="summary" className="flex items-center gap-1">
            <FileTextIcon className="h-4 w-4" />
            Summary View
          </TabsTrigger>
          <TabsTrigger value="document" className="flex items-center gap-1">
            <FileIcon className="h-4 w-4" />
            Document Preview
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="m-0">
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-[#0485ea]">ESTIMATE</h2>
                    <p className="text-gray-600">Date: {formattedDate}</p>
                  </div>
                  <div className="mt-4 md:mt-0 md:text-right">
                    <h3 className="font-bold text-lg">AKC LLC</h3>
                    <p className="text-gray-600">123 Business Avenue</p>
                    <p className="text-gray-600">City, State 12345</p>
                    <p className="text-gray-600">info@akc-llc.com</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Customer:</h3>
                    <p className="font-medium">{customerName || 'N/A'}</p>
                    {customerAddress && <p className="text-gray-600">{customerAddress}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-1">Project:</h3>
                    <p className="font-medium">{formData.project || 'N/A'}</p>
                    {jobSiteLocation && jobSiteLocation !== customerAddress && (
                      <>
                        <h3 className="font-semibold text-gray-700 mt-3 mb-1">Job Site Location:</h3>
                        <p className="text-gray-600">{jobSiteLocation}</p>
                      </>
                    )}
                  </div>
                </div>
                
                {formData.description && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-1">Description:</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{formData.description}</p>
                  </div>
                )}
                
                <div className="border rounded-md overflow-hidden mb-6">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items && formData.items.map((item, index) => {
                        const cost = parseFloat(item.cost || '0') || 0;
                        const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                        const markup = cost * (markupPercentage / 100);
                        const unitPrice = cost + markup;
                        const quantity = parseFloat(item.quantity || '1') || 1;
                        const totalPrice = unitPrice * quantity;
                        
                        return (
                          <tr key={index}>
                            <td className="px-4 py-3 text-sm text-gray-900">{item.description || `Item ${index + 1}`}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">{quantity}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">${unitPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 text-right">${totalPrice.toFixed(2)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal:</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${subtotal.toFixed(2)}</td>
                      </tr>
                      {parseFloat(formData.contingency_percentage || '0') > 0 && (
                        <tr className="bg-gray-50">
                          <td colSpan={3} className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            Contingency ({formData.contingency_percentage}%):
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">${contingencyAmount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td colSpan={3} className="px-4 py-3 text-sm font-bold text-gray-900 text-right">Total:</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">${grandTotal.toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
                
                <div className="text-gray-600 text-sm">
                  <p className="font-medium mb-1">Terms & Conditions:</p>
                  <p>This estimate is valid for 30 days from the date issued.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="document" className="m-0">
          <div className="border rounded-md bg-gray-50 p-6">
            <div className="bg-white shadow-md rounded-md max-w-4xl mx-auto p-8 min-h-[60vh]">
              <div className="flex justify-between mb-8 border-b pb-6">
                <div>
                  <h1 className="text-3xl font-bold text-[#0485ea] mb-1">ESTIMATE</h1>
                  <p className="text-lg text-gray-600">#{Math.floor(Math.random() * 10000).toString().padStart(4, '0')}</p>
                  <p className="text-gray-600">Date: {formattedDate}</p>
                </div>
                <div className="text-right">
                  <img src="https://placehold.co/150x60/0485ea/FFFFFF.png?text=AKC+LLC" alt="AKC LLC Logo" className="h-12 mb-2" />
                  <p className="text-gray-600">123 Business Avenue</p>
                  <p className="text-gray-600">City, State 12345</p>
                  <p className="text-gray-600">Phone: (555) 123-4567</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="border-r pr-6">
                  <h2 className="text-gray-500 font-medium mb-2">BILL TO:</h2>
                  <p className="font-semibold">{customerName || 'N/A'}</p>
                  {customerAddress && (
                    <div className="text-gray-600">
                      {customerAddress.split(',').map((line, i) => (
                        <p key={i}>{line.trim()}</p>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="text-gray-500 font-medium mb-2">PROJECT:</h2>
                  <p className="font-semibold">{formData.project || 'N/A'}</p>
                  {jobSiteLocation && jobSiteLocation !== customerAddress && (
                    <>
                      <h2 className="text-gray-500 font-medium mt-4 mb-2">JOB SITE:</h2>
                      <div className="text-gray-600">
                        {jobSiteLocation.split(',').map((line, i) => (
                          <p key={i}>{line.trim()}</p>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              {formData.description && (
                <div className="mb-6">
                  <h2 className="text-gray-500 font-medium mb-2">DESCRIPTION:</h2>
                  <p className="text-gray-600 whitespace-pre-wrap border p-3 rounded bg-gray-50">{formData.description}</p>
                </div>
              )}
              
              <div className="mb-8">
                <table className="w-full border">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 border-b">Description</th>
                      <th className="text-right p-3 border-b">Qty</th>
                      <th className="text-right p-3 border-b">Unit Price</th>
                      <th className="text-right p-3 border-b">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items && formData.items.map((item, index) => {
                      const cost = parseFloat(item.cost || '0') || 0;
                      const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                      const markup = cost * (markupPercentage / 100);
                      const unitPrice = cost + markup;
                      const quantity = parseFloat(item.quantity || '1') || 1;
                      const totalPrice = unitPrice * quantity;
                      
                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="p-3 border-b">{item.description || `Item ${index + 1}`}</td>
                          <td className="p-3 border-b text-right">{quantity}</td>
                          <td className="p-3 border-b text-right">${unitPrice.toFixed(2)}</td>
                          <td className="p-3 border-b text-right">${totalPrice.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan={3} className="p-3 text-right font-medium">Subtotal:</td>
                      <td className="p-3 text-right font-medium">${subtotal.toFixed(2)}</td>
                    </tr>
                    {parseFloat(formData.contingency_percentage || '0') > 0 && (
                      <tr>
                        <td colSpan={3} className="p-3 text-right font-medium">
                          Contingency ({formData.contingency_percentage}%):
                        </td>
                        <td className="p-3 text-right font-medium">${contingencyAmount.toFixed(2)}</td>
                      </tr>
                    )}
                    <tr className="bg-gray-100">
                      <td colSpan={3} className="p-3 text-right font-bold">Total:</td>
                      <td className="p-3 text-right font-bold">${grandTotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="border-t pt-6">
                <h2 className="text-gray-500 font-medium mb-2">TERMS & CONDITIONS:</h2>
                <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
                  <li>This estimate is valid for 30 days from the date issued.</li>
                  <li>Payment terms: 50% deposit required to begin work, balance due upon completion.</li>
                  <li>Any additional work not specified in this estimate will require a separate quote.</li>
                </ol>
                
                <div className="mt-8 border-t pt-6 flex justify-between">
                  <div>
                    <p className="font-medium">Approved By:</p>
                    <div className="mt-4 border-b border-gray-400 w-48"></div>
                    <p className="mt-1 text-sm text-gray-500">Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">Date:</p>
                    <div className="mt-4 border-b border-gray-400 w-48"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EstimatePreview;
