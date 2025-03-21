
import React from 'react';
import { FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Document } from '@/components/documents/schemas/documentSchema';

interface EstimateItemsProps {
  items: {
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    item_type?: string;
    document_id?: string;
  }[];
  itemDocuments?: Record<string, Document[]>;
}

const EstimateItems: React.FC<EstimateItemsProps> = ({ items, itemDocuments = {} }) => {
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Helper to get item type display text
  const getItemTypeDisplay = (type?: string) => {
    switch (type) {
      case 'labor':
        return 'Labor';
      case 'vendor':
        return 'Material';
      case 'subcontractor':
        return 'Subcontractor';
      default:
        return 'Other';
    }
  };

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Type</th>
              <th className="px-4 py-2 text-right">Quantity</th>
              <th className="px-4 py-2 text-right">Unit Price</th>
              <th className="px-4 py-2 text-right">Total</th>
              <th className="px-4 py-2 text-center">Documents</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-3">{item.description}</td>
                <td className="px-4 py-3">{getItemTypeDisplay(item.item_type)}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.unit_price)}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(item.total_price)}</td>
                <td className="px-4 py-3 text-center">
                  {itemDocuments[item.id] && itemDocuments[item.id].length > 0 ? (
                    <div className="flex justify-center">
                      {itemDocuments[item.id].map((doc) => (
                        <a 
                          key={doc.document_id}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={doc.file_name}
                        >
                          <Button variant="ghost" size="sm" className="text-[#0485ea]">
                            <FileText className="h-4 w-4 mr-1" />
                            <Download className="h-4 w-4" />
                          </Button>
                        </a>
                      ))}
                    </div>
                  ) : item.document_id ? (
                    <div className="flex justify-center">
                      <Button variant="ghost" size="sm" className="text-[#0485ea]" disabled>
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimateItems;
