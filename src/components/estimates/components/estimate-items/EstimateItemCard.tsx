
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { ChevronDown, ChevronUp, PaperclipIcon, FileIcon } from 'lucide-react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import ItemDescription from './ItemDescription';
import ItemTypeSelector from './ItemTypeSelector';
import VendorSelector from '@/components/documents/vendor-selector/VendorSelector';
import SubcontractorSelector from './SubcontractorSelector';
import TradeTypeSelector from './TradeTypeSelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import CostInput from './CostInput';
import MarkupInput from './MarkupInput';
import PriceDisplay from './PriceDisplay';
import MarginDisplay from './MarginDisplay';
import RemoveItemButton from './RemoveItemButton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimateItemCardProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
  subcontractors: { subid: string; subname: string }[];
  loading: boolean;
  onRemove: () => void;
  showRemoveButton: boolean;
}

// This allows us to lazily fetch document info only when needed
const AttachedDocument = memo(({ documentId }: { documentId: string }) => {
  const [docInfo, setDocInfo] = useState<{file_name?: string; file_type?: string} | null>(null);
  
  useEffect(() => {
    // Only fetch if we have a document ID
    if (!documentId) {
      setDocInfo(null);
      return;
    }
    
    const fetchDocumentInfo = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('documents')
          .select('file_name, file_type')
          .eq('document_id', documentId)
          .single();
          
        if (error) {
          console.error('Error fetching document:', error);
          return;
        }
        
        setDocInfo(data);
      } catch (error) {
        console.error('Error in document info fetch:', error);
      }
    };
    
    fetchDocumentInfo();
  }, [documentId]);
  
  return (
    <div className="mt-4 p-2 border rounded bg-blue-50 flex items-center">
      <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{docInfo?.file_name || 'Document attached'}</p>
        <p className="text-xs text-muted-foreground">{docInfo?.file_type}</p>
      </div>
    </div>
  );
});

AttachedDocument.displayName = 'AttachedDocument';

const EstimateItemCard = memo(({ 
  index, 
  vendors, 
  subcontractors, 
  loading, 
  onRemove,
  showRemoveButton 
}: EstimateItemCardProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDocumentUploadOpen, setIsDocumentUploadOpen] = useState(false);
  const form = useFormContext<EstimateFormValues>();
  
  // Get form values directly to reduce re-renders
  const values = form.getValues(`items.${index}`);
  const itemType = values?.item_type || 'labor';
  const cost = values?.cost || '0';
  const markupPercentage = values?.markup_percentage || '0';
  const quantity = values?.quantity || '1';
  const unitPrice = values?.unit_price || '0';
  const description = values?.description || '';
  const documentId = values?.document_id || '';
  const vendorId = values?.vendor_id || '';
  const subcontractorId = values?.subcontractor_id || '';
  
  // Calculate these values once instead of using multiple useWatch hooks
  const [calculatedValues, setCalculatedValues] = useState({
    itemPrice: 0,
    grossMargin: 0,
    grossMarginPercentage: 0
  });
  
  // Update calculated values when inputs change
  useEffect(() => {
    const costValue = parseFloat(cost) || 0;
    const markupValue = parseFloat(markupPercentage) || 0;
    const quantityValue = parseFloat(quantity) || 1;
    const unitPriceValue = parseFloat(unitPrice) || 0;
    
    const price = unitPriceValue * quantityValue;
    const totalCost = costValue * quantityValue;
    const margin = price - totalCost;
    const marginPercentage = price > 0 ? (margin / price) * 100 : 0;
    
    setCalculatedValues({
      itemPrice: price,
      grossMargin: margin,
      grossMarginPercentage: marginPercentage
    });
  }, [cost, markupPercentage, quantity, unitPrice]);

  const handleDocumentUploadSuccess = useCallback((docId?: string) => {
    setIsDocumentUploadOpen(false);
    if (docId) {
      form.setValue(`items.${index}.document_id`, docId);
    }
  }, [form, index]);

  const getEntityTypeForDocument = useCallback(() => {
    return 'ESTIMATE_ITEM';
  }, []);

  const getEntityIdForDocument = useCallback(() => {
    const tempId = form.getValues('temp_id') || 'pending';
    
    switch (itemType) {
      case 'vendor':
        return vendorId || tempId;
      case 'subcontractor':
        return subcontractorId || tempId;
      default:
        return tempId;
    }
  }, [form, itemType, vendorId, subcontractorId]);

  const handleAttachClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border rounded-md overflow-hidden transition-all"
    >
      <div className="p-3 bg-white flex items-center gap-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="p-1 h-8 w-8">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <div className="flex-1 font-medium truncate">
          {description || 'Untitled Item'}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">${calculatedValues.itemPrice.toFixed(2)}</span>
            {quantity !== '1' && <span> × {quantity}</span>}
          </div>
          
          <div className="text-sm text-muted-foreground hidden md:block">
            GM: {calculatedValues.grossMarginPercentage.toFixed(1)}%
          </div>
          
          {documentId ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 cursor-pointer">
                    <PaperclipIcon className="h-3 w-3" />
                    <span className="hidden sm:inline-block">Document</span>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-xs">
                    <div className="font-medium">Document attached</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Sheet open={isDocumentUploadOpen} onOpenChange={setIsDocumentUploadOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-blue-500 border-blue-200 hover:bg-blue-50 h-8"
                  onClick={handleAttachClick}
                >
                  <PaperclipIcon className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline-block">Attach</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-[90vw] sm:max-w-[600px] p-0" aria-describedby="item-document-upload-description">
                <SheetHeader className="p-6 pb-2">
                  <SheetTitle>Attach Document to Line Item</SheetTitle>
                  <SheetDescription id="item-document-upload-description">
                    Upload a document to attach to this line item.
                  </SheetDescription>
                </SheetHeader>
                
                <EnhancedDocumentUpload 
                  entityType={getEntityTypeForDocument()}
                  entityId={getEntityIdForDocument()}
                  onSuccess={handleDocumentUploadSuccess}
                  onCancel={() => setIsDocumentUploadOpen(false)}
                />
              </SheetContent>
            </Sheet>
          )}
          
          {showRemoveButton && (
            <RemoveItemButton onRemove={onRemove} showButton={true} />
          )}
        </div>
      </div>
      
      <CollapsibleContent>
        <div className="border-t p-3 bg-gray-50">
          <div className="grid grid-cols-12 gap-2 items-start">
            <ItemDescription index={index} />
            <ItemTypeSelector index={index} />
            
            {itemType === 'vendor' && (
              <>
                <VendorSelector index={index} vendors={vendors} loading={loading} />
                <ExpenseTypeSelector index={index} />
              </>
            )}

            {itemType === 'subcontractor' && (
              <>
                <SubcontractorSelector index={index} subcontractors={subcontractors} loading={loading} />
                <TradeTypeSelector index={index} />
              </>
            )}

            <CostInput index={index} />
            <MarkupInput index={index} />
            <PriceDisplay index={index} price={calculatedValues.itemPrice} />
            <MarginDisplay 
              grossMargin={calculatedValues.grossMargin} 
              grossMarginPercentage={calculatedValues.grossMarginPercentage} 
            />
          </div>
          
          {documentId && <AttachedDocument documentId={documentId} />}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
});

EstimateItemCard.displayName = 'EstimateItemCard';

export default EstimateItemCard;
