import React, { useState, useEffect } from 'react';
import { QuadPoints, ShadowConfig, HistoryState } from '../types';
import { PerspectiveCanvas } from './PerspectiveCanvas';
import { ShadowPanel } from './ShadowPanel';
import { BackgroundRemovalModal } from './BackgroundRemovalModal';
import { ExportModal } from './ExportModal';
import { AndroidProjectModal } from './AndroidProjectModal';
import {
  Undo,
  Redo,
  RotateCcw,
  Download,
  Sun,
  Crop,
  Sparkles,
  ArrowRight,
  Smartphone
} from 'lucide-react';

interface EditorScreenProps {
  roomImage: HTMLImageElement;
  initialCarpetImage: HTMLImageElement;
  onNavigateHome: () => void;
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  roomImage,
  initialCarpetImage,
  onNavigateHome,
}) => {
  // Current active carpet (original image or background-removed canvas)
  const [carpetImage, setCarpetImage] = useState<HTMLImageElement | HTMLCanvasElement>(initialCarpetImage);

  // Initialize initial quad on lower floor of the room with realistic trapezoid perspective
  const calculateDefaultQuad = (): QuadPoints => {
    const w = roomImage.width;
    const h = roomImage.height;
    return {
      topLeft: { x: w * 0.28, y: h * 0.58 },
      topRight: { x: w * 0.72, y: h * 0.58 },
      bottomRight: { x: w * 0.86, y: h * 0.90 },
      bottomLeft: { x: w * 0.14, y: h * 0.90 },
    };
  };

  const [quad, setQuad] = useState<QuadPoints>(calculateDefaultQuad);
  const [shadowConfig, setShadowConfig] = useState<ShadowConfig>({
    opacity: 0.55,
    blurRadius: 24,
    elevation: 14,
    lightAngleDeg: 45,
    ambientOcclusion: 0.45,
  });

  const [showGuides, setShowGuides] = useState(true);

  // Undo / Redo stacks
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [future, setFuture] = useState<HistoryState[]>([]);

  // Modals & Drawers
  const [isShadowOpen, setIsShadowOpen] = useState(false);
  const [isBgRemovalOpen, setIsBgRemovalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAndroidProjectOpen, setIsAndroidProjectOpen] = useState(false);

  // Reset or initialize on room change
  useEffect(() => {
    const defaultQ = calculateDefaultQuad();
    setQuad(defaultQ);
    setHistory([]);
    setFuture([]);
  }, [roomImage]);

  const handleCommitQuad = (newQuad: QuadPoints) => {
    setHistory((prev) => [...prev, { quad, shadow: shadowConfig }]);
    setFuture([]);
    setQuad(newQuad);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [{ quad, shadow: shadowConfig }, ...prev]);
    setQuad(previous.quad);
    setShadowConfig(previous.shadow);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setHistory((prev) => [...prev, { quad, shadow: shadowConfig }]);
    setQuad(next.quad);
    setShadowConfig(next.shadow);
  };

  const handleResetQuad = () => {
    setHistory((prev) => [...prev, { quad, shadow: shadowConfig }]);
    setFuture([]);
    setQuad(calculateDefaultQuad());
    setShadowConfig({
      opacity: 0.55,
      blurRadius: 24,
      elevation: 14,
      lightAngleDeg: 45,
      ambientOcclusion: 0.45,
    });
  };

  return (
    <div className="h-screen w-screen bg-stone-950 flex flex-col overflow-hidden text-stone-100 select-none">
      {/* Top App Bar */}
      <header className="h-14 bg-stone-900 border-b border-stone-800 px-3 md:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>صفحه اصلی</span>
          </button>
          <div className="h-4 w-px bg-stone-800 mx-1 hidden sm:block" />
          <h2 className="text-xs md:text-sm font-semibold text-stone-200 hidden sm:block">
            میز کار چیدمان و پرسپکتیو فرش
          </h2>
        </div>

        {/* History & Reset actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            title="بازگشت (Undo)"
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 disabled:text-stone-600 disabled:hover:bg-transparent transition-colors"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={handleRedo}
            disabled={future.length === 0}
            title="تکرار (Redo)"
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 disabled:text-stone-600 disabled:hover:bg-transparent transition-colors"
          >
            <Redo className="w-4 h-4" />
          </button>

          <button
            onClick={handleResetQuad}
            title="بازنشانی موقعیت"
            className="p-2 rounded-xl text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsAndroidProjectOpen(true)}
            className="flex items-center gap-1 py-1.5 px-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-emerald-400 text-xs font-medium transition-colors border border-emerald-900/40"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden md:inline">پروژه اندروید</span>
          </button>

          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-950/40"
          >
            <Download className="w-4 h-4" />
            <span>ذخیره و خروجی</span>
          </button>
        </div>
      </header>

      {/* Main Canvas Workstation */}
      <main className="flex-1 relative overflow-hidden bg-stone-950">
        <PerspectiveCanvas
          roomImage={roomImage}
          carpetImage={carpetImage}
          quad={quad}
          shadowConfig={shadowConfig}
          showGuides={showGuides}
          onQuadChange={setQuad}
          onCommitChange={handleCommitQuad}
        />

        {/* Floating Perspective Corner Label / Instructions */}
        {showGuides && (
          <div className="absolute top-3 right-3 pointer-events-none bg-stone-900/90 border border-stone-800 px-3 py-1.5 rounded-xl text-[11px] text-stone-300 backdrop-blur-sm shadow-lg hidden md:block">
            <span>۴ گوشه را بکشید تا پرسپکتیو روی کف اتاق تنظیم شود · لمس مرکز برای جابجایی کل فرش</span>
          </div>
        )}

        {/* Bottom Drawer for Shadow Configuration */}
        {isShadowOpen && (
          <div className="absolute bottom-0 inset-x-0 z-30">
            <ShadowPanel
              config={shadowConfig}
              onChange={setShadowConfig}
              onClose={() => setIsShadowOpen(false)}
            />
          </div>
        )}
      </main>

      {/* Bottom Tool Bar */}
      <footer className="h-16 bg-stone-900 border-t border-stone-800 px-4 flex items-center justify-center gap-2 md:gap-4 z-20 shrink-0">
        <button
          onClick={() => setShowGuides(!showGuides)}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-medium transition-all ${
            showGuides
              ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
              : 'bg-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Crop className="w-4 h-4" />
          <span>دستگیره‌های ۴ گوشه</span>
        </button>

        <button
          onClick={() => setIsShadowOpen(!isShadowOpen)}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-medium transition-all ${
            isShadowOpen
              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              : 'bg-stone-800 text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>تنظیمات سایه طبیعی</span>
        </button>

        <button
          onClick={() => setIsBgRemovalOpen(true)}
          className="flex items-center gap-2 py-2 px-3.5 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700/80 text-stone-300 transition-colors border border-stone-700/40"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>حذف پس‌زمینه فرش</span>
        </button>
      </footer>

      {/* Modals */}
      {isBgRemovalOpen && (
        <BackgroundRemovalModal
          carpetSource={initialCarpetImage}
          onApplySegmented={(canvas) => {
            setCarpetImage(canvas);
          }}
          onRestoreOriginal={() => {
            setCarpetImage(initialCarpetImage);
          }}
          onClose={() => setIsBgRemovalOpen(false)}
        />
      )}

      {isExportOpen && (
        <ExportModal
          roomImage={roomImage}
          carpetImage={carpetImage}
          quad={quad}
          shadowConfig={shadowConfig}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {isAndroidProjectOpen && (
        <AndroidProjectModal onClose={() => setIsAndroidProjectOpen(false)} />
      )}
    </div>
  );
};
