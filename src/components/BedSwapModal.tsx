import React, { useState } from 'react';
import { BedPod } from '../types/coliving';
import { X, CheckCircle2, ArrowRightLeft, Sparkles, ShieldCheck } from 'lucide-react';

interface BedSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  beds: BedPod[];
  currentBedId: string;
  onConfirmSwap: (targetBedId: string) => void;
}

export const BedSwapModal: React.FC<BedSwapModalProps> = ({
  isOpen,
  onClose,
  beds,
  currentBedId,
  onConfirmSwap,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<string>('bed-d');
  const [swapReason, setSwapReason] = useState('Prefer study nook orientation');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const currentBed = beds.find((b) => b.id === currentBedId);
  const targetBed = beds.find((b) => b.id === selectedTarget);
  const eligibleBeds = beds.filter((b) => b.id !== currentBedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      onConfirmSwap(selectedTarget);
      setIsSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Request In-Room Bed Swap</h3>
              <p className="text-xs text-slate-500">Room 529 • Corner Haven 4X Suite</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Bed Swap Request Dispatched</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your request to transition from {currentBed?.name} to {targetBed?.name} has been submitted to Cluster Warden Karthik. Since Bed D is currently vacant, no mutual roommate consent is required!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Current vs Target Comparison */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">CURRENT ALLOCATION</span>
                <p className="font-bold text-slate-900 mt-0.5">{currentBed?.name}</p>
                <p className="text-[11px] text-slate-500">{currentBed?.bayType}</p>
                <span className="text-[10px] text-indigo-600 font-semibold mt-1 inline-block">
                  Locker #{currentBed?.locker.number}
                </span>
              </div>
              <div className="border-l border-slate-200 pl-3">
                <span className="text-[10px] uppercase font-bold text-indigo-600 block">PROPOSED POD</span>
                <p className="font-bold text-indigo-950 mt-0.5">{targetBed?.name}</p>
                <p className="text-[11px] text-slate-500">{targetBed?.bayType}</p>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 inline-block">
                  {targetBed?.isAvailable ? 'Instant Move-In Ready' : 'Mutual Swap Approval'}
                </span>
              </div>
            </div>

            {/* Select Destination Pod */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">
                Select Destination Bed in Room 529:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {eligibleBeds.map((bed) => (
                  <button
                    key={bed.id}
                    type="button"
                    onClick={() => setSelectedTarget(bed.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      selectedTarget === bed.id
                        ? 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-900 block truncate">{bed.label}</span>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">
                      {bed.isAvailable ? 'Vacant (Instant)' : bed.residentName}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Reason for Swap (Shared with Warden & Roommates):
              </label>
              <select
                value={swapReason}
                onChange={(e) => setSwapReason(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              >
                <option>Prefer morning sunlight orientation</option>
                <option>Closer to workstation study nook</option>
                <option>Colleague / Friend moving into room</option>
                <option>Need deeper sleep acoustic zone</option>
              </select>
            </div>

            {/* Policy Notice */}
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-start gap-2 text-xs text-indigo-900">
              <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <span>
                Zero fee for in-room swaps. Keycode for new RFID locker will be automatically generated and provisioned to your profile.
              </span>
            </div>

            {/* Footer buttons */}
            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Submit Swap Request
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
