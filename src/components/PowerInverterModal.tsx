import React, { useState } from 'react';
import { X, Zap, BatteryCharging, ShieldCheck, AlertTriangle, RefreshCw } from 'lucide-react';

interface PowerInverterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PowerInverterModal: React.FC<PowerInverterModalProps> = ({ isOpen, onClose }) => {
  const [isGridOutage, setIsGridOutage] = useState(false);
  const [failoverLagMs, setFailoverLagMs] = useState(0);

  if (!isOpen) return null;

  const handleSimulateOutage = () => {
    setIsGridOutage(true);
    setFailoverLagMs(0); // 0ms seamless pure sine wave transfer
  };

  const handleRestoreGrid = () => {
    setIsGridOutage(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700/80">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Power & Solar Inverter Telemetry</h3>
              <p className="text-xs text-slate-400">Room 529 • 15kVA Rooftop Solar Microgrid</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Power Source Status Card */}
        <div
          className={`p-4 rounded-2xl border my-4 transition-all ${
            isGridOutage
              ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider">PRIMARY SUPPLY</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                isGridOutage
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-emerald-500 text-slate-950'
              }`}
            >
              {isGridOutage ? '15kVA Solar Inverter Active' : 'TNEB City Grid 100% Online'}
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-white">230.4 V</span>
            <span className="text-xs text-slate-400">50.0 Hz Pure Sine Wave</span>
          </div>

          <div className="mt-2 text-xs flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {isGridOutage
                ? `Failover latency: ${failoverLagMs}ms • Wi-Fi 6 router stayed connected`
                : 'Zero utility surcharges • Clean surge-protected power'}
            </span>
          </div>
        </div>

        {/* Live Wattage Telemetry Breakdown */}
        <div className="space-y-2 mb-4">
          <span className="text-[10px] uppercase font-bold text-slate-400 block">
            ROOM 529 LIVE APPLIANCE LOAD
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span className="text-slate-300">Bed B 65W Hub:</span>
              <span className="font-mono font-bold text-amber-400">48 W</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span className="text-slate-300">Desk #2 Monitor:</span>
              <span className="font-mono font-bold text-amber-400">35 W</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span className="text-slate-300">Daikin Inverter AC:</span>
              <span className="font-mono font-bold text-cyan-400">180 W</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 flex justify-between items-center">
              <span className="text-slate-300">Total Unit Draw:</span>
              <span className="font-mono font-bold text-emerald-400">263 W</span>
            </div>
          </div>
        </div>

        {/* Inverter Battery Health */}
        <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700 flex items-center justify-between text-xs mb-4">
          <div className="flex items-center gap-2">
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-white block">LiFePO4 Campus Battery Bank</span>
              <span className="text-[11px] text-slate-400">96% Charged • 14.8 hrs continuous runtime</span>
            </div>
          </div>
          <span className="font-mono font-bold text-emerald-400">96%</span>
        </div>

        {/* Failover Simulator Action Button */}
        <div className="flex gap-2">
          {!isGridOutage ? (
            <button
              onClick={handleSimulateOutage}
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Simulate City Grid Cut (0ms Test)</span>
            </button>
          ) : (
            <button
              onClick={handleRestoreGrid}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Restore City Grid Supply</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
