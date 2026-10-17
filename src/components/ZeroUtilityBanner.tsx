import React, { useState } from 'react';
import { ShieldCheck, X, CheckCircle2 } from 'lucide-react';

export const ZeroUtilityBanner: React.FC = () => {
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  return (
    <>
      <div className="bg-indigo-50/70 border border-indigo-100/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Zero Utility Hidden Surcharges</h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Includes 3 meals daily, daily room housekeeping, and unlimited Wi-Fi 6.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPolicyModal(true)}
          className="self-start sm:self-auto px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-xl border border-slate-200/90 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
        >
          View Policy Terms
        </button>
      </div>

      {showPolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">All-Inclusive Living Charter</h3>
              <button
                onClick={() => setShowPolicyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Chef-Crafted Meals</span>
                <p>Breakfast (07:30 - 10:00 AM), Lunch (12:30 - 02:30 PM), Dinner (07:30 - 10:00 PM). Fresh vegetarian & non-vegetarian rotational menus served in the ground-floor community mess hall.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">Electricity & Inverter AC</span>
                <p>No separate electricity bills or sub-meter surprises. AC usage covered with our 24°C energy consensus guidelines.</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="font-bold text-slate-900 block mb-1">High-Speed Wi-Fi 6</span>
                <p>Dual-band mesh Wi-Fi with uncapped symmetrical gigabit fiber backhaul. Low latency for remote software work and gaming.</p>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowPolicyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-medium rounded-lg text-xs"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
