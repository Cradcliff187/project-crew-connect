
import { useState } from 'react';
import { Control, useController } from 'react-hook-form';
import { PaperclipIcon, FileIcon, XIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/ui/file-upload';
import { FormItem, FormLabel } from '@/components/ui/form';
import { EstimateFormValues } from '../../schemas/estimateFormSchema';

interface ItemDocumentUploadProps {
  index: number;
  control: Control<EstimateFormValues>;
  itemType: string;
}

const ItemDocumentUpload = ({ index, control, itemType }: ItemDocumentUploadProps) => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { field } = useController({
    control,
    name: `items.${index}.document`,
    defaultValue: undefined,
  });

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      field.onChange(files[0]);
      setIsUploadOpen(false);
    }
  };

  const clearFile = () => {
    field.onChange(undefined);
  };

  // Render a different message based on item type
  const getUploadLabel = () => {
    if (itemType === 'subcontractor') {
      return "Attach subcontractor's estimate";
    } else if (itemType === 'vendor') {
      return "Attach vendor's quote";
    }
    return "Attach supporting document";
  };

  return (
    <div className="mt-2">
      {!field.value && !isUploadOpen ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-xs"
          onClick={() => setIsUploadOpen(true)}
        >
          <PaperclipIcon className="h-3 w-3 mr-1" />
          {getUploadLabel()}
        </Button>
      ) : isUploadOpen ? (
        <div className="border rounded-md p-3 bg-gray-50">
          <FormItem>
            <FormLabel>{getUploadLabel()}</FormLabel>
            <FileUpload
              onFilesSelected={handleFilesSelected}
              selectedFiles={field.value ? [field.value] : []}
              onFileClear={clearFile}
              allowMultiple={false}
              acceptedFileTypes="application/pdf,image/*"
              dropzoneText="Drag file here or click to upload"
            />
          </FormItem>
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsUploadOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : field.value ? (
        <div className="flex items-center text-xs p-2 bg-blue-50 rounded border border-blue-200">
          <FileIcon className="h-3 w-3 text-blue-500 mr-2" />
          <span className="flex-1 truncate">{field.value.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={clearFile}
          >
            <XIcon className="h-3 w-3" />
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default ItemDocumentUpload;
