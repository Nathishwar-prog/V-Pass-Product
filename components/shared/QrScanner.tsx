
import React, { useRef, useEffect, useState, useCallback } from 'react';
import jsQR from 'jsqr';
import { Camera, CameraOff, AlertTriangle } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memoizedOnScan = useCallback(onScan, [onScan]);

  useEffect(() => {
    if (!isScanning) {
      return;
    }

    let animationFrameId: number;
    let stream: MediaStream | null = null;

    const tick = () => {
      if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            memoizedOnScan(code.data);
            setIsScanning(false); // This will trigger cleanup
            return;
          }
        }
      }
      animationFrameId = requestAnimationFrame(tick);
    };

    const startScan = async () => {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera access is not supported by this browser.");
        setIsScanning(false);
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          video.setAttribute('playsinline', 'true');
          
          video.onloadedmetadata = () => {
             video.play().catch(err => {
              console.error("Video play error:", err);
              setError("Failed to start camera stream.");
              setIsScanning(false);
            });
          };

          animationFrameId = requestAnimationFrame(tick);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof Error) {
            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera permission denied. Please allow access in your browser settings.");
            } else if (err.name === 'NotFoundError') {
                setError("No suitable camera found.");
            } else {
                 setError("Could not access camera. An error occurred.");
            }
        } else {
            setError("An unknown error occurred while accessing the camera.");
        }
        setIsScanning(false);
      }
    };
    
    startScan();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      const video = videoRef.current;
      if (video) {
        video.srcObject = null;
        video.onloadedmetadata = null;
      }
    };
  }, [isScanning, memoizedOnScan]);

  const handleToggleScan = () => {
    setIsScanning(prev => !prev);
  }

  return (
    <div className="w-full max-w-lg mx-auto p-4 border rounded-lg shadow-md bg-white">
      <div className="relative w-full aspect-square bg-gray-900 rounded-md overflow-hidden">
        <video ref={videoRef} className={`w-full h-full object-cover ${!isScanning && 'hidden'}`} playsInline />
        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
            <CameraOff size={64} />
            <p className="mt-4">Scanner is off</p>
          </div>
        )}
        {isScanning && (
          <div className="absolute inset-0 border-8 border-white/20 rounded-md">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-1/2 border-2 border-dashed border-primary-400"></div>
          </div>
        )}
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md flex items-center">
          <AlertTriangle className="h-5 w-5 mr-3" />
          <span>{error}</span>
        </div>
      )}
      <button
        onClick={handleToggleScan}
        className={`w-full mt-4 py-3 px-4 rounded-lg font-semibold text-white transition-colors flex items-center justify-center ${
          isScanning ? 'bg-red-500 hover:bg-red-600' : 'bg-primary-500 hover:bg-primary-600'
        }`}
      >
        {isScanning ? <CameraOff className="mr-2" /> : <Camera className="mr-2" />}
        {isScanning ? 'Stop Scanning' : 'Start Scanner'}
      </button>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default QrScanner;
