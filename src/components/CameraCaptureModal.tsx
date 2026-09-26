import React, { useRef, useEffect, useState } from 'react';
import { Camera, X, RefreshCw, Check } from 'lucide-react';

interface CameraCaptureModalProps {
  title: string;
  onCapture: (imageBlob: Blob) => void;
  onClose: () => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  title,
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [hasCaptured, setHasCaptured] = useState(false);
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  const startCamera = async () => {
    try {
      setCameraError(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access failed:', err);
      setCameraError('دسترسی به دوربین برقرار نشد. لطفاً دسترسی دوربین را در مرورگر مجاز فرمایید.');
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  const handleTakePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    setCapturedDataUrl(dataUrl);
    setHasCaptured(true);
  };

  const handleRetake = () => {
    setHasCaptured(false);
    setCapturedDataUrl(null);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (blob) {
        onCapture(blob);
        onClose();
      }
    }, 'image/jpeg', 0.95);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-xl w-full p-5 text-stone-100 shadow-2xl relative flex flex-col items-center">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-bold text-base mb-4 flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-500" />
          <span>{title}</span>
        </h3>

        {cameraError ? (
          <div className="p-4 bg-red-950/60 border border-red-800 text-red-200 rounded-xl text-xs text-center my-6">
            {cameraError}
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden mb-4 border border-stone-800">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${hasCaptured ? 'hidden' : 'block'}`}
            />
            {capturedDataUrl && (
              <img
                src={capturedDataUrl}
                alt="Captured"
                className={`w-full h-full object-cover ${hasCaptured ? 'block' : 'hidden'}`}
              />
            )}
            <canvas ref={canvasRef} className="hidden" />

            {/* Viewfinder crosshairs */}
            {!hasCaptured && (
              <div className="absolute inset-0 pointer-events-none border border-white/20 m-6 rounded-lg flex items-center justify-center">
                <div className="w-8 h-0.5 bg-amber-400/60" />
                <div className="h-8 w-0.5 bg-amber-400/60 absolute" />
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 w-full">
          {!hasCaptured ? (
            <>
              <button
                onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
                className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>چرخش دوربین</span>
              </button>

              <button
                onClick={handleTakePhoto}
                disabled={!!cameraError}
                className="flex-1 py-3 px-6 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40"
              >
                <Camera className="w-4 h-4" />
                <span>ثبت عکس فرش</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleRetake}
                className="flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>عکاسی مجدد</span>
              </button>

              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                <Check className="w-4 h-4" />
                <span>تأیید و استفاده</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
