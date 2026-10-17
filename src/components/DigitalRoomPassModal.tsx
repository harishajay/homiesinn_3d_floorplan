import React, { useState } from 'react';
import { X, QrCode, Key, Wifi, Phone, Check, Copy, Printer, ShieldCheck } from 'lucide-react';
import { BedPod } from '../types/coliving';

interface DigitalRoomPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  bed: BedPod;
}

export const DigitalRoomPassModal: React.FC<DigitalRoomPassModalProps> = ({
  isOpen,
  onClose,
  bed,
}) => {
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: 'key' | 'wifi') => {
    navigator.clipboard.writeText(text);
    if (type === 'key') {
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    } else {
      setCopiedWifi(true);
      setTimeout(() => setCopiedWifi(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-700/80 relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center">
            H
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide">HomiesInn Digital Pass</h3>
            <span className="text-[10px] text-indigo-400 font-medium">Verified Active Residency</span>
          </div>
        </div>

        {/* Pass Card Container */}
        <div className="bg-gradient-to-b from-indigo-900/40 to-slate-800/60 p-4 rounded-2xl border border-indigo-500/30">
          <div className="flex items-start justify-between pb-3 border-b border-white/10">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-300">RESIDENT</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Harish Aravind</h4>
              <p className="text-[11px] text-slate-300">Software Engineer • #529-B</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-300">ROOM & UNIT</span>
              <h4 className="text-sm font-bold text-white mt-0.5">Room 529</h4>
              <p className="text-[11px] text-slate-300">Vadapalani • Floor 2</p>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="py-4 flex flex-col items-center justify-center">
            <div className="p-3 bg-white rounded-xl shadow-lg">
              {/* Clean procedural QR representation */}
              <div className="w-32 h-32 bg-slate-900 p-2 rounded-lg flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-2 border-white p-0.5">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-7 h-7 border-2 border-white p-0.5">
                    <div className="w-full h-full bg-white" />
                  </div>
                </div>
                <div className="flex justify-center items-center gap-1 py-1">
                  <div className="w-2 h-2 bg-white" />
                  <div className="w-3 h-1 bg-white" />
                  <div className="w-1 h-3 bg-white" />
                  <div className="w-2 h-2 bg-indigo-400" />
                  <div className="w-3 h-2 bg-white" />
                </div>
                <div className="flex justify-between">
                  <div className="w-7 h-7 border-2 border-white p-0.5">
                    <div className="w-full h-full bg-white" />
                  </div>
                  <div className="w-7 h-7 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white" />
                  </div>
                </div>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 mt-2 font-mono">
              SCAN AT SMART ACCESS PORTAL
            </span>
          </div>

          {/* Quick Access Keys */}
          <div className="space-y-2 pt-2 border-t border-white/10 text-xs">
            {/* Locker Keycode */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-slate-300">Locker #B Keycode:</span>
                <span className="font-mono font-bold text-white tracking-widest">
                  {bed.locker.keycode}
                </span>
              </div>
              <button
                onClick={() => handleCopy(bed.locker.keycode, 'key')}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
              >
                {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Wi-Fi Credentials */}
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-700/50">
              <div className="flex items-center gap-2">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-slate-300">Wi-Fi:</span>
                <span className="font-mono font-semibold text-white">HomiesInn-529</span>
              </div>
              <button
                onClick={() => handleCopy('vadapalani529', 'wifi')}
                className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
              >
                {copiedWifi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Valid till 31 Dec 2026</span>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>
    </div>
  );
};
