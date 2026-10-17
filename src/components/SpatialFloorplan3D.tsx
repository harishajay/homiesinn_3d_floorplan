import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  BedPod,
  SpatialLayer,
  ElevationMode,
  TimeOfDay,
  BedCustomization,
  WalkthroughHotspot,
  CampusZone,
} from '../types/coliving';
import { DIMENSION_MEASUREMENTS } from '../data/mockData';

interface SpatialFloorplan3DProps {
  beds: BedPod[];
  selectedPodId: string;
  onSelectPod: (podId: string) => void;
  activeLayer: SpatialLayer;
  elevationMode: ElevationMode;
  onElevationModeChange: (mode: ElevationMode) => void;
  timeOfDay: TimeOfDay;
  onTimeOfDayChange: (time: TimeOfDay) => void;
  bedCustomization: BedCustomization;
  onUpdateCustomization: (custom: Partial<BedCustomization>) => void;
  // Laser Dimension Tool
  measureMode: boolean;
  onToggleMeasureMode: () => void;
  selectedMeasurementId: string;
  onSelectMeasurement: (id: string) => void;
  // Smart Lock
  isDoorUnlocked: boolean;
  onOpenSmartLock: () => void;
  // Multi-Zone
  campusZone: CampusZone;
  onCampusZoneChange: (zone: CampusZone) => void;
}

const _targetCameraPos = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 0.5, 0);

export const HOTSPOTS: WalkthroughHotspot[] = [
  { id: 'door', label: 'Doorway Entry', icon: '🚪', position: [-4.2, 1.4, -0.6], lookAt: [1.0, 1.0, 0.8] },
  { id: 'bed-b', label: 'Bed B (Your Pod)', icon: '🛏️', position: [1.8, 1.3, 1.8], lookAt: [3.2, 0.9, 2.1] },
  { id: 'desk', label: 'Workstation #2', icon: '💻', position: [2.0, 1.3, 0.6], lookAt: [3.2, 0.8, 0.6] },
  { id: 'balcony', label: 'Sunrise Balcony', icon: '🌅', position: [5.2, 1.3, 1.8], lookAt: [7.2, 1.1, 1.8] },
  { id: 'bath', label: 'En-Suite Bath', icon: '🚿', position: [-2.6, 1.3, -2.2], lookAt: [-4.0, 1.0, -2.8] },
  { id: 'lockers', label: 'Smart Lockers', icon: '🔒', position: [-1.8, 1.3, -2.4], lookAt: [-1.8, 1.2, -3.8] },
];

