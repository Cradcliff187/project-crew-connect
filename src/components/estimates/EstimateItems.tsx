
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstimateItem } from "./types/estimateTypes";
import { Document } from "@/components/documents/schemas/documentSchema";
import { DownloadIcon, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EstimateItemsProps {
  items: EstimateItem[];
  itemDocuments?: Record<string, Document[]>;
}

const EstimateItems = ({ items, itemDocuments = {} }: EstimateItemsProps) => {
  // Function to get type label with appropriate styling
  const getTypeLabel = (itemType: string | undefined) => {
    const type = itemType || 'labor';
    
    switch (type.toLowerCase()) {
      case 'labor':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Labor</Badge>;
      case 'vendor':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Material</Badge>;
      case 'subcontractor':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Subcontractor</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Helper to format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper to format percentage
  const formatPercentage = (percentage: number | undefined) => {
    if (percentage === undefined) return '0.0%';
    return `${percentage.toFixed(1)}%`;
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Quantity</TableHead>
            <TableHead className="text-right">Unit Price</TableHead>
            <TableHead className="text-right">Total</TableHead>
            {/* Show margin info if available in any item */}
            {items.some(item => item.gross_margin !== undefined) && (
              <TableHead className="text-right">Margin</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                No items found for this estimate.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              // Get documents associated with this item
              const docs = itemDocuments[item.id] || [];
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.description}</div>
                    {docs.length > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        {docs.map(doc => (
                          <a 
                            key={doc.document_id}
                            href={`/storage/v1/object/public/construction_documents/${doc.storage_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
                          >
                            <FileIcon className="h-3 w-3 mr-1" />
                            {doc.file_name}
                            <DownloadIcon className="h-3 w-3 ml-1" />
                          </a>
                        ))}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getTypeLabel(item.item_type)}</TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.total_price)}</TableCell>
                  {items.some(item => item.gross_margin !== undefined) && (
                    <TableCell className="text-right">
                      {item.gross_margin !== undefined && (
                        <>
                          {formatCurrency(item.gross_margin)} 
                          <span className="text-xs ml-1 text-muted-foreground">
                            ({formatPercentage(item.gross_margin_percentage)})
                          </span>
                        </>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default EstimateItems;
