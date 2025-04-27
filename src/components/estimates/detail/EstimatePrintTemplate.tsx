import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EstimateType } from '../EstimatesTable';
import { EstimateItem, EstimateRevision } from '../types/estimateTypes';

interface EstimatePrintTemplateProps {
  estimate: EstimateType;
  items: EstimateItem[];
  revision?: EstimateRevision;
}

const EstimatePrintTemplate: React.FC<EstimatePrintTemplateProps> = ({
  estimate,
  items,
  revision,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);

  // Use the contingency percentage from the revision, estimate, or default to 0
  const contingencyPercentage =
    revision?.contingency_percentage ?? estimate.contingency_percentage ?? 0;

  console.log(`EstimatePrintTemplate using contingency: ${contingencyPercentage}%`);

  // Calculate contingency amount based on actual percentage
  const contingencyAmount = subtotal * (Number(contingencyPercentage) / 100);
  const total = subtotal + contingencyAmount;

  return (
    <div className="print-template p-6 bg-white">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0485ea]">
            ESTIMATE {revision && <span className="text-lg">Revision {revision.version}</span>}
          </h1>
          <p className="text-gray-600">#{estimate.id}</p>
          <p className="text-gray-600">
            Date: {formatDate(revision?.revision_date || estimate.date)}
          </p>
          {revision && revision.version > 1 && (
            <p className="text-gray-600">Original Estimate Date: {formatDate(estimate.date)}</p>
          )}
        </div>
        <div className="text-right">
          <h2 className="text-xl font-bold">AKC LLC</h2>
          <p className="text-gray-600">123 Business Avenue</p>
          <p className="text-gray-600">City, State 12345</p>
          <p className="text-gray-600">info@akc-llc.com</p>
        </div>
      </div>

      {/* Client & Project Info */}
      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
          <p className="font-medium">{estimate.client}</p>
          {estimate.location && (
            <div className="text-gray-600">
              {estimate.location.address && <p>{estimate.location.address}</p>}
              <p>
                {estimate.location.city && `${estimate.location.city}, `}
                {estimate.location.state && `${estimate.location.state} `}
                {estimate.location.zip}
              </p>
            </div>
          )}
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Project:</h3>
          <p className="font-medium">{estimate.project}</p>

          {/* If job site location is different from client location */}
          {estimate.location && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Job Site:</h3>
              <div className="text-gray-600">
                {estimate.location.address && <p>{estimate.location.address}</p>}
                <p>
                  {estimate.location.city && `${estimate.location.city}, `}
                  {estimate.location.state && `${estimate.location.state} `}
                  {estimate.location.zip}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Revision Notes */}
      {revision && revision.notes && (
        <div className="mb-8 p-4 border-l-4 border-[#0485ea] bg-blue-50">
          <h3 className="font-semibold text-gray-700 mb-2">Revision Notes:</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{revision.notes}</p>
        </div>
      )}

      {/* Description */}
      {estimate.description && (
        <div className="mb-8">
          <h3 className="font-semibold text-gray-700 mb-2">Description:</h3>
          <p className="text-gray-600 whitespace-pre-wrap">{estimate.description}</p>
        </div>
      )}

      {/* Items Table */}
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
            {items.map((item, index) => (
              <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="p-3 border-b">{item.description}</td>
                <td className="p-3 border-b text-right">{item.quantity}</td>
                <td className="p-3 border-b text-right">{formatCurrency(item.unit_price)}</td>
                <td className="p-3 border-b text-right">{formatCurrency(item.total_price)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-3 text-right font-medium">
                Subtotal:
              </td>
              <td className="p-3 text-right font-medium">{formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td colSpan={3} className="p-3 text-right font-medium">
                Contingency ({contingencyPercentage}%):
              </td>
              <td className="p-3 text-right font-medium">{formatCurrency(contingencyAmount)}</td>
            </tr>
            <tr className="bg-gray-100">
              <td colSpan={3} className="p-3 text-right font-bold">
                Total:
              </td>
              <td className="p-3 text-right font-bold">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Terms & Conditions */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-gray-700 mb-2">Terms & Conditions:</h3>
        <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
          <li>This estimate is valid for 30 days from the date issued.</li>
          <li>Payment terms: 50% deposit required to begin work, balance due upon completion.</li>
          <li>Any additional work not specified in this estimate will require a separate quote.</li>
        </ol>

        <div className="mt-8 pt-6 flex justify-between">
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
  );
};

export default EstimatePrintTemplate;
