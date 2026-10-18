import { BedPod, RoomRules, Roommate, Warden, LivingLedger, FloorRoom } from '../types/coliving';

export const BED_POD_B_PHOTO = '/src/assets/images/bed_pod_b_window_1792234011674.jpg';
export const BED_POD_DESK_PHOTO = '/src/assets/images/bed_pod_desk_1792234030764.jpg';
export const BALCONY_PHOTO = '/src/assets/images/balcony_sunrise_1792234048143.jpg';
export const WARDEN_PHOTO = '/src/assets/images/warden_karthik_1792234064704.jpg';
export const ROOFTOP_PANORAMIC_PHOTO = '/src/assets/images/rooftop_panoramic_1792239064247.jpg';
export const FIRST_FLOOR_DINING_PHOTO = '/src/assets/images/first_floor_dining_1792239065215.jpg';
export const BUILDING_ISOMETRIC_PHOTO = '/src/assets/images/building_isometric_1792239064896.jpg';

export const CAMPUS_FLOORS = [
  {
    id: 'building-elevation',
    name: '4-Story Isometric Building',
    level: 'Full Stack',
    icon: '🏢',
    tag: '3D Cutaway Elevation',
    description: 'Complete architectural isometric elevation cutaway showing Ground Lobby, 1st Fl Dining, 2nd Fl Suite 529, 3rd Fl Studios, and Rooftop Terrace.',
    stats: '4 Levels • 42 Residents • 100% Inverter Backup'
  },
  {
    id: 'room-529',
    name: 'Floor 2 • Suite 529 (Your Room)',
    level: 'Floor 2',
    icon: '🛏️',
    tag: 'Active Residency',
    description: 'Corner Haven 4X Pod Suite. Allocated Bed Pod B with east morning sun, private en-suite bathroom, smart keylock, workstation, and sunrise balcony.',
    stats: '432 sq.ft • 4 Pods • Balcony Bay'
  },
  {
    id: 'first-floor-dining',
    name: 'Floor 1 • Dining Mess Hall & Cafe',
    level: 'Floor 1',
    icon: '🍲',
    tag: '3 Daily Meals Included',
    description: 'Hot buffet daily feast, barista coffee bar, communal oak tables, and social hangout lounge. Breakfast, lunch, and dinner served daily.',
    stats: '1,200 sq.ft • 60 Seater • Barista Station'
  },
  {
    id: 'lounge-pantry',
    name: 'Floor 2 • The Commons Co-Working',
    level: 'Floor 2 East',
    icon: '☕',
    tag: '24/7 Deep Work',
    description: 'High-speed Wi-Fi 6 mesh workspace, silent calling pods, espresso bar, and collaborative whiteboard tables adjoining the residential wings.',
    stats: '500 Mbps Mesh • 4 Silent Booths • 24/7 Access'
  },
  {
    id: 'rooftop-deck',
    name: 'Floor 4 • Rooftop Sky Terrace (360°)',
    level: 'Rooftop',
    icon: '🌿',
    tag: '360° Panoramic View',
    description: 'Total 360-degree skyline view, wooden timber pergola with warm evening string lights, artificial turf lawn, firepit lounge, and sunset yoga deck.',
    stats: '1,500 sq.ft • 360° Horizon • Solar Pergola'
  }
];

