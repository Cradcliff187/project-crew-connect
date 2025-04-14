import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MobileCaptureWrapperProps {
  onCapture: (file: File) => void;
  isMobile: boolean;
  hasCamera: boolean;
  showMobileCapture: boolean;
  setShowMobileCapture: (show: boolean) => void;
}

const MobileCaptureWrapper: React.FC<MobileCaptureWrapperProps> = ({
  onCapture,
  isMobile,
  hasCamera,
  showMobileCapture,
  setShowMobileCapture,
}) => {
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [showInstructions, setShowInstructions] = React.useState(true);
  const [cameraMode, setCameraMode] = React.useState<'environment' | 'user'>('environment');

  // Clean up camera stream when component unmounts
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Set up camera when dialog opens
  React.useEffect(() => {
    if (showMobileCapture && hasCamera) {
      setupCamera();
    } else if (!showMobileCapture && stream) {
      // Stop the stream when closing
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  }, [showMobileCapture, hasCamera]);

  const setupCamera = async () => {
    try {
      setIsCapturing(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraMode },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStream(mediaStream);
      setIsCapturing(false);
      // Hide instructions after a few seconds
      setTimeout(() => setShowInstructions(false), 3000);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setIsCapturing(false);
    }
  };

  const switchCamera = () => {
    const newMode = cameraMode === 'environment' ? 'user' : 'environment';
    setCameraMode(newMode);

    // Stop current stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }

    // Restart camera with new mode
    setTimeout(setupCamera, 100);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to blob
    canvas.toBlob(
      blob => {
        if (blob) {
          const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onCapture(file);

          // Close the dialog
          setShowMobileCapture(false);
        }
      },
      'image/jpeg',
      0.8
    );
  };

  // Only show the camera button on mobile devices with a camera
  if (!isMobile || !hasCamera) {
    return null;
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full border-dashed border-primary/20 bg-primary/5 hover:border-primary/30"
        onClick={() => setShowMobileCapture(true)}
      >
        <Camera className="h-4 w-4 mr-2" />
        Take Photo with Camera
      </Button>

      <Dialog open={showMobileCapture} onOpenChange={setShowMobileCapture}>
        <DialogContent className="p-0 max-w-[95vw] sm:max-w-md h-[80vh] flex flex-col">
          <DialogHeader className="p-4 flex-shrink-0">
            <DialogTitle className="text-center">Capture Document</DialogTitle>
          </DialogHeader>

          <div className="relative flex-grow flex flex-col items-center justify-center bg-black">
            {isCapturing ? (
              <div className="text-white text-center">
                <div className="animate-pulse">Accessing camera...</div>
              </div>
            ) : (
              <>
                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />

                {showInstructions && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <Card className="w-[80%] bg-white/90">
                      <CardContent className="pt-4">
                        <p className="text-center text-sm">
                          Position the document in good lighting and ensure all text is clearly
                          visible
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Hidden canvas for capturing the image */}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </>
            )}
          </div>

          <div className="p-4 flex justify-between items-center flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={switchCamera}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-flip-horizontal"
              >
                <path d="m3 7 5 5-5 5V7" />
                <path d="m21 7-5 5 5 5V7" />
                <path d="M12 20v2" />
                <path d="M12 14v2" />
                <path d="M12 8v2" />
                <path d="M12 2v2" />
              </svg>
            </Button>

            <Button
              type="button"
              size="lg"
              className="rounded-full h-16 w-16 bg-[#0485ea]"
              onClick={capturePhoto}
              disabled={isCapturing || !stream}
            >
              <div className="bg-white rounded-full h-12 w-12"></div>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setShowMobileCapture(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MobileCaptureWrapper;
