import React, { useState } from 'react';
import { X, Sun, Compass, Maximize2, Sparkles, Volume2, ShieldCheck } from 'lucide-react';
import { BED_POD_B_PHOTO, BED_POD_DESK_PHOTO, BALCONY_PHOTO } from '../data/mockData';

interface RealisticSceneModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSceneIndex?: number;
}

export const RealisticSceneModal: React.FC<RealisticSceneModalProps> = ({
  isOpen,
  onClose,
  initialSceneIndex = 0,
}) => {
  const [activeScene, setActiveScene] = useState(initialSceneIndex);

  if (!isOpen) return null;

  const scenes = [
    {
      id: 'bed-b',
      title: 'Bed Pod B • Direct Morning Sun',
      subtitle: 'Allocated to Harish Aravind (You) • Window & Balcony Bay',
      photoUrl: BED_POD_B_PHOTO,
      lux: '850 Lux (08:30 AM)',
      orientation: '72° East (Sunrise)',
      acoustics: 'STC 48 Acoustic Core',
      features: [
        'Direct morning sunlight streams across the linen bedding from 06:30 AM',
        'Solid oak headboard with concealed 2700K warm LED reading strip',
        'Under-bed 450L hydraulic lift storage compartment with luggage space',
        'Circular vanity mirror positioned for optimal natural illumination'
      ]
    },
    {
      id: 'desk-workspace',
      title: 'Workstation Study Nook #2',
      subtitle: 'Dedicated Workspace • Oak Shelving & Ergonomic Task Chair',
      photoUrl: BED_POD_DESK_PHOTO,
      lux: '650 Lux Diffuse Daylight',
      orientation: 'North-East Glare-Free',
      acoustics: 'Whisper Zone (32 dB)',
      features: [
        'Solid oak work surface with dual cable-management grommets',
        '65W USB-C Power Delivery 3.0 wall charging hub + 230V outlet',
        'Floating bookshelf and minimal acoustic fabric wall backing',
        'Ergonomic breathable mesh task chair with lumbar adjustment'
      ]
    },
    {
      id: 'balcony-sunrise',
      title: 'Sunrise Balcony • City Canopy',
      subtitle: 'Adjoining Room 529 • Floor 2 North-East Panoramic Vista',
      photoUrl: BALCONY_PHOTO,
      lux: '14,000 Lux Exterior Sun',
      orientation: 'East-Facing Open Air',
      acoustics: 'Fresh Air & Greenery',
      features: [
        'Sliding tempered double-pane acoustic glass patio doors',
        'Bistro coffee table and weather-resistant lounge seating',
        'Potted botanical greenery (Fiddle Leaf Fig & Succulents)',
        'Private sunrise coffee & morning contemplation deck'
      ]
    }
  ];

  const current = scenes[activeScene];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 text-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col">
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Realistic Scene Inspector • Room 529</h3>
              <p className="text-xs text-slate-400">High-Resolution Architectural Photographic Match</p>
            </div>
          </div>

          {/* Scene selector tabs */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
            {scenes.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setActiveScene(idx)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  activeScene === idx ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.title.split('•')[0]}
              </button>
            ))}
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Photo + Spatial Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[75vh] overflow-y-auto">
          {/* Main Photo Showcase */}
          <div className="md:col-span-8 relative bg-black flex items-center justify-center">
            <img
              src={current.photoUrl}
              alt={current.title}
              referrerPolicy="no-referrer"
              className="w-full h-full max-h-[520px] object-cover"
            />
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>{current.lux}</span>
            </div>
          </div>

          {/* Sidebar Specifications */}
          <div className="md:col-span-4 p-5 bg-slate-900 border-l border-slate-800 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider block">
                SPATIAL REALISM DATA
              </span>
              <h4 className="text-base font-bold text-white mt-1">{current.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{current.subtitle}</p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">ORIENTATION</span>
                  <span className="text-xs font-bold text-white">{current.orientation}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 block">ACOUSTIC RATING</span>
                  <span className="text-xs font-bold text-white">{current.acoustics}</span>
                </div>
              </div>

              <div className="mt-4">
                <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                  ARCHITECTURAL HIGHLIGHTS
                </h5>
                <ul className="space-y-2 text-xs text-slate-300">
                  {current.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Match verified with 3D elevation</span>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold"
              >
                Back to 3D Floorplan
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
