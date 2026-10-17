import React, { useState } from 'react';
import { X, Utensils, CheckCircle2, Clock, Sparkles, Leaf } from 'lucide-react';
import { TODAY_MEALS } from '../data/mockData';

interface MealMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MealMenuModal: React.FC<MealMenuModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'breakfast' | 'lunch' | 'dinner'>('lunch');
  const [skipDinner, setSkipDinner] = useState(false);
  const [filter, setFilter] = useState<'all' | 'veg' | 'non-veg'>('all');

  if (!isOpen) return null;

  const currentMeal = TODAY_MEALS[activeTab];
  const filteredItems = currentMeal.items.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Chef's Mess Hall & Daily Menu</h3>
              <p className="text-xs text-slate-500">
                {TODAY_MEALS.day}, {TODAY_MEALS.date} • Ground Floor Dining Hall
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Times Tab Selector */}
        <div className="grid grid-cols-3 gap-2 mt-4 p-1 bg-slate-100 rounded-xl">
          {(['breakfast', 'lunch', 'dinner'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveTab(m)}
              className={`py-2 text-xs font-bold capitalize rounded-lg transition-all cursor-pointer ${
                activeTab === m
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Timing & Dietary Filter Bar */}
        <div className="flex items-center justify-between py-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Serving: {currentMeal.timing}</span>
          </div>

          <div className="flex items-center gap-1">
            {(['all', 'veg', 'non-veg'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md capitalize cursor-pointer ${
                  filter === f
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Items List */}
        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 flex items-start justify-between gap-3 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.type === 'veg'
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-red-600 text-red-600'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.type === 'veg' ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <span>{item.name}</span>
                    {item.isSpecial && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-full">
                        Chef's Special
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.cuisine} • {item.calories}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Green Food Save Action */}
        <div className="mt-4 p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Food Waste Prevention Incentive
              </span>
              <span className="text-[11px] text-emerald-700 block">
                Notify before 5:00 PM to earn ₹50 meal rebate credit
              </span>
            </div>
          </div>
          <button
            onClick={() => setSkipDinner(!skipDinner)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              skipDinner
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
            }`}
          >
            {skipDinner ? '✓ Dinner Skipped' : 'Skip Tonight'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>All 3 meals included in your living license fee</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
