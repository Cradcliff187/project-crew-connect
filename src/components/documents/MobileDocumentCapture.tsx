import React, { useRef, useState } from 'react';
import { Camera, Image, Undo, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDeviceCapabilities } from '@/hooks/use-mobile';

interface MobileDocumentCaptureProps {
  onCapture: (file: File) => void;
}

const MobileDocumentCapture: React.FC<MobileDocumentCaptureProps> = ({ onCapture }) => {
  const { isMobile, hasCamera } = useDeviceCapabilities();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
    }
  };

  const handleGallerySelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFileName(file.name);
      const imageUrl = URL.createObjectURL(file);
      setCapturedImage(imageUrl);
    }
  };

  const handleSubmit = () => {
    if (capturedImage && (cameraRef.current?.files?.length || galleryRef.current?.files?.length)) {
      const files = cameraRef.current?.files || galleryRef.current?.files;
      if (files && files.length > 0) {
        onCapture(files[0]);
      }
    }
  };

  const handleReset = () => {
    setCapturedImage(null);
    setFileName('');
    if (cameraRef.current) cameraRef.current.value = '';
    if (galleryRef.current) galleryRef.current.value = '';
  };

  if (!isMobile) {
    return (
      <div className="text-center p-4 border border-dashed rounded-md">
        <p className="text-sm text-muted-foreground">
          This feature is optimized for mobile devices. Please use the File Upload tab on desktop.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {capturedImage ? (
        <div className="space-y-4">
          <div className="border rounded-md overflow-hidden">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-auto max-h-[300px] object-contain"
            />
          </div>

          <p className="text-sm text-center text-muted-foreground">{fileName}</p>

          <div className="flex justify-center space-x-2">
            <Button type="button" variant="outline" className="flex-1" onClick={handleReset}>
              <Undo className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button
              type="button"
              className="flex-1 bg-[#0485ea] hover:bg-[#0375d1]"
              onClick={handleSubmit}
            >
              <Upload className="h-4 w-4 mr-2" />
              Use Image
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {hasCamera && (
              <Button
                type="button"
                variant="outline"
                className="h-32 flex flex-col items-center justify-center space-y-2"
                onClick={() => cameraRef.current?.click()}
              >
                <Camera className="h-8 w-8" />
                <span>Take Photo</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              className={`h-32 flex flex-col items-center justify-center space-y-2 ${!hasCamera ? 'col-span-2' : ''}`}
              onClick={() => galleryRef.current?.click()}
            >
              <Image className="h-8 w-8" />
              <span>Upload from Gallery</span>
            </Button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCameraCapture}
          />

          <input
            ref={galleryRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleGallerySelect}
          />

          <p className="text-xs text-center text-muted-foreground">
            {hasCamera
              ? 'Capture receipts, invoices, and other documents with your camera.'
              : 'Upload receipts, invoices, and other documents from your device.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MobileDocumentCapture;
