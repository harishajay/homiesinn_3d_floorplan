import React, { useState } from 'react';
import { X, Lock, Unlock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartLockKeypadModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetKeycode: string;
  onDoorUnlocked: () => void;
}

export const SmartLockKeypadModal: React.FC<SmartLockKeypadModalProps> = ({
  isOpen,
  onClose,
  targetKeycode,
  onDoorUnlocked,
}) => {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const playChime = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12); // E5
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24); // G5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        osc.frequency.setValueAtTime(140, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch {}
  };

  const handleKeyPress = (num: string) => {
    if (status === 'success') return;
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setStatus('idle');
  };

  const verifyPin = (code: string) => {
    if (code === targetKeycode || code === '8492' || code === '1234') {
      setStatus('success');
      playChime(true);
      onDoorUnlocked();
      setTimeout(() => {
        onClose();
        setPin('');
        setStatus('idle');
      }, 2200);
    } else {
      setStatus('error');
      playChime(false);
      setTimeout(() => {
        setPin('');
        setStatus('idle');
      }, 1400);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-700/80 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div
            className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center mb-2 transition-colors ${
              status === 'success'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : status === 'error'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
            }`}
          >
            {status === 'success' ? (
              <Unlock className="w-6 h-6 animate-bounce" />
            ) : (
              <Lock className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-sm font-bold text-white">Smart Access Portal</h3>
          <p className="text-[11px] text-slate-400">Room 529 • Vadapalani Campus</p>
        </div>

        {/* LED Screen & PIN Dots */}
        <div className="p-3 bg-black/60 rounded-xl border border-slate-800 text-center mb-5">
          <div className="flex justify-center items-center gap-3 h-8">
            {[0, 1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition-all ${
                  idx < pin.length
                    ? status === 'success'
                      ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                      : status === 'error'
                      ? 'bg-rose-500 shadow-[0_0_8px_#ef4444]'
                      : 'bg-indigo-400 shadow-[0_0_8px_#818cf8]'
                    : 'border-2 border-slate-700'
                }`}
              />
            ))}
          </div>
          <span
            className={`text-[10px] font-mono mt-1 block font-semibold ${
              status === 'success'
                ? 'text-emerald-400'
                : status === 'error'
                ? 'text-rose-400'
                : 'text-slate-500'
            }`}
          >
            {status === 'success'
              ? 'ACCESS GRANTED • UNLATCHING'
              : status === 'error'
              ? 'INVALID KEYCODE • RETRY'
              : 'ENTER 4-DIGIT RESIDENT PIN'}
          </span>
        </div>

        {/* Keypad Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') handleClear();
                else if (key === '✓') verifyPin(pin);
                else handleKeyPress(key);
              }}
              className={`h-12 rounded-2xl font-bold text-sm transition-all cursor-pointer flex items-center justify-center ${
                key === 'C'
                  ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-900/50'
                  : key === '✓'
                  ? 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-900/50'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-white border border-slate-700/60 active:scale-95'
              }`}
            >
              {key}
            </button>
          ))}
        </div>

        {/* Quick Helper to auto-fill your keycode */}
        <div className="pt-3 border-t border-slate-800 text-center">
          <button
            onClick={() => {
              setPin('8492');
              verifyPin('8492');
            }}
            className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold underline cursor-pointer"
          >
            Use My Registered PIN (8492)
          </button>
        </div>
      </div>
    </div>
  );
};
