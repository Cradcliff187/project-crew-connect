
import React, { useState, useEffect } from 'react';
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import EnhancedDocumentUpload from '@/components/documents/EnhancedDocumentUpload';
import { supabase } from '@/integrations/supabase/client';
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

const EstimateItemCard = ({ 
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
  
  console.log(`Rendering EstimateItemCard for index ${index} with form values:`, 
    form.getValues(`items.${index}`));
  
  const itemType = form.watch(`items.${index}.item_type`) || '';
  
  console.log(`Item type for index ${index}: ${itemType}`);
  
  const cost = useWatch({
    control: form.control,
    name: `items.${index}.cost`,
    defaultValue: '0'
  });

  const markupPercentage = useWatch({
    control: form.control,
    name: `items.${index}.markup_percentage`,
    defaultValue: '0'
  });
  
  const quantity = useWatch({
    control: form.control,
    name: `items.${index}.quantity`,
    defaultValue: '1'
  });

  const description = useWatch({
    control: form.control,
    name: `items.${index}.description`,
    defaultValue: ''
  });

  const vendorId = useWatch({
    control: form.control,
    name: `items.${index}.vendor_id`,
    defaultValue: ''
  });
  
  const subcontractorId = useWatch({
    control: form.control,
    name: `items.${index}.subcontractor_id`,
    defaultValue: ''
  });
  
  const documentId = useWatch({
    control: form.control,
    name: `items.${index}.document_id`,
    defaultValue: ''
  });

  const item = { cost, markup_percentage: markupPercentage, quantity };
  const itemPrice = calculateItemPrice(item);
  const grossMargin = calculateItemGrossMargin(item);
  const grossMarginPercentage = calculateItemGrossMarginPercentage(item);

  useEffect(() => {
    const fetchDocumentInfo = async () => {
      if (!documentId) {
        setAttachedDocument(null);
        return;
      }
      
      const { data, error } = await supabase
        .from('documents')
        .select('file_name, file_type')
        .eq('document_id', documentId)
        .single();
        
      if (error) {
        console.error('Error fetching document:', error);
        return;
      }
      
      setAttachedDocument(data);
    };
    
    fetchDocumentInfo();
  }, [documentId]);

  const handleDocumentUploadSuccess = (documentId?: string) => {
    console.log(`Document upload success for item ${index}, documentId:`, documentId);
    setIsDocumentUploadOpen(false);
    
    // Short delay to ensure state is updated properly
    setTimeout(() => {
      if (documentId) {
        form.setValue(`items.${index}.document_id`, documentId);
      }
    }, 50);
  };

  const getEntityTypeForDocument = () => {
    switch (itemType) {
      case 'vendor':
        return 'VENDOR';
      case 'subcontractor':
        return 'SUBCONTRACTOR';
      default:
        return 'ESTIMATE';
    }
  };

  const getEntityIdForDocument = () => {
    // Generate a unique entity ID for each line item to prevent document attachment conflicts
    const tempId = form.getValues('temp_id') || 'pending';
    const uniqueItemId = `${tempId}-item-${index}`;
    
    switch (itemType) {
      case 'vendor':
        return vendorId || uniqueItemId;
      case 'subcontractor':
        return subcontractorId || uniqueItemId;
      default:
        return uniqueItemId;
    }
  };

  const handleAttachClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Opening document upload for item ${index}`);
    setIsDocumentUploadOpen(true);
  };

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
            <PriceDisplay price={itemPrice} />
            <MarginDisplay grossMargin={grossMargin} grossMarginPercentage={grossMarginPercentage} />
          </div>
          
          {documentId && (
            <div className="mt-4 p-2 border rounded bg-blue-50 flex items-center">
              <FileIcon className="h-4 w-4 text-blue-500 mr-2" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachedDocument?.file_name || 'Document attached'}</p>
                <p className="text-xs text-muted-foreground">{attachedDocument?.file_type}</p>
              </div>
              <Button
                variant="ghost" 
                size="sm"
                className="text-red-500 h-8 hover:text-red-700 hover:bg-red-50"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue(`items.${index}.document_id`, '');
                }}
              >
                Remove
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default EstimateItemCard;
