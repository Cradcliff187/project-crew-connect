
// src/components/estimates/components/estimate-items/EstimateItemCard.tsx
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, FileText, Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import EnhancedDocumentUpload from "@/components/documents/EnhancedDocumentUpload";
import { toast } from "@/hooks/use-toast";
import { EntityType, Document } from "@/components/documents/schemas/documentSchema";
import { EstimateItem } from "@/components/estimates/types";

interface EstimateItemCardProps {
  item: EstimateItem;
  onEdit: (itemId: string) => void;
  onDelete: (itemId: string) => void;
  onDocumentAdded?: (itemId: string) => void;
}

const EstimateItemCard: React.FC<EstimateItemCardProps> = ({
  item,
  onEdit,
  onDelete,
  onDocumentAdded
}) => {
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);

  // Calculate profit and margin
  const cost = item.cost || 0;
  const totalPrice = item.total_price || 0;
  const profit = totalPrice - cost;
  const margin = totalPrice > 0 ? (profit / totalPrice) * 100 : 0;

  // Get badge color based on item type
  const getBadgeColor = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'material':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'labor':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'subcontractor':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'equipment':
        return 'bg-amber-100 text-amber-800 hover:bg-amber-200';
      case 'other':
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  // Handle document upload success
  const handleDocumentUploadSuccess = (documentId?: string) => {
    setIsDocumentUploadOpen(false);
    
    if (documentId) {
      toast({
        title: 'Document added',
        description: 'Document has been successfully attached to this line item',
      });
      
      if (onDocumentAdded) {
        onDocumentAdded(item.id);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="p-4 border-b">
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-1">
              <Badge className={getBadgeColor(item.item_type)} variant="outline">
                {item.item_type || 'Other'}
              </Badge>
              <h3 className="font-medium text-base line-clamp-2">{item.description}</h3>
            </div>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={() => onEdit(item.id)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-destructive"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
            <div>
              <p className="text-muted-foreground">Quantity</p>
              <p>{item.quantity}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Unit Price</p>
              <p>{formatCurrency(item.unit_price || 0)}</p>
            </div>
            {item.cost !== undefined && (
              <>
                <div>
                  <p className="text-muted-foreground">Cost</p>
                  <p>{formatCurrency(cost)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Margin</p>
                  <p>{margin.toFixed(1)}%</p>
                </div>
              </>
            )}
          </div>
          
          <div className="mt-3 pt-2 border-t">
            <div className="flex justify-between items-center">
              <p className="font-medium">Total</p>
              <p className="font-semibold text-lg">{formatCurrency(item.total_price || 0)}</p>
            </div>
          </div>
        </div>
        
        <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
          <div className="flex items-center text-sm text-muted-foreground">
            <FileText className="h-4 w-4 mr-1" />
            {item.document_id ? "Has specifications" : "No documents"}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs"
            onClick={() => setIsDocumentUploadOpen(true)}
          >
            <Paperclip className="h-3 w-3 mr-1" />
            Add Doc
          </Button>
        </div>
      </CardContent>
      
      <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
        <SheetContent className="w-[90vw] sm:max-w-[600px] p-0">
          <SheetHeader className="p-6 pb-2">
            <SheetTitle>Add Document to Line Item</SheetTitle>
            <SheetDescription>
              Upload specifications or other documentation for this estimate line item.
            </SheetDescription>
          </SheetHeader>
          
          <EnhancedDocumentUpload
            entityType={EntityType.ESTIMATE_ITEM}
            entityId={item.id}
            onSuccess={handleDocumentUploadSuccess}
            onCancel={() => setIsDocumentUploadOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default EstimateItemCard;
