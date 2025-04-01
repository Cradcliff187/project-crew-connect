
import React, { useCallback, useRef } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Control } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { DocumentUploadFormValues } from '../schemas/documentSchema';

interface DropzoneUploaderProps {
  control: Control<DocumentUploadFormValues>;
  onFileSelect: (files: File[]) => void;
  previewURL: string | null;
  watchFiles: File[];
  label?: string;
  instanceId?: string;
}

const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({
  control,
  onFileSelect,
  previewURL,
  watchFiles,
  label = 'Upload Document',
  instanceId = 'main-dropzone'
}) => {
  // Create a ref for the file input instead of using document.getElementById
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Log to verify component is rendering with correct props
  console.log('DropzoneUploader rendering with ID:', instanceId, {
    files: watchFiles.length > 0 ? watchFiles.map(f => f.name) : 'none',
    previewURL: previewURL ? 'has preview' : 'no preview',
    fileInputRef: fileInputRef.current ? 'ref exists' : 'ref not yet assigned'
  });
  
  // Use memoized callback to prevent unnecessary re-renders
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Ensure we're passing proper File objects
      const fileArray = Array.from(files);
      console.log(`Files selected for ${instanceId}:`, fileArray.map(f => ({name: f.name, type: f.type, size: f.size})));
      onFileSelect(fileArray);
    }
  }, [onFileSelect, instanceId]);
  
  // Use memoized callback to prevent unnecessary re-renders
  const handleDropzoneClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Use the ref directly instead of getElementById
    console.log(`Dropzone clicked for ${instanceId}, activating input via ref`);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error(`Could not access file input ref for ${instanceId}`);
    }
  }, [instanceId]);
  
  // Use memoized callback to prevent unnecessary re-renders
  const handleBrowseClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Use the ref directly instead of getElementById
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error(`Could not access file input ref for ${instanceId}`);
    }
  }, [instanceId]);
  
  return (
    <FormField
      control={control}
      name="files"
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center justify-center w-full">
              <div
                className={cn(
                  "flex flex-col items-center justify-center w-full h-56 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100",
                  watchFiles.length > 0 ? "border-[#0485ea]" : "border-gray-300"
                )}
                onClick={handleDropzoneClick}
                data-dropzone-id={instanceId}
              >
                {previewURL ? (
                  <div className="w-full h-full p-2 flex flex-col items-center justify-center">
                    <img
                      src={previewURL}
                      alt="Preview"
                      className="max-h-36 max-w-full object-contain mb-2"
                    />
                    <p className="text-sm text-[#0485ea] font-medium">
                      {watchFiles[0]?.name}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-[#0485ea]" />
                    <p className="mb-2 text-sm">
                      <span className="font-semibold text-[#0485ea]">Drag and drop</span> your file here
                    </p>
                    <Button 
                      type="button"
                      variant="outline" 
                      size="sm"
                      className="mt-2 border-[#0485ea] text-[#0485ea]"
                      onClick={handleBrowseClick}
                    >
                      <FolderOpen className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    {watchFiles.length > 0 && (
                      <p className="mt-2 text-sm text-[#0485ea] font-medium">
                        {watchFiles.length > 1 
                          ? `${watchFiles.length} files selected` 
                          : watchFiles[0].name}
                      </p>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  multiple={false}
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    handleFileChange(e);
                    // Make sure field.onChange is still called for React Hook Form
                    if (e.target.files && e.target.files.length > 0) {
                      field.onChange(Array.from(e.target.files));
                    }
                  }}
                />
              </div>
              
              {watchFiles.length > 0 && (
                <div className="w-full mt-2">
                  <p className="text-sm text-[#0485ea] font-medium text-center">
                    {watchFiles.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default React.memo(DropzoneUploader);
