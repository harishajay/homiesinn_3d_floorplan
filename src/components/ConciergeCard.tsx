import React, { useState } from 'react';
import { Warden } from '../types/coliving';
import { Phone, AlertTriangle, LifeBuoy, X, CheckCircle2, Clock } from 'lucide-react';

interface ConciergeCardProps {
  warden: Warden;
  onOpenHelpdesk: () => void;
}

export const ConciergeCard: React.FC<ConciergeCardProps> = ({ warden, onOpenHelpdesk }) => {
  const [showCallModal, setShowCallModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [sosSent, setSosSent] = useState(false);

  const handleTriggerSos = () => {
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      setShowSosModal(false);
    }, 3000);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                <LifeBuoy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Concierge & Warden</h3>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Warden On Duty" />
          </div>

          {/* Warden Profile Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3 mb-4">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border border-slate-200 shrink-0">
              <img
                src={warden.avatarUrl}
                alt={warden.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">{warden.name}</h4>
              <p className="text-[11px] text-slate-500">
                {warden.role} • {warden.block}
              </p>
              <span className="text-[10px] text-emerald-700 font-medium">{warden.status}</span>
            </div>
          </div>

          {/* Quick Contact Buttons */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <button
              onClick={() => setShowCallModal(true)}
              className="py-2 px-3 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5 text-sky-600" />
              <span>Direct Call</span>
            </button>

            <button
              onClick={() => setShowSosModal(true)}
              className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Instant SOS</span>
            </button>
          </div>
        </div>

        {/* Helpdesk Ticket Button */}
        <button
          onClick={onOpenHelpdesk}
          className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Open Helpdesk Ticket</span>
        </button>
      </div>

      {/* Direct Call Modal */}
      {showCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Contact Cluster Warden</h3>
              <button onClick={() => setShowCallModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 text-center">
              <img
                src={warden.avatarUrl}
                alt={warden.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-indigo-100 mb-2"
              />
              <h4 className="text-sm font-bold text-slate-900">{warden.name}</h4>
              <p className="text-xs text-slate-500">Block 2 Resident Manager</p>
              <div className="mt-3 p-3 bg-slate-50 rounded-xl font-mono text-sm font-bold text-slate-800">
                {warden.phone}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">Available 24/7 for Room 529 queries</p>
            </div>
            <div className="flex gap-2">
              <a
                href={`tel:${warden.phone}`}
                className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold text-center hover:bg-indigo-700"
              >
                Call Warden
              </a>
              <button
                onClick={() => setShowCallModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-rose-200">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Trigger Resident SOS Alert</h3>
              <p className="text-xs text-slate-500 mt-1">
                This will immediately broadcast an urgent emergency signal with your room coordinates (Room 529, Bed B) to the campus security desk, cluster warden, and on-call medical responder.
              </p>

              {sosSent ? (
                <div className="my-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Security & Warden dispatched to Room 529!</span>
                </div>
              ) : (
                <div className="my-4 p-3 bg-rose-50 text-rose-800 rounded-xl text-xs flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4 text-rose-600" />
                  <span>Average response time: &lt; 90 seconds</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-2">
              {!sosSent ? (
                <>
                  <button
                    onClick={handleTriggerSos}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm"
                  >
                    Confirm SOS Dispatch
                  </button>
                  <button
                    onClick={() => setShowSosModal(false)}
                    className="px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowSosModal(false)}
                  className="w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-medium"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
