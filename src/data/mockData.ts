import { BedPod, RoomRules, Roommate, Warden, LivingLedger } from '../types/coliving';

export const BED_POD_B_PHOTO = '/src/assets/images/bed_pod_b_window_1792234011674.jpg';
export const BED_POD_DESK_PHOTO = '/src/assets/images/bed_pod_desk_1792234030764.jpg';
export const BALCONY_PHOTO = '/src/assets/images/balcony_sunrise_1792234048143.jpg';
export const WARDEN_PHOTO = '/src/assets/images/warden_karthik_1792234064704.jpg';

export const ROOM_INFO = {
  property: 'Vadapalani',
  roomNumber: '529',
  unitType: 'Corner Haven 4X Pod Suite',
  floor: 'Floor 2 North-East',
  dimensions: '24 ft × 18 ft (432 sq.ft)',
  ceilingHeight: '10.5 ft',
  hvacSystem: 'Daikin Dual Inverter Smart Dual-Zone 2.0 Ton',
  airQualityStatus: 'Optimized • Filter Cleaned 2d ago',
  aqiValue: 28,
  pm25: '8.2 µg/m³',
  humidity: '52%',
  powerStatus: '100% Grid + Seamless 15kVA Auto-Inverter Backup'
};

export const INITIAL_BEDS: BedPod[] = [
  {
    id: 'bed-b',
    name: 'Bed Pod B (Your Bed)',
    label: 'Bed B (Window Pod)',
    residentName: 'Harish Aravind',
    residentRole: 'Software Engineer',
    residentCompany: 'Resident #529',
    isCurrentUser: true,
    isAvailable: false,
    bayType: 'Window & Balcony Bay',
    sunlightExposure: 'Direct East-Facing Morning Sun (06:30 - 11:00 AM)',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 32,
    wifiSpeed: '480 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-529',
    photoUrl: BED_POD_B_PHOTO,
    coordinates: { x: 3.2, z: 2.1, rotation: 0 },
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
      number: 'B',
      keycode: '8492',
      status: 'Locked & Encrypted',
      capacity: '450 Liters (Hydraulic under-bed + vertical wardrobe)'
    }
  },
  {
    id: 'bed-a',
    name: 'Bed Pod A',
    label: 'Bed A (Study Bay)',
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
    wifiBand: '5GHz • HomiesInn-Mesh-529',
    photoUrl: BED_POD_DESK_PHOTO,
    coordinates: { x: -3.0, z: -2.4, rotation: 0 },
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
      number: 'A',
      keycode: '••••',
      status: 'Locked',
      capacity: '450 Liters'
    }
  },
  {
    id: 'bed-c',
    name: 'Bed Pod C',
    label: 'Bed C (Central Pod)',
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
    wifiBand: '5GHz • HomiesInn-Mesh-529',
    photoUrl: BED_POD_DESK_PHOTO,
    coordinates: { x: -0.6, z: 2.1, rotation: 0 },
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
      number: 'C',
      keycode: '••••',
      status: 'Locked',
      capacity: '450 Liters'
    }
  },
  {
    id: 'bed-d',
    name: 'Bed Pod D',
    label: 'Bed Pod D Open',
    residentName: 'Open Pod',
    residentRole: 'Ready for Move-In',
    residentCompany: 'Invite a Colleague & Earn ₹1,500',
    isCurrentUser: false,
    isAvailable: true,
    bayType: 'Sunrise East Alcove',
    sunlightExposure: 'Direct Morning Sun (07:00 - 11:30 AM)',
    noiseLevel: 'Whisper Quiet',
    noiseDb: 30,
    wifiSpeed: '480 Mbps',
    wifiBand: '5GHz • HomiesInn-Mesh-529',
    photoUrl: BALCONY_PHOTO,
    coordinates: { x: 3.2, z: -2.4, rotation: 0 },
    assets: [
      {
        id: 'asset-desk-d',
        name: 'Workstation Desk #4',
        detail: 'Pristine • Ready for Setup',
        status: 'active',
        icon: 'desk'
      },
      {
        id: 'asset-locker-d',
        name: 'Steel RFID Locker #D',
        detail: 'Reset & Sanitized for New Resident',
        status: 'sanitized',
        icon: 'lock',
        code: '0000'
      },
      {
        id: 'asset-hub-d',
        name: '65W Type-C Wall Hub',
        detail: 'Standby Power Mode',
        status: 'optimal',
        icon: 'zap',
        wattage: 2
      },
      {
        id: 'asset-mattress-d',
        name: 'Orthopedic 5-Zone Core',
        detail: 'Fresh Factory Sanitized Seal',
        status: 'sanitized',
        icon: 'bed'
      }
    ],
    powerHub: {
      status: 'Standby (2W)',
      liveWattage: 2,
      voltage: '230V AC',
      usbCType: '65W PD',
      surgeProtection: true
    },
    locker: {
      number: 'D',
      keycode: '0000',
      status: 'Vacant & Clean',
      capacity: '450 Liters'
    }
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
