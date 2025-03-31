
import React, { useState, useEffect, useRef, memo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { ChevronDown, ChevronUp, PaperclipIcon, FileIcon, FileTextIcon } from 'lucide-react';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import ItemDescription from './ItemDescription';
import ItemTypeSelector from './ItemTypeSelector';
import VendorSelector from './VendorSelector';
import SubcontractorSelector from './SubcontractorSelector';
import TradeTypeSelector from './TradeTypeSelector';
import ExpenseTypeSelector from './ExpenseTypeSelector';
import CostInput from './CostInput';
import MarkupInput from './MarkupInput';
import PriceDisplay from './PriceDisplay';
import MarginDisplay from './MarginDisplay';
import RemoveItemButton from './RemoveItemButton';
import { 
  calculateItemPrice, 
  calculateItemGrossMargin, 
  calculateItemGrossMarginPercentage 
} from '../../utils/estimateCalculations';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import DocumentUploadSheet from '../document-upload/DocumentUploadSheet';

interface EstimateItemCardProps {
  index: number;
  vendors: { vendorid: string; vendorname: string }[];
  subcontractors: { subid: string; subname: string }[];
  loading: boolean;
  onRemove: () => void;
  showRemoveButton: boolean;
}

// Use React.memo to prevent unnecessary re-renders
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
  const [attachedDocument, setAttachedDocument] = useState<{file_name?: string; file_type?: string} | null>(null);
  const form = useFormContext<EstimateFormValues>();
  
  // Use a stable ID based on a ref to ensure it doesn't change on re-renders
  const stableIdRef = useRef(`estimate-item-${index}-${Math.random().toString(36).substr(2, 9)}`);
  const stableId = stableIdRef.current;
  
  // Optimize form watching - only watch what we need
  const formValues = useWatch({
    control: form.control,
    name: `items.${index}`,
    defaultValue: { 
      cost: '0', 
      markup_percentage: '0', 
      quantity: '1',
      description: '',
      item_type: '',
      vendor_id: '',
      subcontractor_id: '',
      document_id: ''
    }
  });
  
  const { 
    cost, 
    markup_percentage: markupPercentage, 
    quantity, 
    description, 
    item_type: itemType,
    vendor_id: vendorId,
    subcontractor_id: subcontractorId,
    document_id: documentId
  } = formValues;

  // Memoize calculations to reduce render cycles
  const item = { cost, markup_percentage: markupPercentage, quantity };
  const itemPrice = React.useMemo(() => calculateItemPrice(item), [cost, markupPercentage, quantity]);
  const grossMargin = React.useMemo(() => calculateItemGrossMargin(item), [cost, markupPercentage, quantity]);
  const grossMarginPercentage = React.useMemo(() => calculateItemGrossMarginPercentage(item), [cost, markupPercentage, quantity]);

  // Only fetch document info when documentId changes and is not empty
  useEffect(() => {
    let isMounted = true;
    
    const fetchDocumentInfo = async () => {
      if (!documentId) {
        if (isMounted) setAttachedDocument(null);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('file_name, file_type')
          .eq('document_id', documentId)
          .single();
          
        if (error || !data) {
          console.error('Error fetching document:', error);
          return;
        }
        
        if (isMounted) {
          setAttachedDocument(data);
        }
      } catch (err) {
        console.error(`Error fetching document info: ${err}`);
      }
    };
    
    fetchDocumentInfo();
    
    return () => {
      isMounted = false;
    };
  }, [documentId]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    // Close the document upload sheet
    setIsDocumentUploadOpen(false);
    
    // Only update form if we got a documentId
    if (documentId) {
      // Use direct setValue with minimal options to prevent re-renders
      form.setValue(`items.${index}.document_id`, documentId, {
        shouldDirty: true,
        shouldValidate: false
      });
    }
  };

  // Stable callbacks to prevent re-renders
  const handleAttachClick = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  const handleRemoveDocument = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    form.setValue(`items.${index}.document_id`, '', {
      shouldDirty: true,
      shouldValidate: false
    });
    setAttachedDocument(null);
  }, [form, index]);

  const openDocumentUpload = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDocumentUploadOpen(true);
  }, []);

  // Get tempId for document upload once and store it
  const tempId = form.getValues('temp_id') || 'pending';

  // Only re-render price and margin calculations when their inputs change
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
            <span className="font-medium">${itemPrice.toFixed(2)}</span>
            {quantity !== '1' && <span> × {quantity}</span>}
          </div>
          
          <div className="text-sm text-muted-foreground hidden md:block">
            GM: {grossMarginPercentage.toFixed(1)}%
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
                    <div className="font-medium">{attachedDocument?.file_name || 'Document attached'}</div>
                    <div className="text-muted-foreground">{attachedDocument?.file_type}</div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-blue-500 border-blue-200 hover:bg-blue-50 h-8"
              onClick={openDocumentUpload}
            >
              <PaperclipIcon className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline-block">Attach</span>
            </Button>
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
            <PriceDisplay price={itemPrice} />
            <MarginDisplay grossMargin={grossMargin} grossMarginPercentage={grossMarginPercentage} />
          </div>
          
          {documentId && attachedDocument && (
            <div className="mt-4 p-2 border rounded bg-blue-50 flex items-center">
              <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachedDocument.file_name || 'Document attached'}</p>
                <p className="text-xs text-muted-foreground">{attachedDocument.file_type}</p>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="text-red-500 h-8 hover:text-red-700 hover:bg-red-50"
                onClick={handleRemoveDocument}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
      
      {/* Document Upload Sheet - Controlled manually instead of with SheetTrigger */}
      <DocumentUploadSheet 
        isOpen={isDocumentUploadOpen}
        onClose={() => setIsDocumentUploadOpen(false)}
        tempId={tempId}
        entityType="ESTIMATE_ITEM"
        itemId={`${index}`}
        onSuccess={handleDocumentUploadSuccess}
        title="Attach Document to Line Item"
      />
    </Collapsible>
  );
});

// Add display name for React DevTools
EstimateItemCard.displayName = 'EstimateItemCard';

export default EstimateItemCard;
