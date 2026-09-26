import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, Sparkles, CheckCircle2, ArrowLeft, Smartphone, Layers } from 'lucide-react';

interface HomeScreenProps {
  carpetImage: HTMLImageElement | null;
  roomImage: HTMLImageElement | null;
  carpetName: string;
  roomName: string;
  onPickCarpetFile: (file: File) => void;
  onOpenCarpetCamera: () => void;
  onPickRoomFile: (file: File) => void;
  onSelectPresetCarpet: (id: string) => void;
  onSelectPresetRoom: (id: string) => void;
  onStartStaging: () => void;
  onOpenAndroidProject: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  carpetImage,
  roomImage,
  carpetName,
  roomName,
  onPickCarpetFile,
  onOpenCarpetCamera,
  onPickRoomFile,
  onSelectPresetCarpet,
  onSelectPresetRoom,
  onStartStaging,
  onOpenAndroidProject,
}) => {
  const carpetInputRef = useRef<HTMLInputElement>(null);
  const roomInputRef = useRef<HTMLInputElement>(null);

  const canStart = carpetImage !== null && roomImage !== null;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-between p-4 md:p-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <header className="text-center py-6 space-y-2 border-b border-stone-800/80 mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center shadow-lg shadow-amber-950/60">
            <Layers className="w-5 h-5 text-stone-950" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            چیدمان هوشمند فرش ایرانی
          </h1>
        </div>
        <p className="text-xs md:text-sm text-stone-400 max-w-lg mx-auto leading-relaxed">
          سامانه آفلاین جای‌گذاری و پرسپکتیو ۴ نقطه‌ای فرش در فضای دکوراسیون و اتاق با سایه طبیعی
        </p>

        <div className="pt-2 flex justify-center">
          <button
            onClick={onOpenAndroidProject}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-emerald-400 hover:border-emerald-700/60 transition-colors text-xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>پروژه سورس بومی اندروید استودیو (APK)</span>
          </button>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="space-y-6 flex-1">
        {/* Step 1: Carpet Selection Card */}
        <section className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800/80 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-500 font-bold text-xs flex items-center justify-center">
                ۱
              </span>
              <h2 className="font-bold text-base text-stone-100">انتخاب یا عکاسی از فرش</h2>
            </div>
            {carpetImage && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{carpetName || 'فرش انتخاب شد'}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Carpet Preview Area */}
            <div className="md:col-span-1 aspect-[3/4] max-h-56 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden relative">
              {carpetImage ? (
                <img
                  src={carpetImage.src}
                  alt="Carpet Preview"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-center p-4 text-stone-500 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-40 mb-1" />
                  <p className="text-xs">عکسی انتخاب نشده است</p>
                </div>
              )}
            </div>

            {/* Actions & Presets */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => carpetInputRef.current?.click()}
                  className="flex-1 min-w-[130px] py-2.5 px-4 bg-stone-800 hover:bg-stone-700/80 text-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-stone-700/50"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>انتخاب از گالری</span>
                </button>
                <input
                  ref={carpetInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPickCarpetFile(file);
                  }}
                />

                <button
                  onClick={onOpenCarpetCamera}
                  className="flex-1 min-w-[130px] py-2.5 px-4 bg-stone-800 hover:bg-stone-700/80 text-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-stone-700/50"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>عکاسی با دوربین</span>
                </button>
              </div>

              {/* Sample Carpet Presets */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-400">یا از نمونه‌های پیش‌فرض استفاده کنید:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectPresetCarpet('isfahan')}
                    className="py-1.5 px-3 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-600/70 text-stone-300 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>فرش ابریشم اصفهان</span>
                  </button>
                  <button
                    onClick={() => onSelectPresetCarpet('tabriz')}
                    className="py-1.5 px-3 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-600/70 text-stone-300 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>فرش سنتی تبریز</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Step 2: Room Selection Card */}
        <section className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 md:p-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-800/80 mb-4">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-amber-600/20 text-amber-500 font-bold text-xs flex items-center justify-center">
                ۲
              </span>
              <h2 className="font-bold text-base text-stone-100">انتخاب تصویر دکوراسیون و اتاق</h2>
            </div>
            {roomImage && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
                <span>{roomName || 'اتاق انتخاب شد'}</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Room Preview Area */}
            <div className="md:col-span-1 aspect-video max-h-56 bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center overflow-hidden relative">
              {roomImage ? (
                <img
                  src={roomImage.src}
                  alt="Room Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-stone-500 space-y-1">
                  <ImageIcon className="w-8 h-8 mx-auto opacity-40 mb-1" />
                  <p className="text-xs">عکسی انتخاب نشده است</p>
                </div>
              )}
            </div>

            {/* Actions & Presets */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap gap-2.5">
                <button
                  onClick={() => roomInputRef.current?.click()}
                  className="flex-1 min-w-[130px] py-2.5 px-4 bg-stone-800 hover:bg-stone-700/80 text-stone-200 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2 border border-stone-700/50"
                >
                  <ImageIcon className="w-4 h-4 text-amber-400" />
                  <span>انتخاب عکس اتاق از گالری</span>
                </button>
                <input
                  ref={roomInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onPickRoomFile(file);
                  }}
                />
              </div>

              {/* Sample Room Presets */}
              <div className="space-y-1.5 pt-2">
                <p className="text-[11px] text-stone-400">یا اتاق‌های نمونه را امتحان کنید:</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => onSelectPresetRoom('living')}
                    className="py-1.5 px-3 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-600/70 text-stone-300 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>سالن کف پارکت چوبی</span>
                  </button>
                  <button
                    onClick={() => onSelectPresetRoom('classic')}
                    className="py-1.5 px-3 rounded-lg bg-stone-950 border border-stone-800 hover:border-amber-600/70 text-stone-300 text-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>نشیمن کف سنگ مرمر</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Primary Action Button */}
      <footer className="pt-6 pb-2">
        <button
          onClick={onStartStaging}
          disabled={!canStart}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base md:text-lg flex items-center justify-center gap-3 transition-all ${
            canStart
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-xl shadow-amber-950/50 cursor-pointer active:scale-[0.99]'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-800'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>شروع طراحی و چیدمان فرش در اتاق</span>
          <ArrowLeft className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
};