export const SpatialFloorplan3D: React.FC<SpatialFloorplan3DProps> = ({
  beds,
  selectedPodId,
  onSelectPod,
  activeLayer,
  elevationMode,
  onElevationModeChange,
  timeOfDay,
  onTimeOfDayChange,
  bedCustomization,
  onUpdateCustomization,
  measureMode,
  onToggleMeasureMode,
  selectedMeasurementId,
  onSelectMeasurement,
  isDoorUnlocked,
  onOpenSmartLock,
  campusZone,
  onCampusZoneChange,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [currentHotspot, setCurrentHotspot] = useState<string>('bed-b');

  // Three.js scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Top-level zone groups
  const suiteGroupRef = useRef<THREE.Group>(new THREE.Group());
  const loungeGroupRef = useRef<THREE.Group>(new THREE.Group());
  const rooftopGroupRef = useRef<THREE.Group>(new THREE.Group());
  const firstFloorGroupRef = useRef<THREE.Group>(new THREE.Group());
  const buildingElevationGroupRef = useRef<THREE.Group>(new THREE.Group());

  // 360 Auto-spin
  const [is360AutoSpinning, setIs360AutoSpinning] = useState(false);
  const is360AutoSpinningRef = useRef(false);
  is360AutoSpinningRef.current = is360AutoSpinning;

  // Sub-groups for Suite
  const explodedCeilingGroup = useRef<THREE.Group>(new THREE.Group());
  const electricalLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const sunlightLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const storageLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const acousticLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const laserDimensionGroup = useRef<THREE.Group>(new THREE.Group());
  const airParticlesRef = useRef<THREE.Points | null>(null);
  const interactiveMeshesRef = useRef<{ mesh: THREE.Object3D; id: string; name: string }[]>([]);

  // Door hinge group
  const doorPivotRef = useRef<THREE.Group | null>(null);

  // Hydraulic lift & customizer meshes
  const hydraulicDeckGroup = useRef<THREE.Group | null>(null);
  const bedBDuvetMeshRef = useRef<THREE.Mesh | null>(null);

  // Lighting refs
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const roomAmbientRef = useRef<THREE.AmbientLight | null>(null);
  const podBSpotLightRef = useRef<THREE.PointLight | null>(null);
  const deskLampLightRef = useRef<THREE.PointLight | null>(null);

  // Smooth camera controls state
  const cameraState = useRef({
    distance: 19,
    theta: Math.PI / 4 + 0.35,
    phi: Math.PI / 4.2,
    target: new THREE.Vector3(0, 0.5, 0),
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    targetExplodedFactor: 0,
    currentExplodedFactor: 0,
    fpPos: new THREE.Vector3(1.8, 1.3, 1.8),
    fpLook: new THREE.Vector3(3.2, 0.9, 2.1),
    fpPitch: 0,
    fpYaw: 0,
    currentLiftAngle: 0,
    targetLiftAngle: 0,
    currentDoorAngle: 0,
    targetDoorAngle: 0,
  });

  const activeLayerRef = useRef(activeLayer);
  activeLayerRef.current = activeLayer;
  const elevationModeRef = useRef(elevationMode);
  elevationModeRef.current = elevationMode;
  const selectedPodIdRef = useRef(selectedPodId);
  selectedPodIdRef.current = selectedPodId;
  const customizationRef = useRef(bedCustomization);
  customizationRef.current = bedCustomization;
  const measureModeRef = useRef(measureMode);
  measureModeRef.current = measureMode;
  const selectedMeasurementIdRef = useRef(selectedMeasurementId);
  selectedMeasurementIdRef.current = selectedMeasurementId;
  const campusZoneRef = useRef(campusZone);
  campusZoneRef.current = campusZone;

  // Door unlock sync
  useEffect(() => {
    cameraState.current.targetDoorAngle = isDoorUnlocked ? -1.2 : 0;
  }, [isDoorUnlocked]);

  // Campus Zone Camera Sync
  useEffect(() => {
    if (campusZone === 'building-elevation') {
      cameraState.current.target.set(0, 4.2, 0);
      cameraState.current.distance = 28;
      cameraState.current.theta = Math.PI / 4 + 0.35;
      cameraState.current.phi = Math.PI / 3.8;
    } else if (campusZone === 'rooftop-deck') {
      cameraState.current.target.set(0, 1.2, 0);
      cameraState.current.distance = 18;
      cameraState.current.theta = Math.PI / 4;
      cameraState.current.phi = Math.PI / 4.4;
    } else if (campusZone === 'first-floor-dining') {
      cameraState.current.target.set(0, 0.8, 0);
      cameraState.current.distance = 18;
      cameraState.current.theta = Math.PI / 4 + 0.2;
      cameraState.current.phi = Math.PI / 4.2;
    } else if (campusZone === 'room-529') {
      cameraState.current.target.set(0, 0.5, 0);
      cameraState.current.distance = 19;
      cameraState.current.theta = Math.PI / 4 + 0.35;
      cameraState.current.phi = Math.PI / 4.2;
    } else if (campusZone === 'lounge-pantry') {
      cameraState.current.target.set(0, 0.8, 0);
      cameraState.current.distance = 18;
    }
  }, [campusZone]);

  // Center camera on Bed B
  const centerOnBedB = useCallback(() => {
    if (elevationMode === 'firstperson') {
      teleportToHotspot(HOTSPOTS.find((h) => h.id === 'bed-b')!);
      return;
    }
    const bedB = beds.find((b) => b.id === 'bed-b');
    if (bedB) {
      cameraState.current.target.set(bedB.coordinates.x * 0.7, 0.8, bedB.coordinates.z * 0.7);
      cameraState.current.distance = 15;
      cameraState.current.theta = Math.PI / 3.8;
      cameraState.current.phi = Math.PI / 4.4;
      onSelectPod('bed-b');
    }
  }, [beds, elevationMode, onSelectPod]);

  // Reset overall view
  const resetView = useCallback(() => {
    if (elevationMode === 'firstperson') {
      teleportToHotspot(HOTSPOTS[0]);
      return;
    }
    cameraState.current.target.set(0, 0.5, 0);
    cameraState.current.distance = 19;
    cameraState.current.theta = Math.PI / 4 + 0.35;
    cameraState.current.phi = Math.PI / 4.2;
  }, [elevationMode]);

  // Teleport in first-person mode
  const teleportToHotspot = (hotspot: WalkthroughHotspot) => {
    setCurrentHotspot(hotspot.id);
    cameraState.current.fpPos.set(...hotspot.position);
    cameraState.current.fpLook.set(...hotspot.lookAt);
    if (elevationMode !== 'firstperson') {
      onElevationModeChange('firstperson');
    }
  };

  // Sync elevation mode
  useEffect(() => {
    if (elevationMode === 'exploded') {
      cameraState.current.targetExplodedFactor = 1.0;
    } else {
      cameraState.current.targetExplodedFactor = 0.0;
    }

    if (elevationMode === 'cad') {
      cameraState.current.phi = 0.02;
      cameraState.current.distance = 21;
      cameraState.current.target.set(0, 0, 0);
    } else if (elevationMode === 'isometric') {
      cameraState.current.phi = Math.PI / 4.2;
      cameraState.current.distance = 19;
    } else if (elevationMode === 'firstperson') {
      const current = HOTSPOTS.find((h) => h.id === currentHotspot) || HOTSPOTS[1];
      cameraState.current.fpPos.set(...current.position);
      cameraState.current.fpLook.set(...current.lookAt);
    }
  }, [elevationMode, currentHotspot]);

  // Sync hydraulic lift target
  useEffect(() => {
    cameraState.current.targetLiftAngle = bedCustomization.hydraulicBedLifted ? 0.6 : 0.0;
  }, [bedCustomization.hydraulicBedLifted]);

  // Sync duvet color
  useEffect(() => {
    if (bedBDuvetMeshRef.current) {
      (bedBDuvetMeshRef.current.material as THREE.MeshStandardMaterial).color.setStyle(
        bedCustomization.duvetColor
      );
    }
  }, [bedCustomization.duvetColor]);

  // Sync lights
  useEffect(() => {
    if (!sunLightRef.current || !hemiLightRef.current || !roomAmbientRef.current) return;

    if (timeOfDay === 'morning') {
      sunLightRef.current.position.set(16, 7, 5);
      sunLightRef.current.color.setHex(0xffebd2);
      sunLightRef.current.intensity = 2.4;
      hemiLightRef.current.color.setHex(0xfff5e6);
      hemiLightRef.current.groundColor.setHex(0xb4c3d2);
      hemiLightRef.current.intensity = 0.9;
      roomAmbientRef.current.intensity = 0.6;
    } else if (timeOfDay === 'noon') {
      sunLightRef.current.position.set(6, 16, 4);
      sunLightRef.current.color.setHex(0xffffff);
      sunLightRef.current.intensity = 2.0;
      hemiLightRef.current.color.setHex(0xf0f8ff);
      hemiLightRef.current.intensity = 1.1;
      roomAmbientRef.current.intensity = 0.8;
    } else if (timeOfDay === 'sunset') {
      sunLightRef.current.position.set(-14, 5, 12);
      sunLightRef.current.color.setHex(0xff9944);
      sunLightRef.current.intensity = 2.2;
      hemiLightRef.current.color.setHex(0xffcfb0);
      hemiLightRef.current.intensity = 0.7;
      roomAmbientRef.current.intensity = 0.5;
    } else {
      sunLightRef.current.position.set(0, 10, 0);
      sunLightRef.current.color.setHex(0x223366);
      sunLightRef.current.intensity = 0.15;
      hemiLightRef.current.color.setHex(0x1a2639);
      hemiLightRef.current.intensity = 0.25;
      roomAmbientRef.current.intensity = 0.2;
    }

    if (podBSpotLightRef.current) {
      podBSpotLightRef.current.intensity = bedCustomization.readingLightOn
        ? timeOfDay === 'night'
          ? 2.8
          : 1.4
        : 0;
    }

    if (deskLampLightRef.current) {
      deskLampLightRef.current.intensity = bedCustomization.deskLampOn ? 1.8 : 0;
    }
  }, [timeOfDay, bedCustomization.readingLightOn, bedCustomization.deskLampOn]);

  // Update 3D Laser Dimension Line
  const updateLaserMeasurement = useCallback(() => {
    const laserGroup = laserDimensionGroup.current;
    laserGroup.clear();

    if (!measureModeRef.current) return;

    const measure = DIMENSION_MEASUREMENTS.find((m) => m.id === selectedMeasurementIdRef.current) || DIMENSION_MEASUREMENTS[0];
    if (!measure) return;

    const start = new THREE.Vector3(...measure.start);
    const end = new THREE.Vector3(...measure.end);

    const curve = new THREE.LineCurve3(start, end);
    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.035, 8, false);
    const tubeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const laserTube = new THREE.Mesh(tubeGeo, tubeMat);
    laserGroup.add(laserTube);

    const glowGeo = new THREE.TubeGeometry(curve, 20, 0.08, 8, false);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.35 });
    const glowTube = new THREE.Mesh(glowGeo, glowMat);
    laserGroup.add(glowTube);

    const ringGeo = new THREE.RingGeometry(0.08, 0.18, 16);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4, side: THREE.DoubleSide });

    const rStart = new THREE.Mesh(ringGeo, ringMat);
    rStart.position.copy(start);
    rStart.rotation.x = -Math.PI / 2;
    laserGroup.add(rStart);

    const rEnd = new THREE.Mesh(ringGeo, ringMat);
    rEnd.position.copy(end);
    rEnd.rotation.x = -Math.PI / 2;
    laserGroup.add(rEnd);
  }, []);

  useEffect(() => {
    updateLaserMeasurement();
  }, [measureMode, selectedMeasurementId, updateLaserMeasurement]);

  // Main Scene Setup
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf6f8fc);
    scene.fog = new THREE.Fog(0xf6f8fc, 25, 48);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    roomAmbientRef.current = ambientLight;
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xfff8ee, 0xd0dce5, 0.9);
    hemiLight.position.set(0, 20, 0);
    hemiLightRef.current = hemiLight;
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffebd2, 2.4);
    sunLight.position.set(16, 7, 5);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    const d = 11;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    sunLightRef.current = sunLight;
    scene.add(sunLight);

    const podBSpot = new THREE.PointLight(0xffe0a3, 1.4, 7, 1.4);
    podBSpot.position.set(3.2, 2.2, 2.1);
    podBSpotLightRef.current = podBSpot;
    scene.add(podBSpot);

    const deskLampLight = new THREE.PointLight(0xfff0c4, 1.8, 5, 1.5);
    deskLampLight.position.set(3.2, 1.2, 0.6);
    deskLampLightRef.current = deskLampLight;
    scene.add(deskLampLight);

    // Ground Contact Shadow
    const groundGeo = new THREE.PlaneGeometry(36, 36);
    const groundMat = new THREE.ShadowMaterial({ opacity: 0.12 });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -0.01;
    groundMesh.receiveShadow = true;
    scene.add(groundMesh);

    // Procedural Parquet Texture
    const createWoodTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d')!;
      ctx.fillStyle = '#dfd3c3';
      ctx.fillRect(0, 0, 512, 512);
      ctx.strokeStyle = '#c6b6a2';
      ctx.lineWidth = 2;
      const plankHeight = 32;
      for (let y = 0; y < 512; y += plankHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(512, y);
        ctx.stroke();
        const offset = (y / plankHeight) % 2 === 0 ? 0 : 64;
        for (let x = offset; x < 512; x += 128) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + plankHeight);
          ctx.stroke();
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const woodTexture = createWoodTexture();

    // ==========================================
    // ZONE 1: ROOM 529 SUITE GROUP
    // ==========================================
    const suiteGroup = suiteGroupRef.current;
    suiteGroup.clear();
    scene.add(suiteGroup);

    // Floor Base
    const floorMesh = new THREE.Mesh(
      new THREE.BoxGeometry(11.2, 0.3, 8.4),
      new THREE.MeshStandardMaterial({ map: woodTexture, roughness: 0.45, metalness: 0.05 })
    );
    floorMesh.position.set(0, -0.15, 0);
    floorMesh.receiveShadow = true;
    suiteGroup.add(floorMesh);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xedf0f5, roughness: 0.85 });
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(11.4, 2.2, 0.3), wallMat);
    backWall.position.set(0, 1.0, -4.2);
    backWall.receiveShadow = true;
    suiteGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 8.4), wallMat);
    leftWall.position.set(-5.6, 1.0, 0);
    leftWall.receiveShadow = true;
    suiteGroup.add(leftWall);

    // Hinged Door
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.0, 1.2), doorFrameMat);
    doorFrame.position.set(-5.6, 0.9, -1.2);
    suiteGroup.add(doorFrame);

    const doorPivot = new THREE.Group();
    doorPivot.position.set(-5.55, 0.9, -1.75);
    doorPivotRef.current = doorPivot;

    const doorLeaf = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.9, 1.1),
      new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.4 })
    );
    doorLeaf.position.set(0, 0, 0.55);
    doorPivot.add(doorLeaf);
    suiteGroup.add(doorPivot);

    // RFID Scanner
    const rfidBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.16), doorFrameMat);
    rfidBox.position.set(-5.4, 1.1, -0.4);
    const rfidLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    rfidLed.position.set(0.07, 0.05, 0);
    rfidBox.add(rfidLed);
    suiteGroup.add(rfidBox);
    interactiveMeshesRef.current.push({
      mesh: rfidBox,
      id: 'access-portal',
      name: 'Smart Access Portal (Click to Test Lock)',
    });

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdaf0f7,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.2,
      thickness: 0.4,
    });

    // Ensuite Bath Glass
    const bathWall = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.8, 0.08), glassMat);
    bathWall.position.set(-4.0, 0.9, -1.7);
    suiteGroup.add(bathWall);

    // Sunrise Balcony
    const balconyFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.25, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xd4c5b3, roughness: 0.7 })
    );
    balconyFloor.position.set(6.7, -0.16, 1.8);
    balconyFloor.receiveShadow = true;
    suiteGroup.add(balconyFloor);

    const railingGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 4.2), glassMat);
    railingGlass.position.set(7.85, 0.45, 1.8);
    suiteGroup.add(railingGlass);

    const bistroTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    bistroTable.position.set(6.8, 0.3, 1.8);
    suiteGroup.add(bistroTable);

    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.15, 0.35, 12),
      new THREE.MeshStandardMaterial({ color: 0xbe5a38, roughness: 0.9 })
    );
    pot.position.set(7.4, 0.18, 3.4);
    const plantLeaves = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.28),
      new THREE.MeshStandardMaterial({ color: 0x227b4b, roughness: 0.7 })
    );
    plantLeaves.position.set(0, 0.28, 0);
    pot.add(plantLeaves);
    suiteGroup.add(pot);

    // Bed Pods
    const bedWoodMat = new THREE.MeshStandardMaterial({ color: 0xc49b71, roughness: 0.4 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.8 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

    beds.forEach((pod) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(pod.coordinates.x, 0, pod.coordinates.z);
      bedGroup.name = pod.id;

      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.4), bedWoodMat);
      base.position.set(0, 0.225, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      bedGroup.add(base);

      const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 1.4), bedWoodMat);
      headboard.position.set(1.15, 0.6, 0);
      bedGroup.add(headboard);

      if (pod.isCurrentUser) {
        const hydraulicDeck = new THREE.Group();
        hydraulicDeck.position.set(1.1, 0.45, 0);
        hydraulicDeckGroup.current = hydraulicDeck;

        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.3), mattressMat);
        mattress.position.set(-1.15, 0.15, 0);
        mattress.castShadow = true;
        hydraulicDeck.add(mattress);

        const duvetMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(customizationRef.current.duvetColor),
          roughness: 0.7,
        });
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.32), duvetMat);
        duvet.position.set(-1.55, 0.33, 0);
        bedBDuvetMeshRef.current = duvet;
        hydraulicDeck.add(duvet);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p1.position.set(-0.35, 0.35, -0.3);
        p1.rotation.z = -0.15;
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p2.position.set(-0.35, 0.35, 0.3);
        p2.rotation.z = -0.15;
        hydraulicDeck.add(p1);
        hydraulicDeck.add(p2);

        bedGroup.add(hydraulicDeck);

        const storageInterior = new THREE.Group();
        const suitcase1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.28, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 })
        );
        suitcase1.position.set(0.3, 0.16, -0.25);
        storageInterior.add(suitcase1);

        const suitcase2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.24, 0.38),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
        );
        suitcase2.position.set(-0.4, 0.14, 0.25);
        storageInterior.add(suitcase2);
        bedGroup.add(storageInterior);
      } else {
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.3), mattressMat);
        mattress.position.set(-0.05, 0.6, 0);
        bedGroup.add(mattress);

        const duvet = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.08, 1.32),
          new THREE.MeshStandardMaterial({ color: pod.isAvailable ? 0x94a3b8 : 0x3b82f6, roughness: 0.7 })
        );
        duvet.position.set(-0.45, 0.78, 0);
        bedGroup.add(duvet);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p1.position.set(0.75, 0.8, -0.3);
        bedGroup.add(p1);
      }

      const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), bedWoodMat);
      nightstand.position.set(0.8, 0.22, 1.0);
      bedGroup.add(nightstand);

      const halo = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.35, 32),
        new THREE.MeshBasicMaterial({
          color: pod.isCurrentUser ? 0x4f46e5 : pod.isAvailable ? 0x10b981 : 0x3b82f6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.4,
        })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(0, 0.02, 0);
      halo.name = `${pod.id}-halo`;
      bedGroup.add(halo);

      interactiveMeshesRef.current.push({ mesh: base, id: pod.id, name: pod.name });
      suiteGroup.add(bedGroup);
    });

    // Desks
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xb58b5e, roughness: 0.5 });
    const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });

    const createWorkstation = (x: number, z: number, rotation: number) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, 0, z);
      deskGroup.rotation.y = rotation;

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), deskMat);
      top.position.set(0, 0.75, 0);
      deskGroup.add(top);

      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.7), deskLegMat);
      leg1.position.set(-0.7, 0.375, 0);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.7), deskLegMat);
      leg2.position.set(0.7, 0.375, 0);
      deskGroup.add(leg1);
      deskGroup.add(leg2);

      const laptop = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.02, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      laptop.position.set(0, 0.8, 0);
      deskGroup.add(laptop);

      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), deskLegMat);
      chairSeat.position.set(0, 0.48, 0.48);
      deskGroup.add(chairSeat);

      return deskGroup;
    };

    suiteGroup.add(createWorkstation(-3.0, -0.8, 0));
    suiteGroup.add(createWorkstation(3.2, 0.6, Math.PI));

    // Lockers
    const lockerBank = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.0, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.35 })
    );
    lockerBank.position.set(-1.8, 1.0, -3.8);
    suiteGroup.add(lockerBank);

    // AC Unit
    const acMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    acMesh.position.set(1.5, 1.9, -4.0);
    suiteGroup.add(acMesh);

    // Electrical Layer
    const electricalGroup = electricalLayerGroup.current;
    electricalGroup.clear();
    const conduitMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 });
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 11.0, 8), conduitMat);
    c1.rotation.z = Math.PI / 2;
    c1.position.set(0, 0.04, -4.05);
    electricalGroup.add(c1);
    suiteGroup.add(electricalGroup);

    // Sunlight Layer
    const sunlightGroup = sunlightLayerGroup.current;
    sunlightGroup.clear();
    const sunBeam = new THREE.Mesh(
      new THREE.CylinderGeometry(1.6, 3.2, 7.0, 16, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xffe6a3, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
    );
    sunBeam.position.set(4.5, 2.0, 1.8);
    sunBeam.rotation.z = -Math.PI / 4;
    sunBeam.rotation.y = Math.PI / 6;
    sunlightGroup.add(sunBeam);

    const particleCount = 70;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = 1.5 + (Math.random() - 0.5) * 1.8;
      particlePositions[i * 3 + 1] = 1.8 - Math.random() * 1.5;
      particlePositions[i * 3 + 2] = -3.8 + Math.random() * 5.5;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const airParticles = new THREE.Points(
      particleGeo,
      new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.08, transparent: true, opacity: 0.7 })
    );
    airParticlesRef.current = airParticles;
    sunlightGroup.add(airParticles);
    suiteGroup.add(sunlightGroup);

    // Storage Layer
    const storageGroup = storageLayerGroup.current;
    storageGroup.clear();
    const hydraulicVolume = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.35, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x7c3aed, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 })
    );
    hydraulicVolume.position.set(3.2, 0.45, 2.1);
    storageGroup.add(hydraulicVolume);
    suiteGroup.add(storageGroup);

    // Acoustic Waves Layer
    const acousticGroup = acousticLayerGroup.current;
    acousticGroup.clear();
    for (let i = 1; i <= 3; i++) {
      const ring = new THREE.Mesh(
        new THREE.RingGeometry(1.2 * i, 1.25 * i, 32),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.35 / i, side: THREE.DoubleSide })
      );
      ring.rotation.x = -Math.PI / 2;
      ring.position.set(3.2, 0.03, 2.1);
      acousticGroup.add(ring);
    }
    suiteGroup.add(acousticGroup);

    // Laser Dimension Tool Group
    suiteGroup.add(laserDimensionGroup.current);

    // Exploded Ceiling
    const ceilingGroup = explodedCeilingGroup.current;
    ceilingGroup.clear();
    const beamsMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let z = -3.5; z <= 3.5; z += 2.0) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.12, 0.15), beamsMat);
      b.position.set(0, 0, z);
      ceilingGroup.add(b);
    }
    ceilingGroup.position.set(0, 2.8, 0);
    suiteGroup.add(ceilingGroup);

    // ==========================================
    // ZONE 2: CO-WORKING LOUNGE & PANTRY GROUP
    // ==========================================
    const loungeGroup = loungeGroupRef.current;
    loungeGroup.clear();
    scene.add(loungeGroup);

    // Lounge Concrete Floor
    const loungeFloor = new THREE.Mesh(
      new THREE.BoxGeometry(12.0, 0.3, 9.0),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.35 })
    );
    loungeFloor.position.set(0, -0.15, 0);
    loungeGroup.add(loungeFloor);

    // Scandinavian Rug in Lounge Area
    const rug = new THREE.Mesh(
      new THREE.BoxGeometry(5.0, 0.02, 4.0),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 })
    );
    rug.position.set(-2.5, 0.01, 1.0);
    loungeGroup.add(rug);

    // Long Communal 8-Seater Co-working Bench
    const benchTop = new THREE.Mesh(
      new THREE.BoxGeometry(6.0, 0.1, 1.8),
      new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.4 })
    );
    benchTop.position.set(2.0, 0.75, 0);
    loungeGroup.add(benchTop);

    // Coffee Pantry Bar & Counter
    const pantryBar = new THREE.Mesh(
      new THREE.BoxGeometry(3.5, 1.0, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.2 })
    );
    pantryBar.position.set(-3.5, 0.5, -3.2);
    loungeGroup.add(pantryBar);

    // Espresso Machine Model
    const espresso = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.45, 0.45),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.8, roughness: 0.2 })
    );
    espresso.position.set(-3.2, 1.25, -3.2);
    loungeGroup.add(espresso);

    // Acoustic Phone Booth Cubicle
    const phoneBooth = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 2.4, 1.4),
      new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transmission: 0.7, roughness: 0.2 })
    );
    phoneBooth.position.set(4.5, 1.2, -3.2);
    loungeGroup.add(phoneBooth);

    // Perimeter Wall with Neon Sign
    const loungeBackWall = new THREE.Mesh(
      new THREE.BoxGeometry(12.2, 2.6, 0.3),
      new THREE.MeshStandardMaterial({ color: 0x334155 })
    );
    loungeBackWall.position.set(0, 1.3, -4.5);
    loungeGroup.add(loungeBackWall);

    // ==========================================
    // ZONE 3: ROOFTOP SKY TERRACE (360° PANORAMA)
    // ==========================================
    const rooftopGroup = rooftopGroupRef.current;
    rooftopGroup.clear();
    scene.add(rooftopGroup);

    // Teak Wood Rooftop Deck Slab
    const deckMesh = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 0.35, 11.0),
      new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 })
    );
    deckMesh.position.set(0, -0.175, 0);
    rooftopGroup.add(deckMesh);

    // Central Green Turf Lawn for Sunrise Yoga & Lounging
    const turfMesh = new THREE.Mesh(
      new THREE.BoxGeometry(7.5, 0.02, 5.8),
      new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 })
    );
    turfMesh.position.set(-1.2, 0.01, 0.5);
    rooftopGroup.add(turfMesh);

    // 360° Surrounding City Skyline Monoliths (Distant Skyline Ring)
    const skylineGroup = new THREE.Group();
    const bldgMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const windowGlowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.7 });
    const skylineCount = 28;
    for (let i = 0; i < skylineCount; i++) {
      const angle = (i / skylineCount) * Math.PI * 2;
      const radius = 26 + (i % 3) * 4;
      const bw = 2.5 + (i % 4) * 1.0;
      const bd = 2.5 + ((i + 1) % 3) * 0.8;
      const bh = 8 + (i % 7) * 2.8;
      const bldg = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), bldgMat);
      bldg.position.set(Math.cos(angle) * radius, bh / 2 - 4, Math.sin(angle) * radius);
      skylineGroup.add(bldg);

      // Add a couple of glowing window bands
      if (i % 2 === 0) {
        const winBand = new THREE.Mesh(new THREE.BoxGeometry(bw * 0.95, 0.25, bd * 1.02), windowGlowMat);
        winBand.position.set(bldg.position.x, bh * 0.7 - 4, bldg.position.z);
        skylineGroup.add(winBand);
      }
    }
    rooftopGroup.add(skylineGroup);

    // Pergola Structure Beams (Timber)
    const pergolaPostMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.4 });
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.7, 0.2), pergolaPostMat);
    p1.position.set(-4.5, 1.35, -3.2);
    const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.7, 0.2), pergolaPostMat);
    p2.position.set(1.5, 1.35, -3.2);
    const p3 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.7, 0.2), pergolaPostMat);
    p3.position.set(-4.5, 1.35, 3.2);
    const p4 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.7, 0.2), pergolaPostMat);
    p4.position.set(1.5, 1.35, 3.2);
    rooftopGroup.add(p1, p2, p3, p4);

    // Overhead Pergola Slats with String Festoon Bulbs
    const festoonMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    for (let x = -4.5; x <= 1.5; x += 1.0) {
      const slat = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 6.6), pergolaPostMat);
      slat.position.set(x, 2.7, 0);
      rooftopGroup.add(slat);

      // Festoon bulb orbs
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), festoonMat);
      bulb.position.set(x, 2.55, (Math.sin(x * 3) * 2.2));
      rooftopGroup.add(bulb);
    }

    // Warm Ambient Light for Pergola Festoons
    const pergolaLight = new THREE.PointLight(0xffedd5, 1.2, 10);
    pergolaLight.position.set(-1.5, 2.3, 0);
    rooftopGroup.add(pergolaLight);

    // Sunken Firepit & Stargazing Lounge
    const firepitBase = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.0, 0.4, 24),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 })
    );
    firepitBase.position.set(4.0, 0.2, 0);
    rooftopGroup.add(firepitBase);

    const fireEmbers = new THREE.Mesh(
      new THREE.CylinderGeometry(0.65, 0.65, 0.1, 16),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    fireEmbers.position.set(4.0, 0.38, 0);
    rooftopGroup.add(fireEmbers);

    const fireLight = new THREE.PointLight(0xf97316, 1.5, 8);
    fireLight.position.set(4.0, 0.7, 0);
    rooftopGroup.add(fireLight);

    // L-Shaped Sectional Lounge Sofa around Firepit
    const sofaMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.7 });
    const sofaWoodMat = new THREE.MeshStandardMaterial({ color: 0x573a24, roughness: 0.6 });
    const sofaBench1 = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.4, 1.0), sofaMat);
    sofaBench1.position.set(4.0, 0.25, 2.4);
    const sofaBench2 = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.4, 3.2), sofaMat);
    sofaBench2.position.set(5.8, 0.25, 0.8);
    rooftopGroup.add(sofaBench1, sofaBench2);

    // Sunbed Loungers
    for (let i = 0; i < 3; i++) {
      const lounger = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 0.32, 0.85),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4 })
      );
      lounger.position.set(-3.2 + i * 2.2, 0.18, 4.2);
      rooftopGroup.add(lounger);
    }

    // Solar PV Panel Array (Clean 15kVA Auto-Inverter Supply)
    const solarFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const solarCellMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.15 });
    for (let i = 0; i < 3; i++) {
      const solarPanel = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.08, 1.2), solarCellMat);
      solarPanel.rotation.x = 0.35;
      solarPanel.position.set(-5.6, 1.1 + i * 0.05, -3.2 + i * 1.5);
      const solarStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.08), solarFrameMat);
      solarStand.position.set(-5.6, 0.4, -3.2 + i * 1.5);
      rooftopGroup.add(solarPanel, solarStand);
    }

    // Full 360° Glass Perimeter Balustrades
    const glassRailSouth = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.15, 0.08), glassMat);
    glassRailSouth.position.set(0, 0.58, 5.5);
    const glassRailNorth = new THREE.Mesh(new THREE.BoxGeometry(14.0, 1.15, 0.08), glassMat);
    glassRailNorth.position.set(0, 0.58, -5.5);
    const glassRailEast = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 11.0), glassMat);
    glassRailEast.position.set(7.0, 0.58, 0);
    const glassRailWest = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.15, 11.0), glassMat);
    glassRailWest.position.set(-7.0, 0.58, 0);
    rooftopGroup.add(glassRailSouth, glassRailNorth, glassRailEast, glassRailWest);

    // ==========================================
    // ZONE 4: FIRST FLOOR DINING MESS HALL & CAFE
    // ==========================================
    const firstFloorGroup = firstFloorGroupRef.current;
    firstFloorGroup.clear();
    scene.add(firstFloorGroup);

    // Polished Terrazzo Dining Slab
    const diningFloor = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 0.35, 10.5),
      new THREE.MeshStandardMaterial({ color: 0xd6d3d1, roughness: 0.3 })
    );
    diningFloor.position.set(0, -0.175, 0);
    firstFloorGroup.add(diningFloor);

    // Long Hot Buffet Island (Daily 3 Meals)
    const buffetBaseMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.5 });
    const buffetCounter = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.9, 1.4), buffetBaseMat);
    buffetCounter.position.set(-2.8, 0.45, -3.6);
    firstFloorGroup.add(buffetCounter);

    // Copper Hot Buffet Chafing Dishes (Dome covers)
    const chafingMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.8, roughness: 0.2 });
    for (let c = 0; c < 4; c++) {
      const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.22, 16), chafingMat);
      dish.position.set(-5.0 + c * 1.4, 1.05, -3.6);
      const lid = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), chafingMat);
      lid.position.set(-5.0 + c * 1.4, 1.16, -3.6);
      firstFloorGroup.add(dish, lid);
    }

    // Warm Food Heat Lamps Overhead
    const heatLampMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.6 });
    for (let c = 0; c < 3; c++) {
      const lamp = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 16), heatLampMat);
      lamp.position.set(-4.5 + c * 1.6, 2.2, -3.6);
      lamp.rotation.x = Math.PI;
      firstFloorGroup.add(lamp);
    }
    const buffetWarmLight = new THREE.PointLight(0xf59e0b, 1.8, 8);
    buffetWarmLight.position.set(-2.8, 1.8, -3.6);
    firstFloorGroup.add(buffetWarmLight);

    // Barista Espresso & Social Cafe Counter
    const cafeCounter = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 1.0, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 })
    );
    cafeCounter.position.set(4.5, 0.5, -3.6);
    firstFloorGroup.add(cafeCounter);

    // Espresso Machine Model
    const cafeEspresso = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.5, 0.5),
      new THREE.MeshStandardMaterial({ color: 0xd97706, metalness: 0.85, roughness: 0.2 })
    );
    cafeEspresso.position.set(4.5, 1.25, -3.6);
    firstFloorGroup.add(cafeEspresso);

    // 3 Large Communal Oak Dining Tables
    const diningTableMat = new THREE.MeshStandardMaterial({ color: 0xc49b71, roughness: 0.45 });
    const diningChairMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
    for (let t = 0; t < 2; t++) {
      const zPos = -0.5 + t * 2.8;
      const table = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.09, 1.5), diningTableMat);
      table.position.set(-2.5, 0.76, zPos);
      firstFloorGroup.add(table);

      // Chairs around table
      for (let ch = 0; ch < 4; ch++) {
        const chair1 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), diningChairMat);
        chair1.position.set(-4.4 + ch * 1.3, 0.45, zPos - 1.0);
        const chair2 = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.45, 0.42), diningChairMat);
        chair2.position.set(-4.4 + ch * 1.3, 0.45, zPos + 1.0);
        firstFloorGroup.add(chair1, chair2);
      }
    }

    // Billiards / Pool Table in Gaming Corner
    const poolGroup = new THREE.Group();
    poolGroup.position.set(4.2, 0, 1.5);
    const poolWood = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 1.5), buffetBaseMat);
    poolWood.position.set(0, 0.375, 0);
    const poolFelt = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.04, 1.2),
      new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 })
    );
    poolFelt.position.set(0, 0.77, 0);
    poolGroup.add(poolWood, poolFelt);
    firstFloorGroup.add(poolGroup);

    // Floor-to-Ceiling Exterior Glass Facade
    const diningGlassFacade = new THREE.Mesh(new THREE.BoxGeometry(14.0, 2.7, 0.08), glassMat);
    diningGlassFacade.position.set(0, 1.35, 5.2);
    firstFloorGroup.add(diningGlassFacade);

    // ==========================================
    // ZONE 5: 4-STORY ISOMETRIC BUILDING CUTAWAY
    // ==========================================
    const buildingElevationGroup = buildingElevationGroupRef.current;
    buildingElevationGroup.clear();
    scene.add(buildingElevationGroup);

    // Ground Plaza Base
    const groundPlaza = new THREE.Mesh(
      new THREE.BoxGeometry(16.0, 0.4, 13.0),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 })
    );
    groundPlaza.position.set(0, -0.2, 0);
    buildingElevationGroup.add(groundPlaza);

    // 4 Stacked Floor Levels with Architectural Cutaways
    const floorLevels = [
      { y: 0, label: 'Ground Lobby & Concierge', color: 0xf1f5f9 },
      { y: 3.2, label: 'Floor 1 • Dining Mess Hall (3 Meals)', color: 0xfde68a },
      { y: 6.4, label: 'Floor 2 • Suite 529 (Your Bed B)', color: 0xc7d2fe, isCurrentFloor: true },
      { y: 9.6, label: 'Floor 3 • Upper Executive Pods', color: 0xe2e8f0 },
      { y: 12.8, label: 'Floor 4 • 360° Rooftop Sky Terrace', color: 0x86efac, isRooftop: true },
    ];

    const concreteFloorMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.4 });
    const wallExteriorMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });

    floorLevels.forEach((fl) => {
      // Slab
      const slab = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.28, 9.5), concreteFloorMat);
      slab.position.set(0, fl.y, 0);
      buildingElevationGroup.add(slab);

      if (!fl.isRooftop) {
        // Rear and Side Perimeter Walls
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(13.5, 2.8, 0.25), wallExteriorMat);
        backWall.position.set(0, fl.y + 1.4, -4.75);
        const sideWall = new THREE.Mesh(new THREE.BoxGeometry(0.25, 2.8, 9.5), wallExteriorMat);
        sideWall.position.set(-6.75, fl.y + 1.4, 0);
        buildingElevationGroup.add(backWall, sideWall);

        // Glass Front Cutaway Facade
        const frontGlass = new THREE.Mesh(new THREE.BoxGeometry(13.5, 2.8, 0.06), glassMat);
        frontGlass.position.set(0, fl.y + 1.4, 4.75);
        buildingElevationGroup.add(frontGlass);
      }

      // Special highlight for Floor 2 (Harish's Suite 529 & Bed B!)
      if (fl.isCurrentFloor) {
        // Glowing Indicator Halo on Floor 2
        const indicatorHalo = new THREE.Mesh(
          new THREE.RingGeometry(1.6, 2.2, 32),
          new THREE.MeshBasicMaterial({ color: 0x6366f1, side: THREE.DoubleSide })
        );
        indicatorHalo.rotation.x = -Math.PI / 2;
        indicatorHalo.position.set(3.2, fl.y + 0.1, 2.0);
        buildingElevationGroup.add(indicatorHalo);

        // Bed Mock on Floor 2
        const bedMock = new THREE.Mesh(
          new THREE.BoxGeometry(2.2, 0.4, 1.3),
          new THREE.MeshStandardMaterial({ color: 0x4f46e5 })
        );
        bedMock.position.set(3.2, fl.y + 0.35, 2.0);
        buildingElevationGroup.add(bedMock);

        // Floor 2 Balcony Projection
        const balconySlab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.2, 3.6), concreteFloorMat);
        balconySlab.position.set(7.5, fl.y, 1.8);
        const balconyGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 3.6), glassMat);
        balconyGlass.position.set(8.65, fl.y + 0.45, 1.8);
        buildingElevationGroup.add(balconySlab, balconyGlass);
      }

      // Rooftop Details on Top Floor
      if (fl.isRooftop) {
        const miniPergola = new THREE.Mesh(
          new THREE.BoxGeometry(5.0, 0.12, 4.0),
          new THREE.MeshStandardMaterial({ color: 0x292524 })
        );
        miniPergola.position.set(-2.0, fl.y + 2.4, 0);
        const miniTurf = new THREE.Mesh(
          new THREE.BoxGeometry(6.0, 0.02, 4.5),
          new THREE.MeshStandardMaterial({ color: 0x166534 })
        );
        miniTurf.position.set(2.5, fl.y + 0.05, 0);
        buildingElevationGroup.add(miniPergola, miniTurf);
      }
    });

    // Vertical Elevator & Stair Column
    const elevatorColumn = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 14.5, 2.6),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 })
    );
    elevatorColumn.position.set(-4.8, 7.0, -2.8);
    buildingElevationGroup.add(elevatorColumn);

    // Initial zone visibility
    suiteGroup.visible = campusZoneRef.current === 'room-529';
    loungeGroup.visible = campusZoneRef.current === 'lounge-pantry';
    rooftopGroup.visible = campusZoneRef.current === 'rooftop-deck';
    firstFloorGroup.visible = campusZoneRef.current === 'first-floor-dining';
    buildingElevationGroup.visible = campusZoneRef.current === 'building-elevation';

    // Mouse & Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onPointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(
        interactiveMeshesRef.current.map((item) => item.mesh),
        false
      );

      if (intersects.length > 0) {
        const found = interactiveMeshesRef.current.find((item) => item.mesh === intersects[0].object);
        if (found) {
          setHoveredObject(found.name);
          container.style.cursor = 'pointer';
        }
      } else {
        setHoveredObject(null);
        if (!cameraState.current.isDragging) {
          container.style.cursor = 'grab';
        }
      }

      if (cameraState.current.isDragging) {
        const deltaX = e.clientX - cameraState.current.prevMouseX;
        const deltaY = e.clientY - cameraState.current.prevMouseY;
        cameraState.current.prevMouseX = e.clientX;
        cameraState.current.prevMouseY = e.clientY;

        if (elevationModeRef.current === 'firstperson') {
          cameraState.current.fpYaw -= deltaX * 0.005;
          cameraState.current.fpPitch = Math.max(-0.6, Math.min(0.6, cameraState.current.fpPitch - deltaY * 0.005));
        } else {
          cameraState.current.theta -= deltaX * 0.007;
          cameraState.current.phi = Math.max(0.05, Math.min(Math.PI / 2.1, cameraState.current.phi - deltaY * 0.007));
        }
      }
    };

    const onPointerDown = (e: MouseEvent) => {
      cameraState.current.isDragging = true;
      cameraState.current.prevMouseX = e.clientX;
      cameraState.current.prevMouseY = e.clientY;
      container.style.cursor = 'grabbing';
    };

    const onPointerUp = (e: MouseEvent) => {
      const deltaDrag = Math.hypot(
        e.clientX - cameraState.current.prevMouseX,
        e.clientY - cameraState.current.prevMouseY
      );
      cameraState.current.isDragging = false;
      container.style.cursor = 'grab';

      if (deltaDrag < 5) {
        const rect = container.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(
          interactiveMeshesRef.current.map((item) => item.mesh),
          false
        );
        if (intersects.length > 0) {
          const hit = interactiveMeshesRef.current.find((item) => item.mesh === intersects[0].object);
          if (hit) {
            if (hit.id.startsWith('bed-')) {
              onSelectPod(hit.id);
            } else if (hit.id === 'access-portal') {
              onOpenSmartLock();
            }
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (elevationModeRef.current !== 'firstperson') {
        cameraState.current.distance = Math.max(8, Math.min(30, cameraState.current.distance + e.deltaY * 0.015));
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (elevationModeRef.current !== 'firstperson') return;
      const step = 0.3;
      const state = cameraState.current;
      const forward = new THREE.Vector3(Math.sin(state.fpYaw), 0, Math.cos(state.fpYaw)).negate();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      if (e.key === 'w' || e.key === 'ArrowUp') state.fpPos.addScaledVector(forward, step);
      else if (e.key === 's' || e.key === 'ArrowDown') state.fpPos.addScaledVector(forward, -step);
      else if (e.key === 'a' || e.key === 'ArrowLeft') state.fpPos.addScaledVector(right, -step);
      else if (e.key === 'd' || e.key === 'ArrowRight') state.fpPos.addScaledVector(right, step);

      state.fpPos.x = Math.max(-5.0, Math.min(6.8, state.fpPos.x));
      state.fpPos.z = Math.max(-3.6, Math.min(3.6, state.fpPos.z));
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    updateLaserMeasurement();

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = cameraState.current;

      // Update zone visibilities dynamically
      suiteGroupRef.current.visible = campusZoneRef.current === 'room-529';
      loungeGroupRef.current.visible = campusZoneRef.current === 'lounge-pantry';
      rooftopGroupRef.current.visible = campusZoneRef.current === 'rooftop-deck';
      firstFloorGroupRef.current.visible = campusZoneRef.current === 'first-floor-dining';
      buildingElevationGroupRef.current.visible = campusZoneRef.current === 'building-elevation';

      // 360 degree continuous auto-spin
      if (is360AutoSpinningRef.current && elevationModeRef.current !== 'firstperson') {
        state.theta += delta * 0.22;
      }

      if (elevationModeRef.current === 'firstperson') {
        camera.position.lerp(state.fpPos, 0.1);
        const lookDir = new THREE.Vector3(
          Math.sin(state.fpYaw) * Math.cos(state.fpPitch),
          Math.sin(state.fpPitch),
          -Math.cos(state.fpYaw) * Math.cos(state.fpPitch)
        );
        _currentLookAt.copy(camera.position).add(lookDir);
        camera.lookAt(_currentLookAt);
      } else {
        const r = state.distance;
        const phi = state.phi;
        const theta = state.theta;

        _targetCameraPos.set(
          state.target.x + r * Math.sin(phi) * Math.sin(theta),
          state.target.y + r * Math.cos(phi),
          state.target.z + r * Math.sin(phi) * Math.cos(theta)
        );

        camera.position.lerp(_targetCameraPos, 0.08);
        _currentLookAt.lerp(state.target, 0.08);
        camera.lookAt(_currentLookAt);
      }

      // Door Swing
      state.currentDoorAngle = THREE.MathUtils.damp(state.currentDoorAngle, state.targetDoorAngle, 5.0, delta);
      if (doorPivotRef.current) {
        doorPivotRef.current.rotation.y = state.currentDoorAngle;
      }

      // Hydraulic lift
      state.currentLiftAngle = THREE.MathUtils.damp(state.currentLiftAngle, state.targetLiftAngle, 6.0, delta);
      if (hydraulicDeckGroup.current) {
        hydraulicDeckGroup.current.rotation.z = state.currentLiftAngle;
      }

      // Exploded View
      state.currentExplodedFactor = THREE.MathUtils.damp(state.currentExplodedFactor, state.targetExplodedFactor, 5.0, delta);
      explodedCeilingGroup.current.position.y = 2.8 + state.currentExplodedFactor * 3.5;
      electricalLayerGroup.current.position.y = state.currentExplodedFactor * 1.5;

      // Layer visibilities
      const curLayer = activeLayerRef.current;
      electricalLayerGroup.current.visible = curLayer === 'electrical' || curLayer === 'master';
      sunlightLayerGroup.current.visible = curLayer === 'sunlight' || curLayer === 'master';
      storageLayerGroup.current.visible = curLayer === 'storage' || curLayer === 'master';
      acousticLayerGroup.current.visible = curLayer === 'acoustic' || curLayer === 'master';
      laserDimensionGroup.current.visible = measureModeRef.current;

      // Airflow particles
      if (airParticlesRef.current && (curLayer === 'sunlight' || curLayer === 'master')) {
        const posAttr = airParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          arr[i * 3 + 2] += 0.02;
          arr[i * 3 + 1] -= 0.005;
          if (arr[i * 3 + 2] > 3.0) {
            arr[i * 3 + 2] = -3.8;
            arr[i * 3 + 1] = 1.8;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Halo animations
      const curSelected = selectedPodIdRef.current;
      beds.forEach((pod) => {
        const halo = scene.getObjectByName(`${pod.id}-halo`) as THREE.Mesh;
        if (halo && halo.material instanceof THREE.MeshBasicMaterial) {
          if (pod.id === curSelected) {
            halo.material.opacity = 0.9;
            halo.scale.setScalar(1.08 + Math.sin(clock.getElapsedTime() * 4) * 0.04);
          } else {
            halo.material.opacity = pod.isCurrentUser ? 0.6 : 0.25;
            halo.scale.setScalar(1.0);
          }
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);

      renderer.dispose();
      woodTexture.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [beds, onSelectPod, onOpenSmartLock, updateLaserMeasurement]);

  const activeMeasure = DIMENSION_MEASUREMENTS.find((m) => m.id === selectedMeasurementId) || DIMENSION_MEASUREMENTS[0];

  return (
    <div className="relative w-full h-[540px] lg:h-[600px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Campus Zone Switcher with visual floor indicators */}
      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 max-w-full">
        <div className="flex items-center gap-1 bg-white/95 p-1 rounded-xl border border-slate-200 shadow-md overflow-x-auto max-w-[85vw] sm:max-w-none scrollbar-none">
          <button
            onClick={() => onCampusZoneChange('building-elevation')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              campusZone === 'building-elevation'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🏢</span>
            <span>4-Story Building Cutaway</span>
          </button>
          <button
            onClick={() => onCampusZoneChange('room-529')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              campusZone === 'room-529'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🛏️</span>
            <span>Floor 2 • Suite 529</span>
          </button>
          <button
            onClick={() => onCampusZoneChange('first-floor-dining')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              campusZone === 'first-floor-dining'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🍲</span>
            <span>Floor 1 • Dining Mess Hall</span>
          </button>
          <button
            onClick={() => onCampusZoneChange('lounge-pantry')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              campusZone === 'lounge-pantry'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>☕</span>
            <span>Floor 2 • The Commons</span>
          </button>
          <button
            onClick={() => onCampusZoneChange('rooftop-deck')}
            className={`px-2.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
              campusZone === 'rooftop-deck'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>🌿</span>
            <span>Floor 4 • 360° Rooftop</span>
          </button>
        </div>

        {/* Current Zone Sub-title / Info */}
        <div className="bg-slate-900/90 text-white text-[11px] px-2.5 py-1 rounded-md shadow-xs flex items-center gap-2 pointer-events-none w-fit">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>
            {campusZone === 'building-elevation' && '4-Story Architectural Isometric Cutaway • Ground, 1st Fl, 2nd Fl, 3rd Fl & Rooftop'}
            {campusZone === 'room-529' && 'Floor 2 • Private Residency Suite (Allocated Bed B • Sunrise Balcony • En-Suite)'}
            {campusZone === 'first-floor-dining' && 'Floor 1 • Daily Feast Hot Buffet • Chef-Prepared 3 Meals • Barista Social Cafe • Pool Table'}
            {campusZone === 'lounge-pantry' && 'Floor 2 East • The Commons (24/7 Collaboration • 500Mbps Mesh • Silent Booths)'}
            {campusZone === 'rooftop-deck' && 'Floor 4 • Total 360° Panoramic Sky Terrace • Sunset Pergola • Firepit Stargazing • 15kVA Solar Bank'}
          </span>
        </div>

        {/* Laser Dimension Mode Active Card */}
        {measureMode && (
          <div className="bg-slate-900/95 text-white p-2.5 rounded-xl border border-cyan-500/40 shadow-lg backdrop-blur-xs flex flex-col gap-1.5 max-w-xs">
            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400">
              <span>LASER TAPE MEASURE</span>
              <span className="font-mono text-xs text-white">{activeMeasure.distanceFt} ({activeMeasure.distanceM})</span>
            </div>
            <p className="text-[10px] text-slate-300">{activeMeasure.description}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {DIMENSION_MEASUREMENTS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectMeasurement(m.id)}
                  className={`px-2 py-0.5 text-[10px] rounded font-medium cursor-pointer ${
                    selectedMeasurementId === m.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {m.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        {/* 360 Auto Orbit Sweep Button */}
        <button
          onClick={() => setIs360AutoSpinning(!is360AutoSpinning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer ${
            is360AutoSpinning
              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-300'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
          title="Toggle 360° Continuous Auto-Orbit Pan"
        >
          <span className="text-sm">🔄</span>
          <span className="hidden sm:inline">{is360AutoSpinning ? '360° Orbiting...' : 'Watch 360° View'}</span>
        </button>

        <button
          onClick={onToggleMeasureMode}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer ${
            measureMode
              ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
          title="Toggle 3D Laser Dimension Tape"
        >
          <span>📐</span>
          <span className="hidden sm:inline">Laser Ruler</span>
        </button>

        {campusZone === 'room-529' && (
          <button
            onClick={centerOnBedB}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-white hover:bg-indigo-50 border border-indigo-200 rounded-lg shadow-xs transition-colors cursor-pointer"
            title="Center camera on your bed"
          >
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>Center on Bed B</span>
          </button>
        )}

        <button
          onClick={resetView}
          className="p-1.5 text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-xs transition-colors cursor-pointer"
          title="Reset Camera View"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Floating 3D Hover Tooltip */}
      {hoveredObject && (
        <div className="absolute top-16 left-4 pointer-events-none bg-slate-900/90 text-white text-xs px-2.5 py-1 rounded-md shadow-md backdrop-blur-xs flex items-center gap-1.5 transition-all">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>{hoveredObject}</span>
        </div>
      )}

      {/* First-Person Hotspot Teleport Bar */}
      {elevationMode === 'firstperson' && (
        <div className="absolute top-16 right-4 flex flex-col gap-1.5 bg-white/95 p-2 rounded-xl border border-slate-200 shadow-md">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1">Walk to Hotspot:</span>
          <div className="grid grid-cols-2 gap-1.5">
            {HOTSPOTS.map((h) => (
              <button
                key={h.id}
                onClick={() => teleportToHotspot(h)}
                className={`px-2 py-1 text-xs font-semibold rounded-lg text-left flex items-center gap-1.5 transition-colors cursor-pointer ${
                  currentHotspot === h.id ? 'bg-indigo-600 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{h.icon}</span>
                <span className="truncate">{h.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D In-Scene Overlays for Suite Mode */}
      {elevationMode !== 'firstperson' && campusZone === 'room-529' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bed B Tag */}
          <div className="absolute top-[52%] left-[48%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-b')}>
            <div className="flex items-center gap-1.5 bg-indigo-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md hover:bg-indigo-700 transition-all transform hover:scale-105 border border-indigo-400/50">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span>YOUR BED (POD B)</span>
            </div>
            <div className="mt-1 flex items-center justify-center">
              <span className="text-[10px] font-medium text-indigo-900 bg-white/90 px-1.5 py-0.5 rounded shadow-xs">
                65W TYPE-C • {bedCustomization.hydraulicBedLifted ? 'Storage Open (450L)' : '230V Active'}
              </span>
            </div>
          </div>

          {/* Praveen M. (Bed A) */}
          <div className="absolute top-[28%] left-[24%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-a')}>
            <div className="bg-white/90 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-slate-200 hover:border-indigo-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Praveen M. • Deep Work</span>
            </div>
          </div>

          {/* Rohan K. (Bed C) */}
          <div className="absolute top-[64%] left-[32%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-c')}>
            <div className="bg-white/90 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-slate-200 hover:border-indigo-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Rohan K. • At Zoho</span>
            </div>
          </div>

          {/* Bed D Open Tag */}
          <div className="absolute top-[24%] left-[48%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-d')}>
            <div className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1">
              <span>+ CLAIM FOR FRIEND</span>
            </div>
          </div>

          {/* Smart Keypad on Door */}
          <div className="absolute bottom-[24%] left-[22%] pointer-events-auto cursor-pointer" onClick={onOpenSmartLock}>
            <div className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg shadow-md border border-slate-700 hover:bg-slate-800 transition-colors flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isDoorUnlocked ? 'bg-emerald-400 animate-pulse' : 'bg-cyan-400'}`} />
              <span>{isDoorUnlocked ? 'PORTAL UNLATCHED' : 'KEYPAD ENTRY (8492)'}</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D In-Scene Overlays for Rooftop Deck */}
      {elevationMode !== 'firstperson' && campusZone === 'rooftop-deck' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[32%] left-[30%] -translate-x-1/2 pointer-events-auto">
            <div className="bg-amber-500 text-slate-950 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-300">
              <span>🌿</span>
              <span>SUNSET PERGOLA & FESTOONS</span>
            </div>
          </div>
          <div className="absolute top-[48%] right-[24%] pointer-events-auto">
            <div className="bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-orange-400">
              <span>🔥</span>
              <span>FIREPIT STARGAZING LOUNGE</span>
            </div>
          </div>
          <div className="absolute bottom-[28%] left-[28%] pointer-events-auto">
            <div className="bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-emerald-500">
              <span>🧘</span>
              <span>SUNRISE YOGA TURF LAWN</span>
            </div>
          </div>
          <div className="absolute top-[22%] left-[16%] pointer-events-auto">
            <div className="bg-indigo-900/90 text-indigo-200 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-indigo-700/60 flex items-center gap-1">
              <span>⚡</span>
              <span>15kVA Clean Solar PV Bank</span>
            </div>
          </div>
          <div className="absolute top-16 left-1/2 -translate-x-1/2 pointer-events-auto">
            <div className="bg-black/75 backdrop-blur-md text-white text-xs px-3 py-1 rounded-full border border-white/20 shadow-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>360° TOTAL PANORAMIC CITY SKYLINE</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D In-Scene Overlays for First Floor Dining */}
      {elevationMode !== 'firstperson' && campusZone === 'first-floor-dining' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[28%] left-[28%] -translate-x-1/2 pointer-events-auto">
            <div className="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-amber-400">
              <span>🍲</span>
              <span>DAILY FEAST HOT BUFFET (3 MEALS)</span>
            </div>
          </div>
          <div className="absolute top-[26%] right-[22%] pointer-events-auto">
            <div className="bg-slate-900 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center gap-1.5 border border-slate-700">
              <span>☕</span>
              <span>BARISTA ESPRESSO & CAFE</span>
            </div>
          </div>
          <div className="absolute bottom-[30%] left-[34%] pointer-events-auto">
            <div className="bg-white/95 text-slate-800 text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-xs border border-slate-200 flex items-center gap-1.5">
              <span>🍽️</span>
              <span>Communal Oak Dining (60 Seater)</span>
            </div>
          </div>
          <div className="absolute bottom-[32%] right-[24%] pointer-events-auto">
            <div className="bg-emerald-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <span>🎱</span>
              <span>Billiards & Game Arena</span>
            </div>
          </div>
        </div>
      )}

      {/* 3D In-Scene Overlays for Building Elevation */}
      {elevationMode !== 'firstperson' && campusZone === 'building-elevation' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[16%] right-[20%] pointer-events-auto">
            <div className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border border-emerald-400">
              <span>LEVEL 4 • 360° SKY TERRACE & SOLAR</span>
            </div>
          </div>
          <div className="absolute top-[34%] right-[20%] pointer-events-auto">
            <div className="bg-slate-700 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              <span>LEVEL 3 • EXECUTIVE PODS</span>
            </div>
          </div>
          <div className="absolute top-[50%] right-[18%] pointer-events-auto cursor-pointer" onClick={() => onCampusZoneChange('room-529')}>
            <div className="bg-indigo-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-lg shadow-lg border-2 border-indigo-300 flex items-center gap-1.5 hover:bg-indigo-700 transition-colors pointer-events-auto">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>LEVEL 2 • SUITE 529 (YOUR BED B)</span>
            </div>
          </div>
          <div className="absolute top-[68%] right-[20%] pointer-events-auto cursor-pointer" onClick={() => onCampusZoneChange('first-floor-dining')}>
            <div className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border border-amber-400">
              <span>LEVEL 1 • DINING MESS HALL & CAFE</span>
            </div>
          </div>
          <div className="absolute bottom-[18%] right-[20%] pointer-events-auto">
            <div className="bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs">
              <span>GROUND • CONCIERGE LOBBY & BIKES</span>
            </div>
          </div>
        </div>
      )}

      {/* Daylight Simulator & Time-of-Day Bar */}
      <div className="absolute bottom-14 left-1/2 -translate-x-1/2 bg-white/95 px-3 py-1.5 rounded-xl border border-slate-200 shadow-md flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lighting:</span>
        <div className="flex items-center gap-1">
          {(
            [
              { id: 'morning', label: 'Sunrise 7 AM', icon: '🌅' },
              { id: 'noon', label: 'Noon 12 PM', icon: '☀️' },
              { id: 'sunset', label: 'Sunset 6 PM', icon: '🌇' },
              { id: 'night', label: 'Night 10:30 PM', icon: '🌙' },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => onTimeOfDayChange(t.id)}
              className={`px-2 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
                timeOfDay === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4 text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span>Harish (You)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-emerald-500 bg-emerald-50" />
            <span>Bed D Free</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>Smart Keypad</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-700">
          <span className="text-[11px] text-slate-400 uppercase font-semibold hidden md:inline">Air Quality & Climate</span>
          <span className="text-emerald-700 font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Optimized • Filter Cleaned 2d ago</span>
          </span>
        </div>
      </div>
    </div>
  );
};