export const FLOOR_ROOMS: FloorRoom[] = [
  {
    id: 'room-201',
    number: '201',
    name: 'Room 201 • Triple Sharing Suite (3 Beds)',
    type: 'triple',
    bedCount: 3,
    beds: ['bed-b', 'bed-a', 'bed-c'],
    sqft: 390,
    monthlyRent: 5000,
    description: 'Triple Occupancy Pod Suite. Features 3 private bed pods with dedicated workstation desks, steel RFID lockers, direct morning sunlight, private sunrise balcony, and ensuite bath.',
    status: 'occupied',
    color: '#4f46e5',
    balcony: true,
    attachedBath: true,
  },
  {
    id: 'room-202',
    number: '202',
    name: 'Room 202 • Double Sharing Suite (2 Beds)',
    type: 'double',
    bedCount: 2,
    beds: ['bed-202-a', 'bed-202-b'],
    sqft: 290,
    monthlyRent: 7500,
    description: 'Double Occupancy Premium Twin Suite. 2 spacious bed pods with acoustic partition wall, twin ergonomic desks, individual 450L storage, and attached bathroom.',
    status: 'partially-available',
    color: '#0284c7',
    balcony: true,
    attachedBath: true,
  },
  {
    id: 'room-203',
    number: '203',
    name: 'Room 203 • Single Solo Studio (1 Bed)',
    type: 'single',
    bedCount: 1,
    beds: ['bed-203-solo'],
    sqft: 220,
    monthlyRent: 12000,
    description: 'Private Single-Occupancy Executive Studio. 1 King single pod, executive oak study workstation, private lounge seating, personal mini-bar counter, and ensuite shower.',
    status: 'occupied',
    color: '#059669',
    balcony: true,
    attachedBath: true,
  },
];

export const ROOM_INFO = {
  property: 'Vadapalani',
  roomNumber: 'Floor 2 (Rooms 201, 202, 203)',
  unitType: 'Multi-Room Residential Floor (Triple, Double, Single)',
  floor: 'Floor 2 Residential Wing',
  dimensions: '68 ft × 36 ft (2,450 sq.ft)',
  ceilingHeight: '10.5 ft',
  hvacSystem: 'Daikin Dual Inverter Smart Dual-Zone 2.0 Ton',
  airQualityStatus: 'Optimized • Filter Cleaned 2d ago',
  aqiValue: 28,
  pm25: '8.2 µg/m³',
  humidity: '52%',
  powerStatus: '100% Grid + Seamless 15kVA Auto-Inverter Backup'
};

