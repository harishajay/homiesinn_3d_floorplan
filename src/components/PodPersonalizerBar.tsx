import React, { useState } from 'react';
import { BedCustomization, AmbientSoundtrack } from '../types/coliving';
import { soundscapeEngine } from '../utils/audioSynthesizer';
import { Sparkles, Sliders, Volume2, VolumeX, Lightbulb, Sun, Layers, Package } from 'lucide-react';

interface PodPersonalizerBarProps {
  customization: BedCustomization;
  onUpdate: (custom: Partial<BedCustomization>) => void;
  onOpenPassModal: () => void;
}

const LINEN_SWATCHES = [
  { id: 'nordic-indigo', name: 'Nordic Indigo', color: '#4f46e5' },
  { id: 'terracotta', name: 'Terracotta Sunset', color: '#c2410c' },
  { id: 'forest-sage', name: 'Forest Sage', color: '#15803d' },
  { id: 'charcoal', name: 'Minimal Charcoal', color: '#334155' },
  { id: 'sand', name: 'Crisp Sand', color: '#e2d9cc' },
];

const SOUNDTRACKS: { id: AmbientSoundtrack; label: string; icon: string }[] = [
  { id: 'none', label: 'Sound Off', icon: '🔇' },
  { id: 'sunrise-breeze', label: 'Morning Breeze', icon: '🌅' },
  { id: 'balcony-rain', label: 'Balcony Rain', icon: '🌧️' },
  { id: 'binaural-study', label: 'Alpha Study (40Hz)', icon: '🎧' },
  { id: 'white-noise', label: 'Calm Fan Whir', icon: '💨' },
];

export const PodPersonalizerBar: React.FC<PodPersonalizerBarProps> = ({
  customization,
  onUpdate,
  onOpenPassModal,
}) => {
  const [activeSoundtrack, setActiveSoundtrack] = useState<AmbientSoundtrack>('none');
  const [soundVolume, setSoundVolume] = useState<number>(0.5);

  const handleSoundtrackChange = (track: AmbientSoundtrack) => {
    setActiveSoundtrack(track);
    soundscapeEngine.play(track);
  };

  const handleVolumeChange = (vol: number) => {
    setSoundVolume(vol);
    soundscapeEngine.setVolume(vol);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 flex flex-col gap-4">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Bed Pod B Personalizer & Soundscape Studio</h3>
            <p className="text-xs text-slate-500">Live 3D material updates, ambient lighting, and focus sound generator</p>
          </div>
        </div>

        {/* View Offline Digital Room Pass */}
        <button
          onClick={onOpenPassModal}
          className="self-start sm:self-auto px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Offline Digital Room Pass</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Linen Color Customizer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
            BEDDING & LINEN COLOR (3D PBR)
          </span>
          <div className="flex items-center gap-2">
            {LINEN_SWATCHES.map((swatch) => (
              <button
                key={swatch.id}
                onClick={() =>
                  onUpdate({ duvetColor: swatch.color, duvetName: swatch.name })
                }
                title={swatch.name}
                className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                  customization.duvetColor === swatch.color
                    ? 'scale-115 border-slate-900 shadow-sm'
                    : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: swatch.color }}
              />
            ))}
            <span className="text-xs text-slate-600 font-medium ml-1">
              {customization.duvetName}
            </span>
          </div>
        </div>

        {/* 2. Lighting & Hydraulic Storage Toggles */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            INTERACTIVE FIXTURES & LIFT
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {/* Reading Light Toggle */}
            <button
              onClick={() => onUpdate({ readingLightOn: !customization.readingLightOn })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                customization.readingLightOn
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
              <span>Reading Lamp: {customization.readingLightOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* Desk Lamp Toggle */}
            <button
              onClick={() => onUpdate({ deskLampOn: !customization.deskLampOn })}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                customization.deskLampOn
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-600" />
              <span>Desk #2: {customization.deskLampOn ? 'ON' : 'OFF'}</span>
            </button>

            {/* Hydraulic Storage Lift */}
            <button
              onClick={() =>
                onUpdate({ hydraulicBedLifted: !customization.hydraulicBedLifted })
              }
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                customization.hydraulicBedLifted
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>{customization.hydraulicBedLifted ? 'Close Storage' : 'Lift 450L Bed'}</span>
            </button>
          </div>
        </div>

        {/* 3. Ambient Focus Soundscape Synthesizer */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              FOCUS & SLEEP SOUNDSCAPES
            </span>
            {activeSoundtrack !== 'none' && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.2 rounded">
                Playing Live
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {SOUNDTRACKS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSoundtrackChange(t.id)}
                className={`px-2 py-1 text-[11px] font-semibold rounded-lg flex items-center gap-1 whitespace-nowrap cursor-pointer transition-colors ${
                  activeSoundtrack === t.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {activeSoundtrack !== 'none' && (
            <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-200/60">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={soundVolume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
