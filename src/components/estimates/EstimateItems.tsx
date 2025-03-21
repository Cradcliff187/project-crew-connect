
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstimateItem } from "./types/estimateTypes";
import { Document } from "@/components/documents/schemas/documentSchema";
import { DownloadIcon, FileIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface EstimateItemsProps {
  items: EstimateItem[];
  itemDocuments?: Record<string, Document[]>;
}

const EstimateItems = ({ items, itemDocuments = {} }: EstimateItemsProps) => {
  const [vendorNames, setVendorNames] = useState<Record<string, string>>({});
  const [subcontractorNames, setSubcontractorNames] = useState<Record<string, string>>({});
  
  // Fetch vendor and subcontractor names for display
  useEffect(() => {
    const fetchAssociatedData = async () => {
      // Extract unique vendor IDs
      const vendorIds = items
        .filter(item => item.vendor_id)
        .map(item => item.vendor_id as string);
      
      // Extract unique subcontractor IDs
      const subcontractorIds = items
        .filter(item => item.subcontractor_id)
        .map(item => item.subcontractor_id as string);
      
      // Fetch vendor names if there are any vendor IDs
      if (vendorIds.length > 0) {
        const { data: vendorData } = await supabase
          .from('vendors')
          .select('vendorid, vendorname')
          .in('vendorid', vendorIds);
        
        if (vendorData) {
          const vendorMap: Record<string, string> = {};
          vendorData.forEach(vendor => {
            vendorMap[vendor.vendorid] = vendor.vendorname;
          });
          setVendorNames(vendorMap);
        }
      }
      
      // Fetch subcontractor names if there are any subcontractor IDs
      if (subcontractorIds.length > 0) {
        const { data: subData } = await supabase
          .from('subcontractors')
          .select('subid, subname')
          .in('subid', subcontractorIds);
        
        if (subData) {
          const subMap: Record<string, string> = {};
          subData.forEach(sub => {
            subMap[sub.subid] = sub.subname;
          });
          setSubcontractorNames(subMap);
        }
      }
    };
    
    fetchAssociatedData();
  }, [items]);

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
              // Get vendor or subcontractor name if applicable
              const vendorName = item.vendor_id ? vendorNames[item.vendor_id] : null;
              const subcontractorName = item.subcontractor_id ? subcontractorNames[item.subcontractor_id] : null;
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div>{item.description}</div>
                    
                    {/* Show vendor or subcontractor info if available */}
                    {(vendorName || subcontractorName) && (
                      <div className="text-xs text-gray-500 mt-1">
                        {vendorName && <span>Vendor: {vendorName}</span>}
                        {subcontractorName && <span>Subcontractor: {subcontractorName}</span>}
                      </div>
                    )}
                    
                    {/* Show associated documents */}
                    {docs.length > 0 && (
                      <div className="mt-1 flex items-center gap-2">
                        {docs.map(doc => (
                          <a 
                            key={doc.document_id}
                            href={doc.url || `https://zrxezqllmpdlhiudutme.supabase.co/storage/v1/object/public/construction_documents/${doc.storage_path}`}
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
