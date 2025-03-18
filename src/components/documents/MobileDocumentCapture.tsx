
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Check } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface MobileDocumentCaptureProps {
  onCapture: (files: File[]) => void;
}

const MobileDocumentCapture = ({ onCapture }: MobileDocumentCaptureProps) => {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCapturedFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Open the preview dialog
      setIsDialogOpen(true);
    }
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture([capturedFile]);
      setIsDialogOpen(false);
      setPreview(null);
      setCapturedFile(null);
      toast({
        title: "Success",
        description: "Document captured successfully",
      });
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setPreview(null);
    setCapturedFile(null);
  };

  if (!isMobile) return null;

  return (
    <>
      <Button 
        type="button" 
        variant="outline" 
        onClick={handleCapture} 
        className="flex items-center gap-2"
      >
        <Camera className="h-4 w-4" />
        <span>Take Photo</span>
      </Button>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Document Preview</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {preview && (
              <div className="relative w-full max-h-[40vh] overflow-hidden rounded-md">
                <img 
                  src={preview} 
                  alt="Captured document" 
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            <div className="flex space-x-2 w-full">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Retake
              </Button>
              <Button className="flex-1" onClick={handleConfirm}>
                <Check className="h-4 w-4 mr-2" />
                Use Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileDocumentCapture;
