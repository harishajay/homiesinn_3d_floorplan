import React from 'react';
import { PhoneCall, ShieldAlert } from 'lucide-react';

export const EmergencySosBanner: React.FC = () => {
  return (
    <div className="bg-red-50/70 border border-red-200/80 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-900">24/7 Resident Emergency SOS Support</h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Instant warden support, on-call medical assistance, and security escalation
          </p>
        </div>
      </div>

      <a
        href="tel:+914448902200"
        className="self-start sm:self-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap"
      >
        <PhoneCall className="w-4 h-4" />
        <span>+91 44 4890 2200</span>
      </a>
    </div>
  );
};
