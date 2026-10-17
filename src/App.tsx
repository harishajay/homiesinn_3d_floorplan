/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SpatialFloorplan3D } from './components/SpatialFloorplan3D';
import { SpatialInspector } from './components/SpatialInspector';
import { LivingLedgerCard } from './components/LivingLedgerCard';
import { RoommateCircleCard } from './components/RoommateCircleCard';
import { ConciergeCard } from './components/ConciergeCard';
import { ZeroUtilityBanner } from './components/ZeroUtilityBanner';
import { EmergencySosBanner } from './components/EmergencySosBanner';
import { BedSwapModal } from './components/BedSwapModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { RealisticSceneModal } from './components/RealisticSceneModal';
import { DigitalRoomPassModal } from './components/DigitalRoomPassModal';
import { PodPersonalizerBar } from './components/PodPersonalizerBar';
import { Footer } from './components/Footer';

import {
  ROOM_INFO,
  INITIAL_BEDS,
  INITIAL_ROOM_RULES,
  INITIAL_ROOMMATES,
  WARDEN_INFO,
  INITIAL_LEDGER,
} from './data/mockData';

import { SpatialLayer, ElevationMode, TimeOfDay, BedCustomization } from './types/coliving';
import {
  Building2,
  BedDouble,
  Layers,
  Zap,
  Sun,
  Lock,
  Volume2,
  Sparkles,
  Eye
} from 'lucide-react';

