
import React, { useState } from 'react';
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
}

const DropzoneUploader: React.FC<DropzoneUploaderProps> = ({
  control,
  onFileSelect,
  previewURL,
  watchFiles,
  label = 'Upload Document'
}) => {
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
                onClick={() => document.getElementById('dropzone-file')?.click()}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        document.getElementById('dropzone-file')?.click();
                      }}
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
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  multiple={false}
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const fileArray = Array.from(files);
                      field.onChange(fileArray);
                      onFileSelect(fileArray);
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

export default DropzoneUploader;