export const INITIAL_BEDS: BedPod[] = [
  // =====================================
  // ROOM 201: TRIPLE SHARING (3 BEDS)
  // =====================================
  {
    id: 'bed-b',
    roomId: 'room-201',
    roomNumber: '201',
    roomName: 'Room 201 (Triple Suite)',
    roomType: 'triple',
    name: 'Bed 201-B (Your Bed)',
    label: 'Bed 201-B (Window Pod)',
    residentName: 'Harish Aravind',
    residentRole: 'Software Engineer',
    residentCompany: 'Resident #201-B',
    isCurrentUser: true,
    isAvailable: false,
    bayType: 'Window & Balcony Bay',
    sunlightExposure: 'Direct East-Facing Morning Sun (06:30 - 11:00 AM)',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 32,
    wifiSpeed: '480 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-201',
    photoUrl: BED_POD_B_PHOTO,
    coordinates: { x: -4.5, z: 2.2, rotation: 0 },
    assets: [
      {
        id: 'asset-desk',
        name: 'Workstation Desk #2',
        detail: 'Window View • Oak Veneer Finish',
        status: 'active',
        icon: 'desk'
      },
      {
        id: 'asset-locker',
        name: 'Steel RFID Locker #B',
        detail: 'Keycode: 8492 • 450L Capacity',
        status: 'secured',
        icon: 'lock',
        code: '8492'
      },
      {
        id: 'asset-hub',
        name: '65W Type-C Wall Hub',
        detail: 'Surge Shield • 230V Grounded',
        status: 'optimal',
        icon: 'zap',
        wattage: 48
      },
      {
        id: 'asset-mattress',
        name: 'Orthopedic 5-Zone Core',
        detail: 'Sanitized Antimicrobial Memory Foam',
        status: 'sanitized',
        icon: 'bed'
      }
    ],
    powerHub: {
      status: 'Active (48W Draw)',
      liveWattage: 48,
      voltage: '230V AC ±2%',
      usbCType: '65W Power Delivery 3.0',
      surgeProtection: true
    },
    locker: {
      number: '201-B',
      keycode: '8492',
      status: 'Locked & Encrypted',
      capacity: '450 Liters (Hydraulic under-bed + vertical wardrobe)'
    }
  },
  {
    id: 'bed-a',
    roomId: 'room-201',
    roomNumber: '201',
    roomName: 'Room 201 (Triple Suite)',
    roomType: 'triple',
    name: 'Bed 201-A',
    label: 'Bed 201-A (Study Bay)',
    residentName: 'Praveen M.',
    residentRole: 'Frontend Dev',
    residentCompany: 'TCS',
    isCurrentUser: false,
    isAvailable: false,
    bayType: 'North Wall Study Alcove',
    sunlightExposure: 'Soft Diffuse Natural Daylighting',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 34,
    wifiSpeed: '470 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-201',
    photoUrl: BED_POD_DESK_PHOTO,
    coordinates: { x: -8.0, z: -2.4, rotation: 0 },
    assets: [
      {
        id: 'asset-desk-a',
        name: 'Workstation Desk #1',
        detail: 'Study Nook with Bookshelf',
        status: 'active',
        icon: 'desk'
      },
      {
        id: 'asset-locker-a',
        name: 'Steel RFID Locker #A',
        detail: 'Resident Locked',
        status: 'secured',
        icon: 'lock'
      },
      {
        id: 'asset-hub-a',
        name: '65W Type-C Wall Hub',
        detail: 'Surge Shield Active',
        status: 'optimal',
        icon: 'zap',
        wattage: 62
      },
      {
        id: 'asset-mattress-a',
        name: 'Orthopedic 5-Zone Core',
        detail: 'Sanitized Antimicrobial Core',
        status: 'sanitized',
        icon: 'bed'
      }
    ],
    powerHub: {
      status: 'Active (62W Draw)',
      liveWattage: 62,
      voltage: '230V AC',
      usbCType: '65W PD',
      surgeProtection: true
    },
    locker: {
      number: '201-A',
      keycode: '••••',
      status: 'Locked',
      capacity: '450 Liters'
    }
  },
  {
    id: 'bed-c',
    roomId: 'room-201',
    roomNumber: '201',
    roomName: 'Room 201 (Triple Suite)',
    roomType: 'triple',
    name: 'Bed 201-C',
    label: 'Bed 201-C (Quiet Alcove)',
    residentName: 'Rohan K.',
    residentRole: 'UI Engineer',
    residentCompany: 'Zoho',
    isCurrentUser: false,
    isAvailable: false,
    bayType: 'South Corridor Bay',
    sunlightExposure: 'Indirect Afternoon Reflection',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 35,
    wifiSpeed: '465 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-201',
    photoUrl: BED_POD_DESK_PHOTO,
    coordinates: { x: -8.0, z: 2.2, rotation: 0 },
    assets: [
      {
        id: 'asset-desk-c',
        name: 'Workstation Desk #3',
        detail: 'Dual Monitor Mount Ready',
        status: 'active',
        icon: 'desk'
      },
      {
        id: 'asset-locker-c',
        name: 'Steel RFID Locker #C',
        detail: 'Resident Locked',
        status: 'secured',
        icon: 'lock'
      },
      {
        id: 'asset-hub-c',
        name: '65W Type-C Wall Hub',
        detail: 'Surge Shield Active',
        status: 'optimal',
        icon: 'zap',
        wattage: 38
      },
      {
        id: 'asset-mattress-c',
        name: 'Orthopedic 5-Zone Core',
        detail: 'Sanitized Antimicrobial Core',
        status: 'sanitized',
        icon: 'bed'
      }
    ],
    powerHub: {
      status: 'Active (38W Draw)',
      liveWattage: 38,
      voltage: '230V AC',
      usbCType: '65W PD',
      surgeProtection: true
    },
    locker: {
      number: '201-C',
      keycode: '••••',
      status: 'Locked',
      capacity: '450 Liters'
    }
  },

  // =====================================
  // ROOM 202: DOUBLE SHARING (2 BEDS)
  // =====================================
  {
    id: 'bed-202-a',
    roomId: 'room-202',
    roomNumber: '202',
    roomName: 'Room 202 (Double Suite)',
    roomType: 'double',
    name: 'Bed 202-A',
    label: 'Bed 202-A (Window Pod)',
    residentName: 'Vikram S.',
    residentRole: 'Cloud Architect',
    residentCompany: 'Amazon Web Services',
    isCurrentUser: false,
    isAvailable: false,
    bayType: 'North Window Bay',
    sunlightExposure: 'Morning Daylighting (07:30 - 11:00 AM)',
    noiseLevel: 'Silent Study',
    noiseDb: 31,
    wifiSpeed: '490 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-202',
    photoUrl: BED_POD_DESK_PHOTO,
    coordinates: { x: -0.5, z: 2.2, rotation: 0 },
    assets: [
      { id: 'asset-desk-202a', name: 'Workstation Desk #202-A', detail: 'Oak Workspace', status: 'active', icon: 'desk' },
      { id: 'asset-locker-202a', name: 'RFID Locker #202-A', detail: 'Locked', status: 'secured', icon: 'lock' },
      { id: 'asset-hub-202a', name: '65W Type-C Hub', detail: 'Surge Shield', status: 'optimal', icon: 'zap', wattage: 42 }
    ],
    powerHub: { status: 'Active (42W)', liveWattage: 42, voltage: '230V AC', usbCType: '65W PD', surgeProtection: true },
    locker: { number: '202-A', keycode: '••••', status: 'Locked', capacity: '450 Liters' }
  },
  {
    id: 'bed-202-b',
    roomId: 'room-202',
    roomNumber: '202',
    roomName: 'Room 202 (Double Suite)',
    roomType: 'double',
    name: 'Bed 202-B (Vacant)',
    label: 'Bed 202-B (Open Pod)',
    residentName: 'Open Pod',
    residentRole: 'Ready for Move-In',
    residentCompany: 'Double Sharing • ₹7,500/mo',
    isCurrentUser: false,
    isAvailable: true,
    bayType: 'Central Study Alcove',
    sunlightExposure: 'Soft Ambient Daylighting',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 30,
    wifiSpeed: '480 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-202',
    photoUrl: BALCONY_PHOTO,
    coordinates: { x: 2.2, z: -2.4, rotation: 0 },
    assets: [
      { id: 'asset-desk-202b', name: 'Workstation Desk #202-B', detail: 'Sanitized & Ready', status: 'active', icon: 'desk' },
      { id: 'asset-locker-202b', name: 'RFID Locker #202-B', detail: 'PIN Reset Ready', status: 'sanitized', icon: 'lock', code: '0000' }
    ],
    powerHub: { status: 'Standby (0W)', liveWattage: 0, voltage: '230V AC', usbCType: '65W PD', surgeProtection: true },
    locker: { number: '202-B', keycode: '0000', status: 'Vacant & Clean', capacity: '450 Liters' }
  },

  // =====================================
  // ROOM 203: SINGLE SOLO STUDIO (1 BED)
  // =====================================
  {
    id: 'bed-203-solo',
    roomId: 'room-203',
    roomNumber: '203',
    roomName: 'Room 203 (Single Studio)',
    roomType: 'single',
    name: 'Bed 203-Solo (Private Studio)',
    label: 'Bed 203-Solo (Executive King Single)',
    residentName: 'Ananya R.',
    residentRole: 'Staff Product Designer',
    residentCompany: 'Stripe',
    isCurrentUser: false,
    isAvailable: false,
    bayType: 'Private Executive Suite',
    sunlightExposure: 'All-Day Panoramic Sun & Private Balcony',
    noiseLevel: 'Ultra Quiet (Acoustic Foam Walls)',
    noiseDb: 28,
    wifiSpeed: '520 Mbps',
    wifiBand: 'Wi-Fi 6 • HomiesInn-Studio-203',
    photoUrl: BED_POD_B_PHOTO,
    coordinates: { x: 7.2, z: 0.2, rotation: 0 },
    assets: [
      { id: 'asset-desk-203', name: 'Executive Oak Desk', detail: 'Dual 27-inch Ergonomic Mount', status: 'active', icon: 'desk' },
      { id: 'asset-lounge-203', name: 'Bouclé Lounge Armchair', detail: 'Private Relaxation Nook', status: 'optimal', icon: 'sparkles' },
      { id: 'asset-locker-203', name: 'Floor-to-Ceiling Wardrobe', detail: 'Electronic RFID Lock', status: 'secured', icon: 'lock' },
      { id: 'asset-hub-203', name: '100W GaN Charging Station', detail: 'Type-C PD & Wireless Pad', status: 'optimal', icon: 'zap', wattage: 54 }
    ],
    powerHub: { status: 'Active (54W)', liveWattage: 54, voltage: '230V AC', usbCType: '100W GaN PD 3.1', surgeProtection: true },
    locker: { number: '203-Solo', keycode: '••••', status: 'Locked & Encrypted', capacity: '750 Liters' }
  }
];