export default function App() {
  // Main state
  const [beds, setBeds] = useState(INITIAL_BEDS);
  const [selectedPodId, setSelectedPodId] = useState<string>('bed-b');
  const [activeLayer, setActiveLayer] = useState<SpatialLayer>('master');
  const [elevationMode, setElevationMode] = useState<ElevationMode>('isometric');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [roomRules, setRoomRules] = useState(INITIAL_ROOM_RULES);
  const [ledger] = useState(INITIAL_LEDGER);
  const [roommates] = useState(INITIAL_ROOMMATES);
  const [warden] = useState(WARDEN_INFO);

  // Bed Customization & Personalizer state
  const [bedCustomization, setBedCustomization] = useState<BedCustomization>({
    duvetColor: '#4f46e5',
    duvetName: 'Nordic Indigo',
    readingLightOn: true,
    deskLampOn: true,
    deskAccessory: 'dual-monitor',
    hydraulicBedLifted: false,
  });

  // Modals
  const [isBedSwapOpen, setIsBedSwapOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isRealisticSceneOpen, setIsRealisticSceneOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [realisticSceneIndex, setRealisticSceneIndex] = useState(0);

  const selectedBed = beds.find((b) => b.id === selectedPodId) || beds[0];

  const handleUpdateCustomization = (custom: Partial<BedCustomization>) => {
    setBedCustomization((prev) => ({ ...prev, ...custom }));
  };

  const handleConfirmSwap = (targetBedId: string) => {
    setBeds((prev) =>
      prev.map((bed) => {
        if (bed.id === 'bed-b') {
          return {
            ...bed,
            isCurrentUser: false,
            isAvailable: true,
            residentName: 'Open Pod',
            residentRole: 'Ready for Move-In',
          };
        }
        if (bed.id === targetBedId) {
          return {
            ...bed,
            isCurrentUser: true,
            isAvailable: false,
            residentName: 'Harish Aravind',
            residentRole: 'Software Engineer',
          };
        }
        return bed;
      })
    );
    setSelectedPodId(targetBedId);
  };

  const handleUpdateRules = (newRules: Partial<typeof roomRules>) => {
    setRoomRules((prev) => ({ ...prev, ...newRules }));
  };

  const handleOpenPhotoLightbox = (_photoUrl: string, title: string) => {
    if (title.includes('Balcony')) {
      setRealisticSceneIndex(2);
    } else if (title.includes('Desk') || title.includes('Workstation')) {
      setRealisticSceneIndex(1);
    } else {
      setRealisticSceneIndex(0);
    }
    setIsRealisticSceneOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f8fb] text-slate-900">
      {/* Top Navigation */}
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Booking Hero Bar */}
        <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold">
              <span className="bg-indigo-600 text-white px-2 py-0.5 rounded-md">ACTIVE STAY</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700">Lease Confirmed</span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">Move-in Completed</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              My Bookings & Spatial Floorplan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-2xl">
              Explore your allocated room ecosystem, inspect roommate layout, and manage residency perks in real time with interactive 3D spatial elevation.
            </p>
          </div>

          {/* Room Allocation Info Pills */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="p-3 bg-white rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-3 min-w-[200px]">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  PROPERTY & UNIT
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-900">
                  {ROOM_INFO.property} • Room {ROOM_INFO.roomNumber}
                </span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-200 shadow-xs flex items-center gap-3 min-w-[200px]">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <BedDouble className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-700 block tracking-wider">
                  ALLOCATED BED
                </span>
                <span className="text-xs sm:text-sm font-bold text-indigo-950">
                  {beds.find((b) => b.isCurrentUser)?.label || 'Bed B (Window Pod)'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Spatial Layer Selector Bar & Elevation View Mode Controls */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          {/* Spatial Layer Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mr-1 shrink-0">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>Interactive Spatial Layers</span>
            </div>

            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-xs shrink-0">
              <button
                onClick={() => setActiveLayer('master')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLayer === 'master'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Master Layout</span>
              </button>

              <button
                onClick={() => setActiveLayer('electrical')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLayer === 'electrical'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Electrical & Charging</span>
              </button>

              <button
                onClick={() => setActiveLayer('sunlight')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLayer === 'sunlight'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Sunlight & Airflow</span>
              </button>

              <button
                onClick={() => setActiveLayer('storage')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLayer === 'storage'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-blue-500" />
                <span>Storage & Lockers</span>
              </button>

              <button
                onClick={() => setActiveLayer('acoustic')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  activeLayer === 'acoustic'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Acoustic & Noise</span>
              </button>
            </div>
          </div>

          {/* Elevation View Modes including First-Person Walkthrough */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/90 shadow-xs self-start sm:self-auto shrink-0 overflow-x-auto">
            <button
              onClick={() => setElevationMode('isometric')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                elevationMode === 'isometric' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Isometric 3D
            </button>
            <button
              onClick={() => setElevationMode('firstperson')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                elevationMode === 'firstperson'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Step Inside (360°)</span>
            </button>
            <button
              onClick={() => setElevationMode('exploded')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                elevationMode === 'exploded' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exploded Layers
            </button>
            <button
              onClick={() => setElevationMode('cad')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                elevationMode === 'cad' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              CAD Plan
            </button>
            <button
              onClick={() => {
                setRealisticSceneIndex(0);
                setIsRealisticSceneOpen(true);
              }}
              className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>HD Photo Match</span>
            </button>
          </div>
        </section>

        {/* 3D Model Viewport + Spatial Inspector */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main 3D Model Canvas Viewport */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <SpatialFloorplan3D
              beds={beds}
              selectedPodId={selectedPodId}
              onSelectPod={setSelectedPodId}
              activeLayer={activeLayer}
              elevationMode={elevationMode}
              onElevationModeChange={setElevationMode}
              timeOfDay={timeOfDay}
              onTimeOfDayChange={setTimeOfDay}
              bedCustomization={bedCustomization}
              onUpdateCustomization={handleUpdateCustomization}
            />

            {/* Pod Personalizer & Ambient Focus Soundscape Bar */}
            <PodPersonalizerBar
              customization={bedCustomization}
              onUpdate={handleUpdateCustomization}
              onOpenPassModal={() => setIsPassModalOpen(true)}
            />

            {/* Zero Utility Surcharges Banner */}
            <ZeroUtilityBanner />
          </div>

          {/* Right Sidebar: Dynamic Spatial Inspector */}
          <div className="lg:col-span-4">
            <SpatialInspector
              bed={selectedBed}
              roomRules={roomRules}
              onUpdateRules={handleUpdateRules}
              onRequestBedSwap={() => setIsBedSwapOpen(true)}
              onReportMaintenance={() => setIsMaintenanceOpen(true)}
              onOpenPhotoLightbox={handleOpenPhotoLightbox}
            />
          </div>
        </section>

        {/* Bottom Living Ecosystem Section: Ledger, Roommate Circle, Warden Concierge */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* My Living Ledger Card */}
          <LivingLedgerCard ledger={ledger} />

          {/* Roommate Circle Card */}
          <RoommateCircleCard roommates={roommates} />

          {/* Concierge & Warden Card */}
          <ConciergeCard
            warden={warden}
            onOpenHelpdesk={() => setIsMaintenanceOpen(true)}
          />
        </section>

        {/* 24/7 Resident Emergency SOS Support Banner */}
        <EmergencySosBanner />
      </main>

      {/* Interactive Modals */}
      <BedSwapModal
        isOpen={isBedSwapOpen}
        onClose={() => setIsBedSwapOpen(false)}
        beds={beds}
        currentBedId={beds.find((b) => b.isCurrentUser)?.id || 'bed-b'}
        onConfirmSwap={handleConfirmSwap}
      />

      <MaintenanceModal
        isOpen={isMaintenanceOpen}
        onClose={() => setIsMaintenanceOpen(false)}
      />

      <RealisticSceneModal
        isOpen={isRealisticSceneOpen}
        onClose={() => setIsRealisticSceneOpen(false)}
        initialSceneIndex={realisticSceneIndex}
      />

      <DigitalRoomPassModal
        isOpen={isPassModalOpen}
        onClose={() => setIsPassModalOpen(false)}
        bed={beds.find((b) => b.isCurrentUser) || beds[0]}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
