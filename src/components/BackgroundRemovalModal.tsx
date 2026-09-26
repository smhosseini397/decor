import React, { useState } from 'react';
import { SegmentationParams } from '../types';
import { removeCarpetBackground } from '../utils/segmentation';
import { Sparkles, ShieldCheck, X, RotateCcw, Check } from 'lucide-react';

interface BackgroundRemovalModalProps {
  carpetSource: HTMLImageElement;
  onApplySegmented: (canvas: HTMLCanvasElement) => void;
  onRestoreOriginal: () => void;
  onClose: () => void;
}

export const BackgroundRemovalModal: React.FC<BackgroundRemovalModalProps> = ({
  carpetSource,
  onApplySegmented,
  onRestoreOriginal,
  onClose,
}) => {
  const [params, setParams] = useState<SegmentationParams>({
    sensitivity: 0.28,
    protectFringes: true,
    edgeFeathering: 2,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleRunSegmentation = async () => {
    setIsProcessing(true);
    setSuccessMsg('');
    try {
      const resultCanvas = await removeCarpetBackground(carpetSource, params);
      onApplySegmented(resultCanvas);
      setSuccessMsg('پس‌زمینه فرش با موفقیت حذف شد. ریشه‌ها و رنگ‌های اصلی دست‌نخورده حفظ گردیدند.');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 text-stone-100 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-lg">حذف هوشمند پس‌زمینه فرش (کاملاً آفلاین)</h3>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed mb-6">
          این موتور پردازش تصویر بدون نیاز به اینترنت و بدون دستکاری یا بازطراحی گل‌ها، ریشه‌ها و رنگ‌های اصیل فرش، زمینه اضافی عکس را تمیز می‌کند.
        </p>

        <div className="space-y-5 text-xs md:text-sm">
          {/* Sensitivity */}
          <div>
            <div className="flex justify-between items-center mb-1 text-stone-300">
              <span>حساسیت جداسازی زمینه از لبه‌ها</span>
              <span className="font-mono text-amber-400">{Math.round(params.sensitivity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="0.6"
              step="0.02"
              value={params.sensitivity}
              onChange={(e) => setParams({ ...params, sensitivity: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Fringe Protection Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-stone-800/60 border border-stone-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="font-medium text-stone-200">حفاظت از ریشه‌های سفید و گلیم‌باف فرش</p>
                <p className="text-[11px] text-stone-400">جلوگیری از قطع شدن یا محو شدن ریشه‌های ابریشمی دور فرش</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={params.protectFringes}
              onChange={(e) => setParams({ ...params, protectFringes: e.target.checked })}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleRunSegmentation}
              disabled={isProcessing}
              className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-lg shadow-amber-900/30"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>در حال تفکیک بافت فرش...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>شروع حذف خودکار پس‌زمینه</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                onRestoreOriginal();
                onClose();
              }}
              className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors flex items-center gap-1.5 text-xs whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>بازنشانی به عکس اصلی</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