export const INITIAL_ROOM_RULES: RoomRules = {
  quietHours: '10:30 PM - 07:00 AM',
  lightsOff: '10:30 PM',
  acTemp: 24,
  housekeepingArrival: '11:00 AM Daily',
  dndActive: false
};

export const INITIAL_ROOMMATES: Roommate[] = [
  {
    id: 'user-praveen',
    name: 'Praveen M.',
    initials: 'PM',
    role: 'Frontend Dev',
    company: 'TCS',
    bed: 'Bed A',
    joinedDate: 'Aug 2025',
    avatarColor: 'bg-indigo-100 text-indigo-700',
    status: 'online'
  },
  {
    id: 'user-rohan',
    name: 'Rohan K.',
    initials: 'RK',
    role: 'UI Engineer',
    company: 'Zoho',
    bed: 'Bed C',
    joinedDate: 'Nov 2025',
    avatarColor: 'bg-sky-100 text-sky-700',
    status: 'studying'
  }
];

export const WARDEN_INFO: Warden = {
  name: 'Karthik Selvan',
  role: 'Cluster Warden',
  block: 'Block 2',
  phone: '+91 98402 11984',
  status: 'Available at Reception Desk',
  avatarUrl: WARDEN_PHOTO
};

export const INITIAL_LEDGER: LivingLedger = {
  monthlyRent: 5000,
  securityDeposit: 10000,
  autoPayActive: true,
  nextDueDate: '05 Nov 2026',
  inclusions: [
    '3 Nutritious Chef-Prepared Meals Daily (Breakfast, Lunch, Dinner)',
    'Daily Professional Room & En-suite Housekeeping',
    'Unlimited Uncapped Wi-Fi 6 (5GHz Mesh)',
    '100% Electricity & Inverter AC Power (No Utility Surcharges)',
    'Reverse Osmosis UV Water Stations',
    'Bi-weekly Linen & Bedding Laundry Wash'
  ],
  invoices: [
    {
      id: 'INV-2026-10-529B',
      month: 'October 2026',
      amount: 5000,
      status: 'paid',
      paidOn: '01 Oct 2026',
      paymentMode: 'Auto-Debit (UPI Mandate • HDFC)'
    },
    {
      id: 'INV-2026-09-529B',
      month: 'September 2026',
      amount: 5000,
      status: 'paid',
      paidOn: '01 Sep 2026',
      paymentMode: 'Auto-Debit (UPI Mandate • HDFC)'
    },
    {
      id: 'INV-2026-08-529B',
      month: 'August 2026',
      amount: 5000,
      status: 'paid',
      paidOn: '01 Aug 2026',
      paymentMode: 'Auto-Debit (UPI Mandate • HDFC)'
    }
  ]
};

