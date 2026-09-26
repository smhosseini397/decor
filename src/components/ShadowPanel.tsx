import React from 'react';
import { ShadowConfig } from '../types';
import { Sun, X, RefreshCw } from 'lucide-react';

interface ShadowPanelProps {
  config: ShadowConfig;
  onChange: (config: ShadowConfig) => void;
  onClose: () => void;
}

export const ShadowPanel: React.FC<ShadowPanelProps> = ({ config, onChange, onClose }) => {
  const handleReset = () => {
    onChange({
      opacity: 0.55,
      blurRadius: 24,
      elevation: 14,
      lightAngleDeg: 45,
      ambientOcclusion: 0.45,
    });
  };

  return (
    <div className="bg-stone-900 border-t border-stone-800 p-4 md:p-6 shadow-2xl rounded-t-2xl max-w-xl mx-auto w-full text-stone-100 animate-in slide-in-from-bottom duration-200">
      <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
        <div className="flex items-center gap-2">
          <Sun className="w-5 h-5 text-amber-500" />
          <h3 className="font-semibold text-base">تنظیمات سایه طبیعی کف اتاق</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 px-2 py-1 rounded bg-stone-800/80 transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>پیش‌فرض</span>
          </button>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="space-y-4 text-xs md:text-sm">
        {/* Opacity */}
        <div>
          <div className="flex justify-between items-center mb-1 text-stone-300">
            <span>شدت و غلظت سایه</span>
            <span className="font-mono text-amber-400">{Math.round(config.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={config.opacity}
            onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Blur */}
        <div>
          <div className="flex justify-between items-center mb-1 text-stone-300">
            <span>میزان محوشدگی و ماتی (Blur)</span>
            <span className="font-mono text-amber-400">{Math.round(config.blurRadius)} px</span>
          </div>
          <input
            type="range"
            min="2"
            max="60"
            step="1"
            value={config.blurRadius}
            onChange={(e) => onChange({ ...config, blurRadius: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Elevation */}
        <div>
          <div className="flex justify-between items-center mb-1 text-stone-300">
            <span>ارتفاع و فاصله سایه از فرش</span>
            <span className="font-mono text-amber-400">{Math.round(config.elevation)} px</span>
          </div>
          <input
            type="range"
            min="0"
            max="50"
            step="1"
            value={config.elevation}
            onChange={(e) => onChange({ ...config, elevation: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Light Angle */}
        <div>
          <div className="flex justify-between items-center mb-1 text-stone-300">
            <span>زاویه تابش نور دکور</span>
            <span className="font-mono text-amber-400">{Math.round(config.lightAngleDeg)}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={config.lightAngleDeg}
            onChange={(e) => onChange({ ...config, lightAngleDeg: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
          />
        </div>

        {/* Contact Shadow AO */}
        <div>
          <div className="flex justify-between items-center mb-1 text-stone-300">
            <span>سایه موضعی زیر تار و پود لبه فرش (Contact Shadow)</span>
            <span className="font-mono text-amber-400">{Math.round(config.ambientOcclusion * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={config.ambientOcclusion}
            onChange={(e) => onChange({ ...config, ambientOcclusion: parseFloat(e.target.value) })}
            className="w-full accent-amber-600 bg-stone-700 h-1.5 rounded-lg cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
