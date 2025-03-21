
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Document } from '@/components/documents/schemas/documentSchema';
import { EstimateItem } from './types/estimateTypes';
import { FileIcon, LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EstimateItemsProps {
  items: EstimateItem[];
  itemDocuments?: Record<string, Document[]>;
}

const EstimateItems: React.FC<EstimateItemsProps> = ({ items, itemDocuments = {} }) => {
  const handleOpenDocument = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead className="w-[100px] text-right">Quantity</TableHead>
            <TableHead className="w-[120px] text-right">Unit Price</TableHead>
            <TableHead className="w-[120px] text-right">Total</TableHead>
            <TableHead className="w-[120px] text-center">Type</TableHead>
            <TableHead className="w-[100px] text-center">Attachments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.description}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">
                ${item.unit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right">
                ${item.total_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-center">
                <span className="capitalize">{item.item_type || 'labor'}</span>
              </TableCell>
              <TableCell className="text-center">
                {itemDocuments[item.id] && itemDocuments[item.id].length > 0 ? (
                  <div className="flex justify-center space-x-1">
                    {itemDocuments[item.id].map((doc) => (
                      <Button 
                        key={doc.document_id} 
                        variant="ghost" 
                        size="sm"
                        title={doc.file_name}
                        onClick={() => doc.url && handleOpenDocument(doc.url)}
                        className="p-1"
                      >
                        {doc.file_type?.includes('image') ? (
                          <img 
                            src={doc.url} 
                            alt={doc.file_name} 
                            className="w-6 h-6 object-cover rounded" 
                          />
                        ) : (
                          doc.url ? <LinkIcon size={16} /> : <FileIcon size={16} />
                        )}
                      </Button>
                    ))}
                  </div>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstimateItems;