export const INITIAL_CHAT_MESSAGES = [
  {
    id: 'c1',
    sender: 'Karthik Selvan (Warden)',
    text: 'Good morning Room 529! Housekeeping team will do deep bathroom descaling today at 11:15 AM.',
    time: '08:45 AM',
    isWarden: true
  },
  {
    id: 'c2',
    sender: 'Praveen M. (Bed A)',
    text: 'Thanks Karthik, I’ll be leaving for office by 9:30 AM so that time works great.',
    time: '08:52 AM',
    isWarden: false
  },
  {
    id: 'c3',
    sender: 'Rohan K. (Bed C)',
    text: 'Hey guys, kept the AC thermostat at 24°C as agreed in consensus. Living room balcony door is locked.',
    time: '09:05 AM',
    isWarden: false
  },
  {
    id: 'c4',
    sender: 'Harish Aravind (You)',
    text: 'Perfect, the morning sun in Bed B is stunning today! See everyone for dinner at 8:00 PM.',
    time: '09:12 AM',
    isWarden: false,
    isSelf: true
  }
];

export const DIMENSION_MEASUREMENTS = [
  {
    id: 'm-balcony-clearance',
    label: 'Bed B to Balcony Clearance',
    distanceFt: '4.5 ft',
    distanceM: '1.37 m',
    start: [3.2, 0.4, 2.1] as [number, number, number],
    end: [5.6, 0.4, 2.1] as [number, number, number],
    description: 'Generous unhindered morning walkway to private sunrise terrace'
  },
  {
    id: 'm-desk-width',
    label: 'Workstation Desk #2 Width',
    distanceFt: '5.2 ft',
    distanceM: '1.60 m',
    start: [2.4, 0.8, 0.6] as [number, number, number],
    end: [4.0, 0.8, 0.6] as [number, number, number],
    description: 'Supports dual 27-inch monitors, laptop stand, and organizer'
  },
  {
    id: 'm-ceiling-clearance',
    label: 'Ceiling Headroom Height',
    distanceFt: '10.5 ft',
    distanceM: '3.20 m',
    start: [3.2, 0.0, 2.1] as [number, number, number],
    end: [3.2, 3.2, 2.1] as [number, number, number],
    description: 'Volumetric air circulation with high-clearance overhead feel'
  },
  {
    id: 'm-bed-spacing',
    label: 'Bed B to Bed C Acoustic Gap',
    distanceFt: '5.8 ft',
    distanceM: '1.76 m',
    start: [3.2, 0.4, 2.1] as [number, number, number],
    end: [-0.6, 0.4, 2.1] as [number, number, number],
    description: 'Ample private zone with independent 65W power and lighting'
  }
];

