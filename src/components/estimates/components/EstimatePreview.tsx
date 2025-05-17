import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  FileTextIcon,
  FileIcon,
  PrinterIcon,
  DownloadIcon,
  Maximize2Icon,
  MinimizeIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from 'lucide-react';
import { calculateEstimateTotals } from '../utils/estimateCalculations';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { calcMarkup } from '@/utils/finance';

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
  printable?: boolean;
}

const EstimatePreview: React.FC<EstimatePreviewProps> = ({
  formData,
  selectedCustomerName,
  selectedCustomerAddress,
  selectedCustomerId,
  printable = false,
}) => {
  const printableContentRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Use browser's native print functionality
  const handlePrint = () => {
    // Store original document title
    const originalTitle = document.title;

    // Set a specific title for the printed document
    document.title = `Estimate-${formData.project || 'New'}-${new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })}`;

    // Print the document
    window.print();

    // Restore original title
    document.title = originalTitle;

    toast({
      title: 'Print initiated',
      description: 'Your estimate has been sent to the printer.',
    });
  };

  // Handle export as PDF - use the same print functionality
  const handleExport = () => {
    toast({
      title: 'Export to PDF',
      description: 'To save as PDF, select "Save as PDF" in the printer options.',
    });

    setTimeout(() => {
      handlePrint();
    }, 500);
  };

  // Toggle full screen view
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);

    // If we're entering fullscreen, make document body overflow hidden
    if (!isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoomLevel(value[0]);
  };

  // Zoom in/out functions
  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const transformedItems = Array.isArray(formData.items)
    ? formData.items.map(item => ({
        cost: item.cost || '0',
        markup_percentage: item.markup_percentage || '0',
        quantity: item.quantity || '1',
        unit_price: item.unit_price || '0',
        total_price: parseFloat(item.quantity || '1') * parseFloat(item.unit_price || '0'),
      }))
    : [];

  const { subtotal, contingencyAmount, grandTotal } = calculateEstimateTotals(
    transformedItems,
    formData.contingency_percentage || '0'
  );

  const formattedDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const customerName = formData.isNewCustomer ? formData.newCustomer?.name : selectedCustomerName;

  const customerAddress =
    formData.isNewCustomer && formData.newCustomer
      ? `${formData.newCustomer.address || ''}, ${formData.newCustomer.city || ''}, ${formData.newCustomer.state || ''} ${formData.newCustomer.zip || ''}`
      : selectedCustomerAddress;

  const jobSiteLocation =
    formData.showSiteLocation && formData.location
      ? `${formData.location.address || ''}, ${formData.location.city || ''}, ${formData.location.state || ''} ${formData.location.zip || ''}`
      : customerAddress;

  // Add print styles via useEffect
  useEffect(() => {
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        /* Hide everything except the printable content */
        body * {
          visibility: hidden;
        }
        #printable-estimate, #printable-estimate * {
          visibility: visible;
          transform: scale(1) !important;
          width: 100% !important;
        }
        #printable-estimate {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          box-shadow: none;
        }
        /* Hide print and export buttons */
        .print\\:hidden {
          display: none !important;
        }
      }
    `;

    // Add to document head
    document.head.appendChild(style);

    // Cleanup on unmount
    return () => {
      document.head.removeChild(style);
      // Also cleanup fullscreen state if component unmounts
      if (isFullScreen) {
        document.body.style.overflow = '';
      }
    };
  }, [isFullScreen]);

  // Escape key to exit fullscreen
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullScreen) {
        toggleFullScreen();
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isFullScreen]);

  const containerClassName = printable ? 'print:text-black print:bg-white' : '';
  const zoomStyle = { transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' };

  // Fullscreen container markup
  if (isFullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900/80 z-50 flex flex-col">
        <div className="bg-white p-2 flex justify-between items-center shadow-md">
          <h3 className="text-lg font-semibold">Estimate Preview</h3>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 mx-4">
              <Button variant="ghost" size="sm" onClick={zoomOut} className="p-1">
                <ZoomOutIcon className="h-4 w-4" />
              </Button>
              <div className="w-32">
                <Slider
                  value={[zoomLevel]}
                  onValueChange={handleZoomChange}
                  min={50}
                  max={200}
                  step={10}
                />
              </div>
              <Button variant="ghost" size="sm" onClick={zoomIn} className="p-1">
                <ZoomInIcon className="h-4 w-4" />
              </Button>
              <span className="text-xs">{zoomLevel}%</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex items-center gap-1"
            >
              <PrinterIcon className="h-4 w-4" />
              Print
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              className="flex items-center gap-1"
            >
              <DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullScreen}
              className="flex items-center gap-1"
            >
              <MinimizeIcon className="h-4 w-4" />
              Exit Fullscreen
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          <div
            className="bg-white mx-auto shadow-lg p-6 relative transition-transform duration-100"
            style={zoomStyle}
            ref={printableContentRef}
            id="printable-estimate"
          >
            {printable ? (
              // Reuse the printable content
              <div>
                <div className="flex justify-between mb-4 border-b pb-3">
                  <div>
                    <h1 className="text-xl font-bold text-[#0485ea] mb-1">ESTIMATE</h1>
                    <p className="text-sm text-gray-600">
                      #
                      {Math.floor(Math.random() * 10000)
                        .toString()
                        .padStart(4, '0')}
                    </p>
                    <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  </div>
                  <div className="text-right">
                    <img
                      src="https://placehold.co/150x60/0485ea/FFFFFF.png?text=AKC+LLC"
                      alt="AKC LLC Logo"
                      className="h-8 mb-1"
                    />
                    <p className="text-xs text-gray-600">123 Business Avenue</p>
                    <p className="text-xs text-gray-600">City, State 12345</p>
                  </div>
                </div>

                {/* Rest of the printable content */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="border-r pr-3">
                    <h2 className="text-gray-500 font-medium text-xs mb-1">BILL TO:</h2>
                    <p className="font-semibold text-sm">{customerName || 'N/A'}</p>
                    {customerAddress && (
                      <div className="text-xs text-gray-600">
                        {customerAddress.split(',').map((line, i) => (
                          <p key={i}>{line.trim()}</p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-gray-500 font-medium text-xs mb-1">PROJECT:</h2>
                    <p className="font-semibold text-sm">{formData.project || 'N/A'}</p>
                    {jobSiteLocation && jobSiteLocation !== customerAddress && (
                      <>
                        <h2 className="text-gray-500 font-medium text-xs mt-2 mb-1">JOB SITE:</h2>
                        <div className="text-xs text-gray-600">
                          {jobSiteLocation.split(',').map((line, i) => (
                            <p key={i}>{line.trim()}</p>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {formData.description && (
                  <div className="mb-3">
                    <h2 className="text-gray-500 font-medium text-xs mb-1">DESCRIPTION:</h2>
                    <p className="text-xs text-gray-600 border p-2 rounded bg-gray-50">
                      {formData.description}
                    </p>
                  </div>
                )}

                <table className="w-full border text-sm mb-3">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-1 border-b text-xs">Description</th>
                      <th className="text-right p-1 border-b text-xs">Qty</th>
                      <th className="text-right p-1 border-b text-xs">Unit Price</th>
                      <th className="text-right p-1 border-b text-xs">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items &&
                      formData.items.map((item, index) => {
                        const cost = parseFloat(item.cost || '0') || 0;
                        const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                        const { markupAmt, finalPrice } = calcMarkup(cost, markupPercentage);
                        const unitPrice = finalPrice;
                        const quantity = parseFloat(item.quantity || '1') || 1;
                        const totalPrice = unitPrice * quantity;

                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-1 border-b text-xs">
                              {item.description || `Item ${index + 1}`}
                            </td>
                            <td className="p-1 border-b text-right text-xs">{quantity}</td>
                            <td className="p-1 border-b text-right text-xs">
                              ${unitPrice.toFixed(2)}
                            </td>
                            <td className="p-1 border-b text-right text-xs">
                              ${totalPrice.toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="p-1 text-right font-medium text-xs">
                        Subtotal:
                      </td>
                      <td className="p-1 text-right font-medium text-xs">${subtotal.toFixed(2)}</td>
                    </tr>
                    {parseFloat(formData.contingency_percentage || '0') > 0 && (
                      <tr>
                        <td colSpan={3} className="p-1 text-right font-medium text-xs">
                          Contingency ({formData.contingency_percentage}%):
                        </td>
                        <td className="p-1 text-right font-medium text-xs">
                          ${contingencyAmount.toFixed(2)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-100">
                      <td colSpan={3} className="p-1 text-right font-bold text-xs">
                        Total:
                      </td>
                      <td className="p-1 text-right font-bold text-xs">${grandTotal.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="border-t pt-2 text-xs">
                  <h2 className="text-gray-500 font-medium mb-1">TERMS & CONDITIONS:</h2>
                  <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-1">
                    <li>This estimate is valid for 30 days from the date issued.</li>
                    <li>
                      Payment terms: 50% deposit required to begin work, balance due upon
                      completion.
                    </li>
                  </ol>
                </div>
              </div>
            ) : (
              // Basic view content
              <div>
                <div className="flex flex-col md:flex-row justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#0485ea]">ESTIMATE</h2>
                    <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <h3 className="font-bold text-base">AKC LLC</h3>
                    <p className="text-sm text-gray-600">123 Business Avenue</p>
                    <p className="text-sm text-gray-600">info@akc-llc.com</p>
                  </div>
                </div>

                {/* Rest of basic view content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Customer:</h3>
                    <p className="font-medium text-sm">{customerName || 'N/A'}</p>
                    {customerAddress && <p className="text-xs text-gray-600">{customerAddress}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Project:</h3>
                    <p className="font-medium text-sm">{formData.project || 'N/A'}</p>
                    {jobSiteLocation && jobSiteLocation !== customerAddress && (
                      <>
                        <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">
                          Job Site Location:
                        </h3>
                        <p className="text-xs text-gray-600">{jobSiteLocation}</p>
                      </>
                    )}
                  </div>
                </div>

                {formData.description && (
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Description:</h3>
                    <p className="text-xs text-gray-600">{formData.description}</p>
                  </div>
                )}

                <div className="border rounded-md overflow-hidden mb-3">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Qty
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Unit Price
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items &&
                        formData.items.map((item, index) => {
                          const cost = parseFloat(item.cost || '0') || 0;
                          const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                          const { markupAmt, finalPrice } = calcMarkup(cost, markupPercentage);
                          const unitPrice = finalPrice;
                          const quantity = parseFloat(item.quantity || '1') || 1;
                          const totalPrice = unitPrice * quantity;

                          return (
                            <tr key={index}>
                              <td className="px-2 py-1 text-xs text-gray-900">
                                {item.description || `Item ${index + 1}`}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                {quantity}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                ${unitPrice.toFixed(2)}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                ${totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                        >
                          Subtotal:
                        </td>
                        <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                      {parseFloat(formData.contingency_percentage || '0') > 0 && (
                        <tr className="bg-gray-50">
                          <td
                            colSpan={3}
                            className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                          >
                            Contingency ({formData.contingency_percentage}%):
                          </td>
                          <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                            ${contingencyAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-bold text-gray-900 text-right"
                        >
                          Total:
                        </td>
                        <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                          ${grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-gray-600 text-xs">
                  <p className="font-medium mb-1">Terms & Conditions:</p>
                  <p>This estimate is valid for 30 days from the date issued.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Normal view - update to support zoom
  return (
    <div className="w-full">
      {!printable ? (
        <div className="space-y-2 px-4 py-4">
          <div className="flex justify-end mb-2 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={zoomOut} className="p-1 h-7 w-7">
              <ZoomOutIcon className="h-4 w-4" />
            </Button>
            <span className="text-xs">{zoomLevel}%</span>
            <Button variant="ghost" size="sm" onClick={zoomIn} className="p-1 h-7 w-7">
              <ZoomInIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={toggleFullScreen} className="p-1 h-7">
              <Maximize2Icon className="h-4 w-4" />
              <span className="ml-1 text-xs">Fullscreen</span>
            </Button>
          </div>

          <div style={zoomStyle} className="transition-transform duration-100">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-[#0485ea]">ESTIMATE</h2>
                    <p className="text-sm text-gray-600">Date: {formattedDate}</p>
                  </div>
                  <div className="mt-2 md:mt-0 md:text-right">
                    <h3 className="font-bold text-base">AKC LLC</h3>
                    <p className="text-sm text-gray-600">123 Business Avenue</p>
                    <p className="text-sm text-gray-600">info@akc-llc.com</p>
                  </div>
                </div>

                {/* Rest of basic view content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Customer:</h3>
                    <p className="font-medium text-sm">{customerName || 'N/A'}</p>
                    {customerAddress && <p className="text-xs text-gray-600">{customerAddress}</p>}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Project:</h3>
                    <p className="font-medium text-sm">{formData.project || 'N/A'}</p>
                    {jobSiteLocation && jobSiteLocation !== customerAddress && (
                      <>
                        <h3 className="font-semibold text-sm text-gray-700 mt-2 mb-1">
                          Job Site Location:
                        </h3>
                        <p className="text-xs text-gray-600">{jobSiteLocation}</p>
                      </>
                    )}
                  </div>
                </div>

                {formData.description && (
                  <div className="mb-3">
                    <h3 className="font-semibold text-sm text-gray-700 mb-1">Description:</h3>
                    <p className="text-xs text-gray-600">{formData.description}</p>
                  </div>
                )}

                <div className="border rounded-md overflow-hidden mb-3">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-2 py-1 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Description
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Qty
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Unit Price
                        </th>
                        <th
                          scope="col"
                          className="px-2 py-1 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {formData.items &&
                        formData.items.map((item, index) => {
                          const cost = parseFloat(item.cost || '0') || 0;
                          const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                          const { markupAmt, finalPrice } = calcMarkup(cost, markupPercentage);
                          const unitPrice = finalPrice;
                          const quantity = parseFloat(item.quantity || '1') || 1;
                          const totalPrice = unitPrice * quantity;

                          return (
                            <tr key={index}>
                              <td className="px-2 py-1 text-xs text-gray-900">
                                {item.description || `Item ${index + 1}`}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                {quantity}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                ${unitPrice.toFixed(2)}
                              </td>
                              <td className="px-2 py-1 text-xs text-gray-900 text-right">
                                ${totalPrice.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                        >
                          Subtotal:
                        </td>
                        <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                          ${subtotal.toFixed(2)}
                        </td>
                      </tr>
                      {parseFloat(formData.contingency_percentage || '0') > 0 && (
                        <tr className="bg-gray-50">
                          <td
                            colSpan={3}
                            className="px-2 py-1 text-xs font-medium text-gray-900 text-right"
                          >
                            Contingency ({formData.contingency_percentage}%):
                          </td>
                          <td className="px-2 py-1 text-xs font-medium text-gray-900 text-right">
                            ${contingencyAmount.toFixed(2)}
                          </td>
                        </tr>
                      )}
                      <tr className="bg-gray-50">
                        <td
                          colSpan={3}
                          className="px-2 py-1 text-xs font-bold text-gray-900 text-right"
                        >
                          Total:
                        </td>
                        <td className="px-2 py-1 text-xs font-bold text-gray-900 text-right">
                          ${grandTotal.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div className="text-gray-600 text-xs">
                  <p className="font-medium mb-1">Terms & Conditions:</p>
                  <p>This estimate is valid for 30 days from the date issued.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div
          ref={printableContentRef}
          id="printable-estimate"
          className="bg-white mx-auto p-6 border"
          style={zoomStyle}
        >
          <div>
            <div className="flex justify-between mb-4 border-b pb-3">
              <div>
                <h1 className="text-xl font-bold text-[#0485ea] mb-1">ESTIMATE</h1>
                <p className="text-sm text-gray-600">
                  #
                  {Math.floor(Math.random() * 10000)
                    .toString()
                    .padStart(4, '0')}
                </p>
                <p className="text-sm text-gray-600">Date: {formattedDate}</p>
              </div>
              <div className="text-right">
                <img
                  src="https://placehold.co/150x60/0485ea/FFFFFF.png?text=AKC+LLC"
                  alt="AKC LLC Logo"
                  className="h-8 mb-1"
                />
                <p className="text-xs text-gray-600">123 Business Avenue</p>
                <p className="text-xs text-gray-600">City, State 12345</p>
              </div>
            </div>

            {/* Customer and project details */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="border-r pr-3">
                <h2 className="text-gray-500 font-medium text-xs mb-1">BILL TO:</h2>
                <p className="font-semibold text-sm">{customerName || 'N/A'}</p>
                {customerAddress && (
                  <div className="text-xs text-gray-600">
                    {customerAddress.split(',').map((line, i) => (
                      <p key={i}>{line.trim()}</p>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-gray-500 font-medium text-xs mb-1">PROJECT:</h2>
                <p className="font-semibold text-sm">{formData.project || 'N/A'}</p>
                {jobSiteLocation && jobSiteLocation !== customerAddress && (
                  <>
                    <h2 className="text-gray-500 font-medium text-xs mt-2 mb-1">JOB SITE:</h2>
                    <div className="text-xs text-gray-600">
                      {jobSiteLocation.split(',').map((line, i) => (
                        <p key={i}>{line.trim()}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {formData.description && (
              <div className="mb-3">
                <h2 className="text-gray-500 font-medium text-xs mb-1">DESCRIPTION:</h2>
                <p className="text-xs text-gray-600 border p-2 rounded bg-gray-50">
                  {formData.description}
                </p>
              </div>
            )}

            <table className="w-full border text-sm mb-3">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-1 border-b text-xs">Description</th>
                  <th className="text-right p-1 border-b text-xs">Qty</th>
                  <th className="text-right p-1 border-b text-xs">Unit Price</th>
                  <th className="text-right p-1 border-b text-xs">Amount</th>
                </tr>
              </thead>
              <tbody>
                {formData.items &&
                  formData.items.map((item, index) => {
                    const cost = parseFloat(item.cost || '0') || 0;
                    const markupPercentage = parseFloat(item.markup_percentage || '0') || 0;
                    const { markupAmt, finalPrice } = calcMarkup(cost, markupPercentage);
                    const unitPrice = finalPrice;
                    const quantity = parseFloat(item.quantity || '1') || 1;
                    const totalPrice = unitPrice * quantity;

                    return (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-1 border-b text-xs">
                          {item.description || `Item ${index + 1}`}
                        </td>
                        <td className="p-1 border-b text-right text-xs">{quantity}</td>
                        <td className="p-1 border-b text-right text-xs">${unitPrice.toFixed(2)}</td>
                        <td className="p-1 border-b text-right text-xs">
                          ${totalPrice.toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="p-1 text-right font-medium text-xs">
                    Subtotal:
                  </td>
                  <td className="p-1 text-right font-medium text-xs">${subtotal.toFixed(2)}</td>
                </tr>
                {parseFloat(formData.contingency_percentage || '0') > 0 && (
                  <tr>
                    <td colSpan={3} className="p-1 text-right font-medium text-xs">
                      Contingency ({formData.contingency_percentage}%):
                    </td>
                    <td className="p-1 text-right font-medium text-xs">
                      ${contingencyAmount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr className="bg-gray-100">
                  <td colSpan={3} className="p-1 text-right font-bold text-xs">
                    Total:
                  </td>
                  <td className="p-1 text-right font-bold text-xs">${grandTotal.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div className="border-t pt-2 text-xs">
              <h2 className="text-gray-500 font-medium mb-1">TERMS & CONDITIONS:</h2>
              <ol className="list-decimal pl-5 text-xs text-gray-600 space-y-1">
                <li>This estimate is valid for 30 days from the date issued.</li>
                <li>
                  Payment terms: 50% deposit required to begin work, balance due upon completion.
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EstimatePreview;
