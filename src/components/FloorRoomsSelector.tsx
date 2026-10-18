import React from 'react';
import { FloorRoom, BedPod } from '../types/coliving';
import { Bed, Users, User, CheckCircle2, AlertCircle, ArrowUpRight, Sparkles, Shield, Wifi } from 'lucide-react';

interface FloorRoomsSelectorProps {
  rooms: FloorRoom[];
  beds: BedPod[];
  selectedPodId: string;
  onSelectPod: (bedId: string) => void;
  activeFocusedRoom: 'all' | 'room-201' | 'room-202' | 'room-203';
  onFocusRoom: (roomId: 'all' | 'room-201' | 'room-202' | 'room-203') => void;
  onRequestBedSwap?: () => void;
}

export const FloorRoomsSelector: React.FC<FloorRoomsSelectorProps> = ({
  rooms,
  beds,
  selectedPodId,
  onSelectPod,
  activeFocusedRoom,
  onFocusRoom,
  onRequestBedSwap,
}) => {
  return (
    <section className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-4">
      {/* Header and Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
              Floor 2 Residential Plan • 3 Rooms in One Floor
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare layout configurations: Triple (3 Beds), Double (2 Beds), and Single (1 Bed) with live tenant status
          </p>
        </div>

        {/* Room Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto overflow-x-auto max-w-full scrollbar-none">
          <button
            onClick={() => onFocusRoom('all')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeFocusedRoom === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🏢 Show All 3 Rooms (Full Floor)
          </button>
          <button
            onClick={() => onFocusRoom('room-201')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFocusedRoom === 'room-201'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-800 hover:bg-indigo-100/60'
            }`}
          >
            <span>🛏️</span>
            <span>Room 201 (3 Beds)</span>
          </button>
          <button
            onClick={() => onFocusRoom('room-202')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFocusedRoom === 'room-202'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-sky-800 hover:bg-sky-100/60'
            }`}
          >
            <span>👥</span>
            <span>Room 202 (2 Beds)</span>
          </button>
          <button
            onClick={() => onFocusRoom('room-203')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
              activeFocusedRoom === 'room-203'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-800 hover:bg-emerald-100/60'
            }`}
          >
            <span>⭐</span>
            <span>Room 203 (1 Bed)</span>
          </button>
        </div>
      </div>

      {/* 3 Rooms Side-by-Side Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rooms.map((room) => {
          const roomBeds = beds.filter((b) => b.roomId === room.id);
          const isFocused = activeFocusedRoom === 'all' || activeFocusedRoom === room.id;
          const containsSelectedBed = roomBeds.some((b) => b.id === selectedPodId);

          return (
            <div
              key={room.id}
              className={`rounded-2xl border transition-all duration-200 p-4 flex flex-col justify-between ${
                containsSelectedBed
                  ? 'border-indigo-400 bg-indigo-50/20 shadow-sm ring-1 ring-indigo-400/30'
                  : isFocused
                  ? 'border-slate-200/90 bg-white hover:border-slate-300'
                  : 'border-slate-100 bg-slate-50/60 opacity-70'
              }`}
            >
              <div>
                {/* Room Badge Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-extrabold text-slate-900">{room.name.split('•')[0]}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          room.type === 'triple'
                            ? 'bg-indigo-100 text-indigo-700'
                            : room.type === 'double'
                            ? 'bg-sky-100 text-sky-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {room.type === 'triple' ? '3 Beds' : room.type === 'double' ? '2 Beds' : '1 Bed'}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium block mt-0.5">
                      {room.sqft} sq.ft • ₹{room.monthlyRent.toLocaleString('en-IN')}/month
                    </span>
                  </div>

                  <button
                    onClick={() => onFocusRoom(room.id as any)}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
                    title={`Focus 3D View on ${room.name}`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Key Amenities */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {room.balcony && (
                    <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">
                      🌅 Private Balcony
                    </span>
                  )}
                  {room.attachedBath && (
                    <span className="text-[10px] font-semibold bg-cyan-50 text-cyan-700 px-1.5 py-0.5 rounded">
                      🚿 Ensuite Bath
                    </span>
                  )}
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    ❄️ Daikin AC
                  </span>
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    ⚡ 65W PD
                  </span>
                </div>

                {/* Bed Pods in this Room */}
                <div className="space-y-2 mb-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Beds in this Room ({roomBeds.length}):
                  </span>

                  {roomBeds.map((b) => {
                    const isSelected = b.id === selectedPodId;
                    return (
                      <div
                        key={b.id}
                        onClick={() => onSelectPod(b.id)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : b.isCurrentUser
                            ? 'bg-indigo-50/80 hover:bg-indigo-100/80 border-indigo-200 text-indigo-950 font-semibold'
                            : b.isAvailable
                            ? 'bg-emerald-50/80 hover:bg-emerald-100/80 border-emerald-300 text-emerald-950'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Bed className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold">{b.name}</span>
                              {b.isCurrentUser && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${isSelected ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white'}`}>
                                  You
                                </span>
                              )}
                              {b.isAvailable && (
                                <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${isSelected ? 'bg-emerald-400 text-emerald-950' : 'bg-emerald-600 text-white'}`}>
                                  Vacant
                                </span>
                              )}
                            </div>
                            <span className={`text-[10px] block ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                              {b.residentName} • {b.residentCompany || b.bayType}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className={`text-[10px] font-mono block ${isSelected ? 'text-white' : 'text-slate-600'}`}>
                            {b.wifiSpeed}
                          </span>
                          <span className={`text-[9px] block ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {b.noiseDb} dB
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Quick Action */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500">
                  {room.type === 'triple'
                    ? '3 Private Pods'
                    : room.type === 'double'
                    ? '2 Twin Pods'
                    : '1 Executive Studio'}
                </span>

                <button
                  onClick={() => onFocusRoom(room.id as any)}
                  className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>Zoom 3D</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
