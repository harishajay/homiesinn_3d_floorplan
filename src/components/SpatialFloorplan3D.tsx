import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { BedPod, SpatialLayer, ElevationMode, TimeOfDay, BedCustomization, WalkthroughHotspot } from '../types/coliving';

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
}

// Module-level reusable math objects to avoid GC in render loop
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
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredObject, setHoveredObject] = useState<string | null>(null);
  const [currentHotspot, setCurrentHotspot] = useState<string>('bed-b');

  // Three.js scene references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameId = useRef<number | null>(null);

  // Sub-groups
  const explodedCeilingGroup = useRef<THREE.Group>(new THREE.Group());
  const electricalLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const sunlightLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const storageLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const acousticLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const presenceLayerGroup = useRef<THREE.Group>(new THREE.Group());
  const airParticlesRef = useRef<THREE.Points | null>(null);
  const interactiveMeshesRef = useRef<{ mesh: THREE.Object3D; id: string; name: string }[]>([]);

  // Hydraulic lift & customizer meshes
  const hydraulicDeckGroup = useRef<THREE.Group | null>(null);
  const bedBDuvetMeshRef = useRef<THREE.Mesh | null>(null);
  const deskAccessoryGroup = useRef<THREE.Group | null>(null);

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
    // First person variables
    fpPos: new THREE.Vector3(1.8, 1.3, 1.8),
    fpLook: new THREE.Vector3(3.2, 0.9, 2.1),
    fpPitch: 0,
    fpYaw: 0,
    // Hydraulic lift angle
    currentLiftAngle: 0,
    targetLiftAngle: 0,
  });

  const activeLayerRef = useRef(activeLayer);
  activeLayerRef.current = activeLayer;
  const elevationModeRef = useRef(elevationMode);
  elevationModeRef.current = elevationMode;
  const selectedPodIdRef = useRef(selectedPodId);
  selectedPodIdRef.current = selectedPodId;
  const customizationRef = useRef(bedCustomization);
  customizationRef.current = bedCustomization;

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
      // Hotspot camera
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

  // Sync lights (reading light, desk lamp, daylight)
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
      // Night mode (10:30 PM consensus)
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

    // Bed B Reading Lamp
    const podBSpot = new THREE.PointLight(0xffe0a3, 1.4, 7, 1.4);
    podBSpot.position.set(3.2, 2.2, 2.1);
    podBSpotLightRef.current = podBSpot;
    scene.add(podBSpot);

    // Desk #2 Lamp Light
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

    // Procedural Parquet & Tile Textures
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
      ctx.fillStyle = 'rgba(160, 140, 120, 0.04)';
      for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        ctx.fillRect(x, y, Math.random() * 20 + 5, 1);
      }
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, 3);
      texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    };

    const woodTexture = createWoodTexture();

    const roomGroup = new THREE.Group();
    scene.add(roomGroup);

    // Floor Base (Room 529: 24ft x 18ft scaled to 11.2 x 8.4)
    const floorGeo = new THREE.BoxGeometry(11.2, 0.3, 8.4);
    const floorMat = new THREE.MeshStandardMaterial({
      map: woodTexture,
      roughness: 0.45,
      metalness: 0.05,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.set(0, -0.15, 0);
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xedf0f5, roughness: 0.85 });
    const doorFrameMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(11.4, 2.2, 0.3), wallMat);
    backWall.position.set(0, 1.0, -4.2);
    backWall.receiveShadow = true;
    backWall.castShadow = true;
    roomGroup.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.2, 8.4), wallMat);
    leftWall.position.set(-5.6, 1.0, 0);
    leftWall.receiveShadow = true;
    leftWall.castShadow = true;
    roomGroup.add(leftWall);

    // Smart Access Portal Door
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(0.35, 2.0, 1.2), doorFrameMat);
    doorFrame.position.set(-5.6, 0.9, -1.2);
    roomGroup.add(doorFrame);

    const rfidBox = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.16), doorFrameMat);
    rfidBox.position.set(-5.4, 1.1, -0.4);
    const rfidLed = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), new THREE.MeshBasicMaterial({ color: 0x10b981 }));
    rfidLed.position.set(0.07, 0.05, 0);
    rfidBox.add(rfidLed);
    roomGroup.add(rfidBox);
    interactiveMeshesRef.current.push({ mesh: rfidBox, id: 'access-portal', name: 'Smart Access Portal (RFID Entry)' });

    // Glass material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xdaf0f7,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.2,
      thickness: 0.4,
    });

    // Ensuite Bath
    const bathWall = new THREE.Mesh(new THREE.BoxGeometry(2.9, 1.8, 0.08), glassMat);
    bathWall.position.set(-4.0, 0.9, -1.7);
    roomGroup.add(bathWall);
    interactiveMeshesRef.current.push({ mesh: bathWall, id: 'ensuite-bath', name: 'En-Suite Bath' });

    // Sunrise Balcony
    const balconyFloor = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.25, 4.2),
      new THREE.MeshStandardMaterial({ color: 0xd4c5b3, roughness: 0.7 })
    );
    balconyFloor.position.set(6.7, -0.16, 1.8);
    balconyFloor.receiveShadow = true;
    roomGroup.add(balconyFloor);

    const railingGlass = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.9, 4.2), glassMat);
    railingGlass.position.set(7.85, 0.45, 1.8);
    roomGroup.add(railingGlass);

    const bistroTable = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.6, 16),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 })
    );
    bistroTable.position.set(6.8, 0.3, 1.8);
    roomGroup.add(bistroTable);

    // Balcony Plant
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
    roomGroup.add(pot);
    interactiveMeshesRef.current.push({ mesh: balconyFloor, id: 'sunrise-balcony', name: 'Sunrise Balcony' });

    // BUILD BED PODS with Hydraulic Storage on Bed B
    const bedWoodMat = new THREE.MeshStandardMaterial({ color: 0xc49b71, roughness: 0.4 });
    const mattressMat = new THREE.MeshStandardMaterial({ color: 0xfbfbfb, roughness: 0.8 });
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });

    beds.forEach((pod) => {
      const bedGroup = new THREE.Group();
      bedGroup.position.set(pod.coordinates.x, 0, pod.coordinates.z);
      bedGroup.name = pod.id;

      // Base Box (frame)
      const base = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.45, 1.4), bedWoodMat);
      base.position.set(0, 0.225, 0);
      base.castShadow = true;
      base.receiveShadow = true;
      bedGroup.add(base);

      // Headboard
      const headboard = new THREE.Mesh(new THREE.BoxGeometry(0.18, 1.2, 1.4), bedWoodMat);
      headboard.position.set(1.15, 0.6, 0);
      headboard.castShadow = true;
      bedGroup.add(headboard);

      if (pod.isCurrentUser) {
        // Bed B: Hydraulic Lifting Upper Deck
        const hydraulicDeck = new THREE.Group();
        hydraulicDeck.position.set(1.1, 0.45, 0); // Pivot hinge at headboard
        hydraulicDeckGroup.current = hydraulicDeck;

        // Mattress attached to pivot deck
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.3), mattressMat);
        mattress.position.set(-1.15, 0.15, 0);
        mattress.castShadow = true;
        hydraulicDeck.add(mattress);

        // Customizable Duvet Blanket
        const duvetMat = new THREE.MeshStandardMaterial({
          color: new THREE.Color(customizationRef.current.duvetColor),
          roughness: 0.7,
        });
        const duvet = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.08, 1.32), duvetMat);
        duvet.position.set(-1.55, 0.33, 0);
        duvet.castShadow = true;
        bedBDuvetMeshRef.current = duvet;
        hydraulicDeck.add(duvet);

        // Pillows
        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p1.position.set(-0.35, 0.35, -0.3);
        p1.rotation.z = -0.15;
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p2.position.set(-0.35, 0.35, 0.3);
        p2.rotation.z = -0.15;
        hydraulicDeck.add(p1);
        hydraulicDeck.add(p2);

        bedGroup.add(hydraulicDeck);

        // Under-bed storage interior (Suitcases & Organizers visible when lifted)
        const storageInterior = new THREE.Group();

        // 1. Large 100L Navy Suitcase
        const suitcase1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.28, 0.45),
          new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.3 })
        );
        suitcase1.position.set(0.3, 0.16, -0.25);
        storageInterior.add(suitcase1);

        // 2. Medium Silver Suitcase
        const suitcase2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.55, 0.24, 0.38),
          new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.2 })
        );
        suitcase2.position.set(-0.4, 0.14, 0.25);
        storageInterior.add(suitcase2);

        // 3. Shoe organizer bin
        const bin = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 0.18, 0.45),
          new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 })
        );
        bin.position.set(0.3, 0.11, 0.28);
        storageInterior.add(bin);

        bedGroup.add(storageInterior);
      } else {
        // Standard Bed
        const mattress = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.3, 1.3), mattressMat);
        mattress.position.set(-0.05, 0.6, 0);
        mattress.castShadow = true;
        bedGroup.add(mattress);

        const duvetColor = pod.isAvailable ? 0x94a3b8 : 0x3b82f6;
        const duvet = new THREE.Mesh(
          new THREE.BoxGeometry(1.4, 0.08, 1.32),
          new THREE.MeshStandardMaterial({ color: duvetColor, roughness: 0.7 })
        );
        duvet.position.set(-0.45, 0.78, 0);
        duvet.castShadow = true;
        bedGroup.add(duvet);

        const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p1.position.set(0.75, 0.8, -0.3);
        p1.rotation.z = -0.15;
        const p2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.14, 0.5), pillowMat);
        p2.position.set(0.75, 0.8, 0.3);
        p2.rotation.z = -0.15;
        bedGroup.add(p1);
        bedGroup.add(p2);
      }

      // Bedside Nightstand & Lamp
      const nightstand = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.45, 0.5), bedWoodMat);
      nightstand.position.set(0.8, 0.22, 1.0);
      bedGroup.add(nightstand);

      const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 12), doorFrameMat);
      lampBase.position.set(0.8, 0.46, 1.0);
      const lampShade = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.15, 12),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: pod.isCurrentUser ? 0xffdf9e : 0x000000,
          emissiveIntensity: 0.5,
        })
      );
      lampShade.position.set(0.8, 0.65, 1.0);
      bedGroup.add(lampBase);
      bedGroup.add(lampShade);

      // Selection Halo
      const halo = new THREE.Mesh(
        new THREE.RingGeometry(1.2, 1.35, 32),
        new THREE.MeshBasicMaterial({
          color: pod.isCurrentUser ? 0x4f46e5 : pod.isAvailable ? 0x10b981 : 0x3b82f6,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: pod.isCurrentUser ? 0.75 : 0.35,
        })
      );
      halo.rotation.x = -Math.PI / 2;
      halo.position.set(0, 0.02, 0);
      halo.name = `${pod.id}-halo`;
      bedGroup.add(halo);

      interactiveMeshesRef.current.push({ mesh: base, id: pod.id, name: pod.name });
      roomGroup.add(bedGroup);
    });

    // Workstation Desks
    const deskMat = new THREE.MeshStandardMaterial({ color: 0xb58b5e, roughness: 0.5 });
    const deskLegMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3 });

    const createWorkstation = (x: number, z: number, rotation: number, isDesk2: boolean) => {
      const deskGroup = new THREE.Group();
      deskGroup.position.set(x, 0, z);
      deskGroup.rotation.y = rotation;

      const top = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.08, 0.8), deskMat);
      top.position.set(0, 0.75, 0);
      top.castShadow = true;
      deskGroup.add(top);

      const leg1 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.7), deskLegMat);
      leg1.position.set(-0.7, 0.375, 0);
      const leg2 = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.75, 0.7), deskLegMat);
      leg2.position.set(0.7, 0.375, 0);
      deskGroup.add(leg1);
      deskGroup.add(leg2);

      // Laptop
      const laptop = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.02, 0.24),
        new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 })
      );
      laptop.position.set(0, 0.8, 0);
      deskGroup.add(laptop);

      // Chair
      const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 0.45), deskLegMat);
      chairSeat.position.set(0, 0.48, 0.48);
      deskGroup.add(chairSeat);

      if (isDesk2) {
        // Desk Accessory slot for Desk #2
        const accGroup = new THREE.Group();
        deskAccessoryGroup.current = accGroup;

        // Dual monitor model
        const monitorGeo = new THREE.BoxGeometry(0.48, 0.28, 0.02);
        const monitorMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
        const screenMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        const mon1 = new THREE.Mesh(monitorGeo, monitorMat);
        mon1.position.set(-0.25, 1.05, -0.2);
        mon1.rotation.y = 0.15;
        const monScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.24), screenMat);
        monScreen.position.set(0, 0, 0.012);
        mon1.add(monScreen);

        const mon2 = new THREE.Mesh(monitorGeo, monitorMat);
        mon2.position.set(0.25, 1.05, -0.2);
        mon2.rotation.y = -0.15;
        const monScreen2 = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.24), screenMat);
        monScreen2.position.set(0, 0, 0.012);
        mon2.add(monScreen2);

        accGroup.add(mon1);
        accGroup.add(mon2);
        deskGroup.add(accGroup);
      }

      return deskGroup;
    };

    roomGroup.add(createWorkstation(-3.0, -0.8, 0, false));
    roomGroup.add(createWorkstation(3.2, 0.6, Math.PI, true));

    // Steel RFID Lockers
    const lockerBank = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.0, 0.65),
      new THREE.MeshStandardMaterial({ color: 0x3b82f6, metalness: 0.6, roughness: 0.35 })
    );
    lockerBank.position.set(-1.8, 1.0, -3.8);
    lockerBank.castShadow = true;
    roomGroup.add(lockerBank);
    interactiveMeshesRef.current.push({ mesh: lockerBank, id: 'asset-locker', name: 'Steel RFID Lockers (A, B, C, D)' });

    // AC Unit
    const acMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.35, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 })
    );
    acMesh.position.set(1.5, 1.9, -4.0);
    roomGroup.add(acMesh);

    // SPATIAL LAYERS: Electrical
    const electricalGroup = electricalLayerGroup.current;
    electricalGroup.clear();
    const conduitMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.9,
    });
    const c1 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 11.0, 8), conduitMat);
    c1.rotation.z = Math.PI / 2;
    c1.position.set(0, 0.04, -4.05);
    electricalGroup.add(c1);

    const c2 = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 8.0, 8), conduitMat);
    c2.rotation.x = Math.PI / 2;
    c2.position.set(5.45, 0.04, 0);
    electricalGroup.add(c2);

    beds.forEach((pod) => {
      const hubBox = new THREE.Mesh(
        new THREE.BoxGeometry(0.16, 0.16, 0.16),
        new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8 })
      );
      hubBox.position.set(pod.coordinates.x + 0.9, 0.65, pod.coordinates.z + 0.6);
      electricalGroup.add(hubBox);
    });
    roomGroup.add(electricalGroup);

    // SPATIAL LAYERS: Sunlight & Airflow
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

    // AC Air Particles
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
    roomGroup.add(sunlightGroup);

    // SPATIAL LAYERS: Storage
    const storageGroup = storageLayerGroup.current;
    storageGroup.clear();
    const hydraulicVolume = new THREE.Mesh(
      new THREE.BoxGeometry(2.3, 0.35, 1.3),
      new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x7c3aed, emissiveIntensity: 0.5, transparent: true, opacity: 0.45 })
    );
    hydraulicVolume.position.set(3.2, 0.45, 2.1);
    storageGroup.add(hydraulicVolume);
    roomGroup.add(storageGroup);

    // SPATIAL LAYERS: Acoustic Waves
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
    roomGroup.add(acousticGroup);

    // Ceiling Group for Exploded View
    const ceilingGroup = explodedCeilingGroup.current;
    ceilingGroup.clear();
    const beamsMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    for (let z = -3.5; z <= 3.5; z += 2.0) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.12, 0.15), beamsMat);
      b.position.set(0, 0, z);
      ceilingGroup.add(b);
    }
    ceilingGroup.position.set(0, 2.8, 0);
    roomGroup.add(ceilingGroup);

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
          // Look around in first person
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
          if (hit && hit.id.startsWith('bed-')) {
            onSelectPod(hit.id);
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

    // Keyboard WASD navigation in first-person
    const onKeyDown = (e: KeyboardEvent) => {
      if (elevationModeRef.current !== 'firstperson') return;
      const step = 0.3;
      const state = cameraState.current;
      const forward = new THREE.Vector3(
        Math.sin(state.fpYaw),
        0,
        Math.cos(state.fpYaw)
      ).negate();
      const right = new THREE.Vector3(-forward.z, 0, forward.x);

      if (e.key === 'w' || e.key === 'ArrowUp') {
        state.fpPos.addScaledVector(forward, step);
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        state.fpPos.addScaledVector(forward, -step);
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        state.fpPos.addScaledVector(right, -step);
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        state.fpPos.addScaledVector(right, step);
      }

      // Bound to room
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

    // Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animFrameId.current = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = cameraState.current;

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

      // Hydraulic lift animation
      state.currentLiftAngle = THREE.MathUtils.damp(
        state.currentLiftAngle,
        state.targetLiftAngle,
        6.0,
        delta
      );
      if (hydraulicDeckGroup.current) {
        hydraulicDeckGroup.current.rotation.z = state.currentLiftAngle;
      }

      // Exploded View damping
      state.currentExplodedFactor = THREE.MathUtils.damp(
        state.currentExplodedFactor,
        state.targetExplodedFactor,
        5.0,
        delta
      );
      explodedCeilingGroup.current.position.y = 2.8 + state.currentExplodedFactor * 3.5;
      electricalLayerGroup.current.position.y = state.currentExplodedFactor * 1.5;

      // Layer visibilities
      const curLayer = activeLayerRef.current;
      electricalLayerGroup.current.visible = curLayer === 'electrical' || curLayer === 'master';
      sunlightLayerGroup.current.visible = curLayer === 'sunlight' || curLayer === 'master';
      storageLayerGroup.current.visible = curLayer === 'storage' || curLayer === 'master';
      acousticLayerGroup.current.visible = curLayer === 'acoustic' || curLayer === 'master';

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

      // Bed Halo animation
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
  }, [beds, onSelectPod]);

  return (
    <div className="relative w-full h-[540px] lg:h-[600px] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm select-none">
      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Status & Mode */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-xs">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          <span className="text-xs font-semibold text-slate-900">
            {elevationMode === 'isometric'
              ? 'Isometric 3D Elevation'
              : elevationMode === 'exploded'
              ? 'Exploded Architectural Layers'
              : elevationMode === 'cad'
              ? 'Top-Down CAD Floorplan'
              : 'First-Person Virtual Walkthrough (360°)'}
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-xs text-slate-500 font-medium">Floor 2 North-East</span>
        </div>

        {elevationMode === 'firstperson' && (
          <div className="bg-slate-900/90 text-white text-[11px] px-2.5 py-1 rounded-md shadow-md flex items-center gap-2 pointer-events-auto">
            <span>Click & drag to look around</span>
            <span>•</span>
            <span>Use WASD or arrow keys to step</span>
          </div>
        )}
      </div>

      {/* Top Right Quick Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
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
                  currentHotspot === h.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{h.icon}</span>
                <span className="truncate">{h.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3D Resident Presence Markers (Floating in room space) */}
      {elevationMode !== 'firstperson' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Bed B Tag (You) */}
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

          {/* Praveen M. (Bed A) with Presence tag */}
          <div className="absolute top-[28%] left-[24%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-a')}>
            <div className="bg-white/90 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-slate-200 hover:border-indigo-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>Praveen M. • Deep Work</span>
            </div>
          </div>

          {/* Rohan K. (Bed C) with Presence tag */}
          <div className="absolute top-[64%] left-[32%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-c')}>
            <div className="bg-white/90 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-xs border border-slate-200 hover:border-indigo-400 transition-colors flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Rohan K. • At Zoho Office</span>
            </div>
          </div>

          {/* Bed D Open Tag */}
          <div className="absolute top-[24%] left-[48%] -translate-x-1/2 pointer-events-auto cursor-pointer" onClick={() => onSelectPod('bed-d')}>
            <div className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs border border-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1">
              <span>+ CLAIM FOR FRIEND</span>
            </div>
          </div>

          {/* Sunrise Balcony Tag */}
          <div className="absolute top-[16%] right-[28%] text-amber-600 font-extrabold text-[10px] tracking-wider uppercase">
            SUNRISE BALCONY
          </div>

          {/* Smart Access Portal Tag */}
          <div className="absolute bottom-[24%] left-[22%] text-slate-500 font-bold text-[10px] tracking-wider uppercase">
            SMART ACCESS PORTAL
          </div>
        </div>
      )}

      {/* Hydraulic Bed Lift Quick Action floating button in Storage Layer */}
      {activeLayer === 'storage' && (
        <div className="absolute top-16 left-4 bg-white/95 p-2 rounded-xl border border-indigo-200 shadow-md">
          <button
            onClick={() =>
              onUpdateCustomization({ hydraulicBedLifted: !bedCustomization.hydraulicBedLifted })
            }
            className={`px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer ${
              bedCustomization.hydraulicBedLifted
                ? 'bg-indigo-600 text-white'
                : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
            }`}
          >
            <span>{bedCustomization.hydraulicBedLifted ? 'Close Storage Bed' : 'Lift Hydraulic Storage Bed (450L)'}</span>
          </button>
        </div>
      )}

      {/* Daylight Simulator & Time-of-Day Bar (Bottom Center) */}
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

      {/* Bottom Legend and Indoor Air Quality Bar */}
      <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-xs bg-white/90 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-4 text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600" />
            <span>Harish (You)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-300" />
            <span>Occupied Pods</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm border border-dashed border-emerald-500 bg-emerald-50" />
            <span>Bed D Free</span>
          </div>
          <div className="flex items-center gap-1.5 hidden sm:flex">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Power Pod</span>
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
