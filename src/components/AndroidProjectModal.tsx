import React, { useState } from 'react';
import { generateAndroidProjectZip } from '../utils/androidProjectZip';
import { Download, Smartphone, X, Terminal, CheckCircle2, Code2, FolderArchive } from 'lucide-react';

interface AndroidProjectModalProps {
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ onClose }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const blob = await generateAndroidProjectZip();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'PersianCarpetDecor_AndroidStudio_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloadDone(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 text-stone-100 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Smartphone className="w-6 h-6 text-emerald-400" />
          <h3 className="font-bold text-lg">پروژه کامل بومی اندروید استودیو (Native Android APK Project)</h3>
        </div>

        <p className="text-xs text-stone-400 leading-relaxed mb-5">
          سورس کد کامل، مستقل و آماده کامپایل اپلیکیشن اندروید چیدمان فرش ایرانی بر پایه Kotlin و Jetpack Compose.
        </p>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5 text-xs">
          <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>کاملاً آفلاین و بدون سرور</span>
            </div>
            <p className="text-stone-400 text-[11px]">اجرای تمامی الگوریتم‌های پرسپکتیو و سایه بدون نیاز به اینترنت یا API ابری</p>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>سازگاری با سامسونگ و اندروید مدرن</span>
            </div>
            <p className="text-stone-400 text-[11px]">بهینه‌سازی مصرف رم و پشتیبانی از رزولوشن‌های 4K در Samsung Galaxy S20 FE</p>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>ماتریس هموگرافی ۴ نقطه‌ای</span>
            </div>
            <p className="text-stone-400 text-[11px]">نگاشت دقیق هندسی فرش روی کف اتاق با حفظ بافت و رنگ اصلی</p>
          </div>

          <div className="p-3 rounded-xl bg-stone-800/40 border border-stone-800/70 space-y-1">
            <div className="flex items-center gap-1.5 text-stone-200 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>رابط کاربری راست‌چین (RTL) فارسی</span>
            </div>
            <p className="text-stone-400 text-[11px]">تمام متون، دکمه‌ها و اسلایدرها به زبان فارسی طبق استاندارد Material 3</p>
          </div>
        </div>

        {/* Build command instruction */}
        <div className="p-4 rounded-xl bg-black/60 border border-stone-800 mb-5 font-mono text-xs">
          <div className="flex items-center justify-between text-stone-400 mb-2 font-sans text-xs">
            <span className="flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-amber-500" />
              دستور ساخت فایل APK در ترمینال یا Android Studio:
            </span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 text-amber-400 select-all flex items-center justify-between">
            <span>./gradlew assembleDebug</span>
          </div>
          <p className="text-[11px] text-stone-500 mt-2 font-sans">
            فایل خروجی APK در مسیر <code>app/build/outputs/apk/debug/app-debug.apk</code> تولید می‌گردد.
          </p>
        </div>

        {/* File Tree summary */}
        <div className="p-3.5 rounded-xl bg-stone-800/30 border border-stone-800 mb-5 text-[11px] text-stone-300">
          <div className="flex items-center gap-1.5 font-medium text-stone-200 mb-2">
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>فایل‌های موجود در پکیج سورس اندروید:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-stone-400">
            <li><code>app/src/main/java/.../MainActivity.kt</code> (مدیریت چرخه حیات، گالری و دوربین)</li>
            <li><code>app/src/main/java/.../processing/PerspectiveTransformer.kt</code> (ماتریس پرسپکتیو ۴ نقطه‌ای)</li>
            <li><code>app/src/main/java/.../processing/RealisticShadowRenderer.kt</code> (محاسبه سایه محیطی و سایه تابشی)</li>
            <li><code>app/src/main/java/.../processing/CarpetSegmenter.kt</code> (تفکیک هوشمند پس‌زمینه با حفظ ریشه‌ها)</li>
            <li><code>app/src/main/java/.../processing/ImageExporter.kt</code> (ذخیره مستقیم در گالری MediaStore)</li>
            <li><code>app/src/main/res/values-fa/strings.xml</code> (فارسی‌سازی کامل کلیه متون)</li>
            <li><code>build.gradle.kts</code>, <code>settings.gradle.kts</code>, <code>gradle-wrapper.properties</code></li>
          </ul>
        </div>

        {downloadDone && (
          <div className="flex items-center gap-2 p-3 bg-emerald-950/60 border border-emerald-800 text-emerald-300 rounded-xl text-xs mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>فایل زیپ پروژه کامل اندروید با موفقیت دانلود شد.</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl text-xs transition-colors"
          >
            بستن
          </button>
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-stone-700 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-2 shadow-lg shadow-emerald-950/40"
          >
            {isZipping ? (
              <span>در حال زیپ کردن سورس...</span>
            ) : (
              <>
                <FolderArchive className="w-4 h-4" />
                <span>دانلود آرشیو کامل پروژه اندروید (.zip)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
