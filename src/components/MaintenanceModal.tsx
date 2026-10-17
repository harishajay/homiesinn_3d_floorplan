import React, { useState } from 'react';
import { X, Wrench, CheckCircle2, ShieldAlert } from 'lucide-react';

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ isOpen, onClose }) => {
  const [category, setCategory] = useState('ac');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticketId = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedTicketId(ticketId);
  };

  const handleDone = () => {
    setSubmittedTicketId(null);
    setDescription('');
    onClose();
  };

  const categories = [
    { id: 'ac', label: 'Air Conditioning / Thermostat' },
    { id: 'electrical', label: '65W Power Hub / Outlets' },
    { id: 'plumbing', label: 'En-Suite Bathroom / Water' },
    { id: 'wifi', label: 'Wi-Fi 6 Mesh Network' },
    { id: 'locker', label: 'RFID Locker Keypad' },
    { id: 'bed', label: 'Mattress / Bed Frame' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Report Room Maintenance</h3>
              <p className="text-xs text-slate-500">Room 529 • 2-Hour SLA Resolution</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submittedTicketId ? (
          <div className="py-6 text-center">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Maintenance Dispatch Confirmed</h4>
            <div className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-mono text-xs font-bold my-2">
              Ticket #{submittedTicketId}
            </div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Our on-site engineering crew and Cluster Warden Karthik have been notified. An engineer will attend Room 529 within 2 hours.
            </p>
            <button
              onClick={handleDone}
              className="mt-5 px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {/* Category selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Category:</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-2.5 rounded-xl border text-xs font-medium text-left transition-colors cursor-pointer ${
                      category === c.id
                        ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Describe the Issue:
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="E.g., Inverter AC temp sensor showing slight delay, please calibrate..."
                className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Priority */}
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold text-slate-700">Priority:</label>
              <div className="flex items-center gap-3 text-xs">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'normal'}
                    onChange={() => setPriority('normal')}
                    className="text-indigo-600"
                  />
                  <span>Normal (Same-day)</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    checked={priority === 'urgent'}
                    onChange={() => setPriority('urgent')}
                    className="text-rose-600"
                  />
                  <span className="text-rose-700 font-semibold flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    Urgent (&lt; 2 hrs)
                  </span>
                </label>
              </div>
            </div>

            {/* Buttons */}
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
                Dispatch Ticket
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
