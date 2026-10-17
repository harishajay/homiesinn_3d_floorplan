import React, { useState } from 'react';
import { BedPod, RoomRules } from '../types/coliving';
import {
  ShieldCheck,
  Zap,
  Lock,
  Layers,
  Sparkles,
  Wifi,
  Volume2,
  Maximize2,
  Copy,
  Check,
  Clock,
  Thermometer,
  Sparkle
} from 'lucide-react';

interface SpatialInspectorProps {
  bed: BedPod;
  roomRules: RoomRules;
  onUpdateRules: (newRules: Partial<RoomRules>) => void;
  onRequestBedSwap: () => void;
  onReportMaintenance: () => void;
  onOpenPhotoLightbox: (photoUrl: string, title: string) => void;
}

export const SpatialInspector: React.FC<SpatialInspectorProps> = ({
  bed,
  roomRules,
  onUpdateRules,
  onRequestBedSwap,
  onReportMaintenance,
  onOpenPhotoLightbox,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col gap-5">
      {/* Header Info */}
      <div className="flex items-start justify-between">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            SPATIAL INSPECTOR
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-0.5">{bed.name}</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {bed.residentName} • {bed.bayType}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 text-xs font-semibold rounded-md ${
            bed.isAvailable
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-indigo-600 text-white'
          }`}
        >
          {bed.isAvailable ? 'Available' : 'Occupied'}
        </span>
      </div>

      {/* Realistic Photo Preview Banner */}
      <div className="relative rounded-xl overflow-hidden group border border-slate-200 aspect-[16/9] bg-slate-100">
        <img
          src={bed.photoUrl}
          alt={bed.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

        {/* Sunlight Badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-medium bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{bed.sunlightExposure}</span>
        </div>

        {/* View HD Photo Button */}
        <button
          onClick={() => onOpenPhotoLightbox(bed.photoUrl, bed.name)}
          className="absolute top-3 right-3 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-lg backdrop-blur-xs transition-colors cursor-pointer"
          title="Inspect Realistic Scene in Full Resolution"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Allocated Room Assets List */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          ALLOCATED ROOM ASSETS
        </h3>
        <div className="flex flex-col gap-2">
          {bed.assets.map((asset) => (
            <div
              key={asset.id}
              className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/60 flex items-center justify-center text-indigo-600">
                  {asset.icon === 'desk' && <Layers className="w-4 h-4" />}
                  {asset.icon === 'lock' && <Lock className="w-4 h-4" />}
                  {asset.icon === 'zap' && <Zap className="w-4 h-4" />}
                  {asset.icon === 'bed' && <ShieldCheck className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{asset.name}</h4>
                  <p className="text-[11px] text-slate-500">
                    {asset.detail}
                    {asset.code && (
                      <span className="ml-1 text-indigo-700 font-semibold font-mono">
                        {showCode ? asset.code : '••••'}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Status pill or Copy keycode action */}
              <div className="flex items-center gap-1.5">
                {asset.code ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowCode(!showCode)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-0.5 rounded cursor-pointer"
                    >
                      {showCode ? 'Hide' : 'Reveal'}
                    </button>
                    <button
                      onClick={() => handleCopyCode(asset.code!)}
                      className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                      title="Copy Keycode"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                      asset.status === 'secured'
                        ? 'bg-emerald-50 text-emerald-700'
                        : asset.status === 'optimal'
                        ? 'bg-amber-50 text-amber-700'
                        : asset.status === 'sanitized'
                        ? 'bg-sky-50 text-sky-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {asset.status === 'secured'
                      ? 'Secured'
                      : asset.status === 'optimal'
                      ? 'Surge Shield'
                      : asset.status === 'sanitized'
                      ? 'Sanitized'
                      : 'Window View'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Noise Level & Wi-Fi Telemetry Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>NOISE LEVEL</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {bed.noiseLevel} <span className="text-xs font-normal text-slate-500">({bed.noiseDb} dB)</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
          <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <Wifi className="w-3.5 h-3.5 text-slate-500" />
            <span>WI-FI SIGNAL</span>
          </div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            5GHz • <span className="font-mono text-indigo-600">{bed.wifiSpeed}</span>
          </div>
        </div>
      </div>

      {/* Main Action CTAs */}
      <div className="flex flex-col gap-2">
        <button
          onClick={onRequestBedSwap}
          className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          <span>Request In-Room Bed Swap</span>
        </button>

        <button
          onClick={onReportMaintenance}
          className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Report Room Maintenance</span>
        </button>
      </div>

      {/* Room 529 Rules Consensus */}
      <div className="pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-slate-900">Room 529 Rules Consensus</h3>
          <span className="text-emerald-600 text-xs flex items-center gap-1 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Active</span>
          </span>
        </div>

        <div className="space-y-2 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>Quiet study/lights off:</span>
            </div>
            <span className="font-semibold text-slate-900">{roomRules.lightsOff}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3.5 h-3.5 text-slate-400" />
              <span>Agreed night AC temperature:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">{roomRules.acTemp}°C Inverter</span>
              <button
                onClick={() =>
                  onUpdateRules({ acTemp: roomRules.acTemp === 24 ? 23 : 24 })
                }
                className="text-[10px] text-indigo-600 hover:text-indigo-800 underline font-medium cursor-pointer"
              >
                (Vote ±1°)
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkle className="w-3.5 h-3.5 text-slate-400" />
              <span>Housekeeping arrival:</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900">{roomRules.housekeepingArrival}</span>
              <button
                onClick={() => onUpdateRules({ dndActive: !roomRules.dndActive })}
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded cursor-pointer ${
                  roomRules.dndActive
                    ? 'bg-rose-100 text-rose-700'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {roomRules.dndActive ? 'DND On' : 'Set DND'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
