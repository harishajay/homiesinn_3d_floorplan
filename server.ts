import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory full-stack data for HomiesInn Campus Floors & Multi-Room Beds
const FLOOR_ROOMS_DATA = [
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

const BEDS_DATA = [
  // Room 201 (Triple)
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
    coordinates: { x: -4.5, z: 2.2, rotation: 0 },
    monthlyRent: 5000,
    lockStatus: 'Locked',
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
    coordinates: { x: -8.0, z: -2.4, rotation: 0 },
    monthlyRent: 5000,
    lockStatus: 'Locked',
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
    coordinates: { x: -8.0, z: 2.2, rotation: 0 },
    monthlyRent: 5000,
    lockStatus: 'Locked',
  },
  // Room 202 (Double)
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
    residentCompany: 'AWS',
    isCurrentUser: false,
    isAvailable: false,
    bayType: 'North Window Bay',
    sunlightExposure: 'Morning Daylighting (07:30 - 11:00 AM)',
    noiseLevel: 'Silent Study',
    noiseDb: 31,
    wifiSpeed: '490 Mbps',
    coordinates: { x: -0.5, z: 2.2, rotation: 0 },
    monthlyRent: 7500,
    lockStatus: 'Locked',
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
    coordinates: { x: 2.2, z: -2.4, rotation: 0 },
    monthlyRent: 7500,
    lockStatus: 'Sanitized & Unlocked',
  },
  // Room 203 (Single)
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
    coordinates: { x: 7.2, z: 0.2, rotation: 0 },
    monthlyRent: 12000,
    lockStatus: 'Locked',
  },
];

// API Routes
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Returns the 3 rooms on Floor 2 (Triple: 3 beds, Double: 2 beds, Single: 1 bed)
app.get('/api/floor/rooms', (_req, res) => {
  res.json({
    floor: 'Floor 2 Residential Wing',
    totalRooms: FLOOR_ROOMS_DATA.length,
    totalBeds: BEDS_DATA.length,
    rooms: FLOOR_ROOMS_DATA,
  });
});

// Returns all beds with live stats
app.get('/api/floor/beds', (_req, res) => {
  res.json({
    beds: BEDS_DATA,
    summary: {
      total: BEDS_DATA.length,
      occupied: BEDS_DATA.filter((b) => !b.isAvailable).length,
      vacant: BEDS_DATA.filter((b) => b.isAvailable).length,
      rooms: {
        'room-201': 3,
        'room-202': 2,
        'room-203': 1,
      },
    },
  });
});

// Bed Swap API
app.post('/api/floor/beds/:id/swap', (req, res) => {
  const { id } = req.params;
  const targetBed = BEDS_DATA.find((b) => b.id === id);
  if (!targetBed) {
    return res.status(404).json({ error: 'Bed not found' });
  }
  return res.json({
    success: true,
    message: `Bed swap request for ${targetBed.name} submitted to Resident Concierge.`,
    bedId: id,
  });
});

// Smart Lock API
app.post('/api/floor/beds/:id/lock', (req, res) => {
  const { id } = req.params;
  const { pin } = req.body;
  if (pin === '8492' || pin === '0000') {
    return res.json({ success: true, message: 'Portal RFID Unlatched', state: 'unlocked' });
  }
  return res.status(401).json({ success: false, error: 'Invalid PIN' });
});

// Campus Zones API
app.get('/api/campus/zones', (_req, res) => {
  res.json({
    zones: [
      { id: 'building-elevation', name: '4-Story Building Cutaway', floor: 'All Floors (Ground, 1, 2, 3, 4)' },
      { id: 'first-floor-dining', name: 'Floor 1 • Dining Mess Hall', floor: 'Floor 1', capacity: 120 },
      { id: 'room-529', name: 'Floor 2 • 3-Room Residential Wing', floor: 'Floor 2', rooms: 3, beds: 6 },
      { id: 'lounge-pantry', name: 'Floor 2 • The Commons Co-Working', floor: 'Floor 2' },
      { id: 'rooftop-deck', name: 'Floor 4 • 360° Rooftop Sky Terrace', floor: 'Floor 4' },
    ],
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // Mount Vite dev server in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HomiesInn Full-Stack] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