export const TODAY_MEALS = {
  day: 'Saturday',
  date: '17 October 2026',
  breakfast: {
    timing: '07:30 - 10:00 AM',
    items: [
      { id: 'b1', name: 'Steamed Ghee Podi Idli & Crispy Medu Vada', cuisine: 'South Indian', type: 'veg' as const, calories: '380 kcal', isSpecial: true },
      { id: 'b2', name: 'Farm-Fresh Masala Omelette & Toasted Multigrain Bread', cuisine: 'Continental', type: 'non-veg' as const, calories: '410 kcal' },
      { id: 'b3', name: 'Fresh Filter Coffee & Ragi Malt', cuisine: 'Beverage', type: 'veg' as const, calories: '90 kcal' }
    ]
  },
  lunch: {
    timing: '12:30 - 02:30 PM',
    items: [
      { id: 'l1', name: 'Chettinad Pepper Chicken Curry / Paneer Butter Masala', cuisine: 'South Indian', type: 'non-veg' as const, calories: '580 kcal', isSpecial: true },
      { id: 'l2', name: 'Steamed Sona Masoori Rice & Thakkali Rasam', cuisine: 'Comfort', type: 'veg' as const, calories: '320 kcal' },
      { id: 'l3', name: 'Chilled Sweet Cucumber Pachadi & Crispy Appalam', cuisine: 'Side', type: 'veg' as const, calories: '120 kcal' }
    ]
  },
  dinner: {
    timing: '07:30 - 10:00 PM',
    items: [
      { id: 'd1', name: 'Malabar Parotta with Veg Kurma or Kadai Chicken', cuisine: 'Kerala / Coastal', type: 'non-veg' as const, calories: '540 kcal', isSpecial: true },
      { id: 'd2', name: 'Jeera Basmati Rice & Dal Tadka', cuisine: 'North Indian', type: 'veg' as const, calories: '340 kcal' },
      { id: 'd3', name: 'Warm Elaneer Payasam (Tender Coconut Dessert)', cuisine: 'Dessert', type: 'veg' as const, calories: '190 kcal' }
    ]
  }
};

