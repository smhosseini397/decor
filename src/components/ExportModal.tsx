import React, { useState } from 'react';
import { QuadPoints, ShadowConfig } from '../types';
import { drawFloorShadow, drawPerspectiveCarpet } from '../utils/perspective';
import { Download, Share2, X, Check, Image as ImageIcon } from 'lucide-react';

interface ExportModalProps {
  roomImage: HTMLImageElement | HTMLCanvasElement;
  carpetImage: HTMLImageElement | HTMLCanvasElement;
  quad: QuadPoints;
  shadowConfig: ShadowConfig;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  roomImage,
  carpetImage,
  quad,
  shadowConfig,
  onClose,
}) => {
  const [format, setFormat] = useState<'jpeg' | 'png'>('jpeg');
  const [quality, setQuality] = useState<number>(95);
  const [isExporting, setIsExporting] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  const generateCompositeBlob = async (): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = roomImage.width;
    canvas.height = roomImage.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Cannot acquire canvas context');

    // 1. Draw base room
    ctx.drawImage(roomImage, 0, 0);

    // 2. Draw realistic floor shadow
    drawFloorShadow(ctx, quad, shadowConfig);

    // 3. Draw perspective warped carpet at ultra-high mesh resolution
    drawPerspectiveCarpet(ctx, carpetImage, quad, 30);

    const mime = format === 'jpeg' ? 'image/jpeg' : 'image/png';
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate image blob'));
        },
        mime,
        quality / 100
      );
    });
  };

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCompositeBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Farsh_Staging_${Date.now()}.${format === 'jpeg' ? 'jpg' : 'png'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setHasExported(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    setIsExporting(true);
    try {
      const blob = await generateCompositeBlob();
      const file = new File([blob], `Farsh_Decor.${format === 'jpeg' ? 'jpg' : 'png'}`, {
        type: format === 'jpeg' ? 'image/jpeg' : 'image/png',
      });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'چیدمان هوشمند فرش ایرانی',
          text: 'طرح شبیه‌سازی فرش در دکوراسیون داخلی با پرسپکتیو واقعی',
        });
      } else {
        // Fallback to download
        handleDownload();
      }
    } catch (err) {
      console.warn('Share error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg">ذخیره و خروجی دکور نهایی</h3>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          تصویر ترکیب‌شده با وضوح اصلی اتاق، بافت دست‌نخورده فرش و سایه طبیعی بدون کاهش کیفیت صادر خواهد شد.
        </p>

        <div className="space-y-4 text-xs md:text-sm">
          {/* Format Selection */}
          <div>
            <label className="block text-stone-300 mb-2 font-medium">فرمت خروجی تصویر:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormat('jpeg')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  format === 'jpeg'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium'
                    : 'border-stone-800 bg-stone-800/50 text-stone-400 hover:border-stone-700'
                }`}
              >
                <span>JPG (حجم بهینه با وضوح عالی)</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('png')}
                className={`py-2 px-3 rounded-xl border text-center transition-all ${
                  format === 'png'
                    ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-medium'
                    : 'border-stone-800 bg-stone-800/50 text-stone-400 hover:border-stone-700'
                }`}
              >
                <span>PNG (بدون فشرده‌سازی)</span>
              </button>
            </div>
          </div>

          {/* Quality Slider (JPG only) */}
          {format === 'jpeg' && (
            <div>
              <div className="flex justify-between items-center mb-1 text-stone-300">
                <span>کیفیت فایل خروجی</span>
                <span className="font-mono text-amber-400">{quality}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="5"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value, 10))}
                className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
              />
            </div>
          )}

          {hasExported && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>فایل با رزولوشن کامل در حافظه دستگاه شما ذخیره شد.</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3">
            <button
              onClick={handleDownload}
              disabled={isExporting}
              className="flex-1 py-3 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-950/40"
            >
              {isExporting ? (
                <span>در حال ساخت تصویر...</span>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>دانلود در گالری</span>
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              disabled={isExporting}
              className="py-3 px-4 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span>اشتراک‌گذاری</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
