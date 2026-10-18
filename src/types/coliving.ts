export type SpatialLayer = 'master' | 'electrical' | 'sunlight' | 'storage' | 'acoustic';

export type ElevationMode = 'isometric' | 'exploded' | 'cad' | 'firstperson';

export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night';

export type CampusZone = 'room-529' | 'first-floor-dining' | 'lounge-pantry' | 'rooftop-deck' | 'building-elevation';

export type AmbientSoundtrack = 'none' | 'sunrise-breeze' | 'balcony-rain' | 'binaural-study' | 'white-noise';

export interface DimensionMeasurement {
  id: string;
  label: string;
  distanceFt: string;
  distanceM: string;
  start: [number, number, number];
  end: [number, number, number];
  description: string;
}

export interface MealItem {
  id: string;
  name: string;
  cuisine: string;
  type: 'veg' | 'non-veg';
  calories: string;
  isSpecial?: boolean;
}

export interface DayMenu {
  day: string;
  date: string;
  breakfast: { timing: string; items: MealItem[] };
  lunch: { timing: string; items: MealItem[] };
  dinner: { timing: string; items: MealItem[] };
}

export interface BedCustomization {
  duvetColor: string;
  duvetName: string;
  readingLightOn: boolean;
  deskLampOn: boolean;
  deskAccessory: 'none' | 'dual-monitor' | 'bonsai-plant' | 'acoustic-corkboard';
  hydraulicBedLifted: boolean;
}

export interface WalkthroughHotspot {
  id: string;
  label: string;
  icon: string;
  position: [number, number, number];
  lookAt: [number, number, number];
}

export interface RoomAsset {
  id: string;
  name: string;
  detail: string;
  status: 'active' | 'secured' | 'sanitized' | 'optimal';
  icon: string;
  code?: string;
  wattage?: number;
}

export type RoomType = 'triple' | 'double' | 'single';

export interface FloorRoom {
  id: string; // 'room-201' | 'room-202' | 'room-203'
  number: string;
  name: string;
  type: RoomType;
  bedCount: number; // 3, 2, or 1
  beds: string[];
  sqft: number;
  monthlyRent: number;
  description: string;
  status: 'occupied' | 'partially-available' | 'available';
  color: string;
  balcony: boolean;
  attachedBath: boolean;
}

export interface BedPod {
  id: string; // 'bed-a' | 'bed-b' | 'bed-c' | etc.
  roomId: string; // 'room-201' | 'room-202' | 'room-203'
  roomNumber: string; // '201' | '202' | '203'
  roomName: string;
  roomType: RoomType;
  name: string;
  label: string;
  residentName?: string;
  residentRole?: string;
  residentCompany?: string;
  isCurrentUser?: boolean;
  isAvailable?: boolean;
  bayType: string;
  sunlightExposure: string;
  noiseLevel: string;
  noiseDb: number;
  wifiSpeed: string;
  wifiBand: string;
  photoUrl: string;
  assets: RoomAsset[];
  powerHub: {
    status: string;
    liveWattage: number;
    voltage: string;
    usbCType: string;
    surgeProtection: boolean;
  };
  locker: {
    number: string;
    keycode: string;
    status: string;
    capacity: string;
  };
  coordinates: {
    x: number;
    z: number;
    rotation: number;
  };
}

export interface RoomRules {
  quietHours: string;
  lightsOff: string;
  acTemp: number;
  housekeepingArrival: string;
  dndActive: boolean;
}

export interface Roommate {
  id: string;
  name: string;
  initials: string;
  role: string;
  company: string;
  bed: string;
  joinedDate: string;
  avatarColor: string;
  status: 'online' | 'away' | 'studying';
}

export interface Warden {
  name: string;
  role: string;
  block: string;
  phone: string;
  status: string;
  avatarUrl: string;
}

export interface LivingLedger {
  monthlyRent: number;
  securityDeposit: number;
  autoPayActive: boolean;
  nextDueDate: string;
  inclusions: string[];
  invoices: {
    id: string;
    month: string;
    amount: number;
    status: 'paid' | 'pending';
    paidOn: string;
    paymentMode: string;
    downloadUrl?: string;
  }[];
}

export interface MaintenanceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
}
