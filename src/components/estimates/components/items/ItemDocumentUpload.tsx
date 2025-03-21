
import React, { useState, useRef } from 'react';
import { Control, useController } from 'react-hook-form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';
import { FileUpload } from '@/components/ui/file-upload';
import { File, PaperclipIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

interface ItemDocumentUploadProps {
  index: number;
  control: Control<EstimateFormValues>;
  itemType: string;
}

const ItemDocumentUpload = ({ index, control, itemType }: ItemDocumentUploadProps) => {
  const { field } = useController({
    control,
    name: `items.${index}.document`,
    defaultValue: undefined,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      setSelectedFile(file);
      field.onChange(file);
      console.log(`File selected for item ${index}:`, file.name, file.type);
    }
  };
  
  const clearFile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedFile(null);
    field.onChange(undefined);
    console.log(`File cleared for item ${index}`);
  };

  const getLabelForUpload = () => {
    if (itemType === 'subcontractor') {
      return "Attach Subcontractor Estimate";
    } else if (itemType === 'vendor') {
      return "Attach Vendor Quote";
    }
    return "Attach Document";
  };

  const getDocumentCategory = () => {
    if (itemType === 'subcontractor') {
      return "subcontractor_estimate";
    } else if (itemType === 'vendor') {
      return "vendor_quote";
    }
    return "other";
  };

  const getCategoryBadgeColor = () => {
    if (itemType === 'subcontractor') {
      return "bg-purple-100 text-purple-800";
    } else if (itemType === 'vendor') {
      return "bg-blue-100 text-blue-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="mt-2">
      {!selectedFile ? (
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  className="p-0 h-auto text-sm text-[#0485ea] hover:bg-transparent hover:text-[#0373ce]"
                  onClick={() => document.getElementById(`file-upload-${index}`)?.click()}
                >
                  <PaperclipIcon className="h-3 w-3 mr-1" />
                  {getLabelForUpload()}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach a PDF, Office document, image, or other file to this item</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <div className="hidden">
            <FileUpload
              id={`file-upload-${index}`}
              onFilesSelected={handleFileSelect}
              allowCamera={true}
              allowMultiple={false}
              acceptedFileTypes="application/pdf,image/*,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip"
              className="hidden"
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center text-xs p-2 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center flex-1 min-w-0">
            <File className="h-3 w-3 mr-1 text-[#0485ea] flex-shrink-0" />
            <span className="truncate">{selectedFile.name}</span>
            
            <Badge className={`ml-2 text-[0.65rem] py-0 px-1.5 ${getCategoryBadgeColor()}`}>
              {itemType === 'subcontractor' ? 'Subcontractor Estimate' : 
               itemType === 'vendor' ? 'Vendor Quote' : 'Document'}
            </Badge>
          </div>
          <button 
            type="button" 
            onClick={clearFile}
            className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ItemDocumentUpload;
