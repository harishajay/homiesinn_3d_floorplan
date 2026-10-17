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
import { SmartLockKeypadModal } from './components/SmartLockKeypadModal';
import { MealMenuModal } from './components/MealMenuModal';
import { PowerInverterModal } from './components/PowerInverterModal';
import { Footer } from './components/Footer';

import {
  ROOM_INFO,
  INITIAL_BEDS,
  INITIAL_ROOM_RULES,
  INITIAL_ROOMMATES,
  WARDEN_INFO,
  INITIAL_LEDGER,
  CAMPUS_FLOORS,
} from './data/mockData';

import {
  SpatialLayer,
  ElevationMode,
  TimeOfDay,
  BedCustomization,
  CampusZone,
} from './types/coliving';
import {
  Building2,
  BedDouble,
  Layers,
  Zap,
  Sun,
  Lock,
  Volume2,
  Sparkles,
  Eye,
  Utensils,
  KeyRound,
  ShieldCheck,
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

  // Multi-Zone & Dimensions
  const [campusZone, setCampusZone] = useState<CampusZone>('room-529');
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [selectedMeasurementId, setSelectedMeasurementId] = useState<string>('m-balcony-clearance');
  const [showFloorGuide, setShowFloorGuide] = useState<boolean>(false);

  // Smart Door Lock state
  const [isDoorUnlocked, setIsDoorUnlocked] = useState(false);
  const [isSmartLockModalOpen, setIsSmartLockModalOpen] = useState(false);

  // Meal & Inverter Modals
  const [isMealMenuOpen, setIsMealMenuOpen] = useState(false);
  const [isInverterModalOpen, setIsInverterModalOpen] = useState(false);

  // Bed Customization state
  const [bedCustomization, setBedCustomization] = useState<BedCustomization>({
    duvetColor: '#4f46e5',
    duvetName: 'Nordic Indigo',
    readingLightOn: true,
    deskLampOn: true,
    deskAccessory: 'dual-monitor',
    hydraulicBedLifted: false,
  });

  // Standard Modals
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

  const handleDoorUnlocked = () => {
    setIsDoorUnlocked(true);
    setTimeout(() => {
      setIsDoorUnlocked(false);
    }, 8000);
  };

  const handleOpenPhotoLightbox = (_photoUrl: string, title: string) => {
    if (title.includes('Rooftop') || title.includes('Sky Terrace')) {
      setRealisticSceneIndex(4);
    } else if (title.includes('Dining') || title.includes('Mess') || title.includes('Buffet') || title.includes('First Floor')) {
      setRealisticSceneIndex(3);
    } else if (title.includes('Building') || title.includes('Cutaway') || title.includes('Isometric')) {
      setRealisticSceneIndex(5);
    } else if (title.includes('Balcony')) {
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

          {/* Quick Hub Badges (Smart Door Keypad, Mess Menu, 360 Rooftop, Scenes) */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              onClick={() => {
                setRealisticSceneIndex(4);
                setIsRealisticSceneOpen(true);
              }}
              className="p-2.5 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-300 shadow-xs flex items-center gap-2 text-xs font-bold text-amber-900 cursor-pointer transition-all hover:scale-[1.02]"
              title="Watch 360° Rooftop Sunset Panorama"
            >
              <span>🌅</span>
              <span>Watch 360° Rooftop</span>
            </button>

            <button
              onClick={() => setIsRealisticSceneOpen(true)}
              className="p-2.5 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-xs flex items-center gap-2 text-xs font-bold text-indigo-900 cursor-pointer transition-all hover:scale-[1.02]"
              title="Inspect 6 Architectural Realistic Scenes"
            >
              <span>📸</span>
              <span>Realistic Scenes (6 Views)</span>
            </button>

            <button
              onClick={() => setIsSmartLockModalOpen(true)}
              className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              <KeyRound className="w-4 h-4 text-cyan-600" />
              <span>Smart Keypad ({isDoorUnlocked ? 'Open' : 'PIN 8492'})</span>
            </button>

            <button
              onClick={() => setIsMealMenuOpen(true)}
              className="p-2.5 bg-white hover:bg-slate-50 rounded-xl border border-slate-200/90 shadow-xs flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer transition-colors"
            >
              <Utensils className="w-4 h-4 text-amber-600" />
              <span>Chef's Menu (3 Meals)</span>
            </button>

            <button
              onClick={() => setIsInverterModalOpen(true)}
              className="p-2.5 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl border border-indigo-200 shadow-xs flex items-center gap-2 text-xs font-semibold text-indigo-900 cursor-pointer transition-colors"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Solar Inverter (15kVA)</span>
            </button>
          </div>
        </section>

        {/* Multi-Zone Campus Floor Switcher */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                  Campus Floor Switcher:
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => setCampusZone('building-elevation')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    campusZone === 'building-elevation'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                  title="View 4-Story Building Cutaway Elevation"
                >
                  <span>🏢</span>
                  <span>4-Story Building Cutaway</span>
                </button>
                <button
                  onClick={() => setCampusZone('room-529')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    campusZone === 'room-529'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                  title="View Your Private Allocated Pod Suite"
                >
                  <span>🛏️</span>
                  <span>Floor 2 • Suite 529 (Your Room)</span>
                </button>
                <button
                  onClick={() => setCampusZone('first-floor-dining')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    campusZone === 'first-floor-dining'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                  title="View First Floor Dining Mess Hall & Social Cafe"
                >
                  <span>🍲</span>
                  <span>Floor 1 • Dining Mess Hall (3 Meals)</span>
                </button>
                <button
                  onClick={() => setCampusZone('lounge-pantry')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    campusZone === 'lounge-pantry'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                  title="View 24/7 Co-Working Space and Silent Booths"
                >
                  <span>☕</span>
                  <span>Floor 2 • The Commons Co-Working</span>
                </button>
                <button
                  onClick={() => setCampusZone('rooftop-deck')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    campusZone === 'rooftop-deck'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                  title="View Floor 4 Rooftop with 360° Total Panoramic City View"
                >
                  <span>🌿</span>
                  <span>Floor 4 • 360° Rooftop Sky Terrace</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowFloorGuide(!showFloorGuide)}
                className="text-xs text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg border border-indigo-200/80 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>ℹ️</span>
                <span>{showFloorGuide ? 'Hide Floor Guide' : 'What does this Switcher do?'}</span>
              </button>
            </div>
          </div>

          {/* Expandable Floor Guide & Directory */}
          {showFloorGuide && (
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <span>🗺️</span>
                  <span>HomiesInn Campus Directory • How the Multi-Zone Floor Switcher Works</span>
                </span>
                <span className="text-[11px] text-slate-500">Interactive 3D WebGL Engine</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-1">
                {CAMPUS_FLOORS.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => setCampusZone(f.id as CampusZone)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      campusZone === f.id
                        ? 'bg-indigo-50/90 border-indigo-400 shadow-xs'
                        : 'bg-white hover:bg-slate-100 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold text-slate-800">
                      <span>{f.icon}</span>
                      <span className="truncate">{f.level}</span>
                    </div>
                    <span className="text-[10px] font-semibold text-indigo-600 block mb-1">{f.tag}</span>
                    <p className="text-[11px] text-slate-600 leading-snug line-clamp-3">{f.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-1.5 font-medium">{f.stats}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              measureMode={measureMode}
              onToggleMeasureMode={() => setMeasureMode(!measureMode)}
              selectedMeasurementId={selectedMeasurementId}
              onSelectMeasurement={setSelectedMeasurementId}
              isDoorUnlocked={isDoorUnlocked}
              onOpenSmartLock={() => setIsSmartLockModalOpen(true)}
              campusZone={campusZone}
              onCampusZoneChange={setCampusZone}
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
      <SmartLockKeypadModal
        isOpen={isSmartLockModalOpen}
        onClose={() => setIsSmartLockModalOpen(false)}
        targetKeycode="8492"
        onDoorUnlocked={handleDoorUnlocked}
      />

      <MealMenuModal
        isOpen={isMealMenuOpen}
        onClose={() => setIsMealMenuOpen(false)}
      />

      <PowerInverterModal
        isOpen={isInverterModalOpen}
        onClose={() => setIsInverterModalOpen(false)}
      />

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
