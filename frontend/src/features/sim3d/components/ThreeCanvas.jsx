import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  createValleyTerrainMesh, 
  createDamStructureMesh 
} from '../utils/terrainGenerator';
import { 
  createDynamicWaterMesh, 
  updateWaterMeshGeometry 
} from '../utils/waterSimulation';
import { 
  createInstancedVegetation, 
  createInfrastructure3DMeshes, 
  createEvacuationRouteLines,
  disposeSceneResources,
  CAMERA_PRESETS
} from '../utils/threeHelpers';

export default function ThreeCanvas({
  simState,
  layerMode,
  cameraMode,
  showEvacuationRoutes,
  infrastructureList,
  isRunning
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const waterMeshRef = useRef(null);
  const evacGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Overlay projected 2D coordinates for infrastructure billboard labels
  const [screenLabels, setScreenLabels] = useState([]);

  // Camera Orbit & Pan State
  const orbitRef = useRef({
    isDragging: false,
    dragButton: 0,
    prevX: 0,
    prevY: 0,
    target: new THREE.Vector3(0, 10, -20),
    radius: 220,
    theta: Math.PI / 2,   // Horizontal azimuth
    phi: Math.PI / 3.8,   // Vertical polar angle
    targetPos: null,
    targetLook: null,
    animProgress: 1.0
  });

  // Track elapsed real time for water wave ripples
  const clockRef = useRef(new THREE.Clock());

  // 1. Initialize Three.js Scene, Camera, Renderer, Meshes
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#e2e8f0'); // Atmospheric haze grey-blue
    scene.fog = new THREE.FogExp2('#e2e8f0', 0.0028);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 1500);
    camera.position.copy(CAMERA_PRESETS.perspective.position);
    camera.lookAt(CAMERA_PRESETS.perspective.target);
    cameraRef.current = camera;

    // Renderer (capped at 2x pixel ratio for smooth 60fps on integrated graphics)
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.65);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.25);
    sunLight.position.set(120, 180, -90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 450;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    scene.add(sunLight);

    const hemiLight = new THREE.HemisphereLight('#f8fafc', '#94a3b8', 0.45);
    scene.add(hemiLight);

    // 1. Terrain Mesh
    const terrain = createValleyTerrainMesh();
    scene.add(terrain);

    // 2. Dam & Breach Structure
    const damGroup = createDamStructureMesh();
    scene.add(damGroup);

    // 3. Forest Vegetation (InstancedMesh)
    const forest = createInstancedVegetation(220);
    scene.add(forest);

    // 4. Critical Infrastructure models (villages, bridges, shelters)
    const infraGroup = createInfrastructure3DMeshes(infrastructureList);
    scene.add(infraGroup);

    // 5. Evacuation Routes
    const evacGroup = createEvacuationRouteLines(infrastructureList);
    evacGroup.visible = showEvacuationRoutes;
    scene.add(evacGroup);
    evacGroupRef.current = evacGroup;

    // 6. Dynamic Water Mesh
    const waterMesh = createDynamicWaterMesh();
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Interaction (Orbit / Pan / Zoom)
    const onMouseDown = (e) => {
      orbitRef.current.isDragging = true;
      orbitRef.current.dragButton = e.button;
      orbitRef.current.prevX = e.clientX;
      orbitRef.current.prevY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!orbitRef.current.isDragging || !cameraRef.current) return;
      const dx = e.clientX - orbitRef.current.prevX;
      const dy = e.clientY - orbitRef.current.prevY;
      orbitRef.current.prevX = e.clientX;
      orbitRef.current.prevY = e.clientY;

      if (orbitRef.current.dragButton === 0 && !e.shiftKey) {
        // Orbit rotate
        orbitRef.current.theta -= dx * 0.005;
        orbitRef.current.phi = Math.max(0.12, Math.min(Math.PI / 2 - 0.05, orbitRef.current.phi + dy * 0.005));
        updateCameraFromSpherical();
      } else {
        // Pan
        const panSpeed = orbitRef.current.radius * 0.0018;
        const forward = new THREE.Vector3();
        cameraRef.current.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();

        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

        orbitRef.current.target.addScaledVector(right, -dx * panSpeed);
        orbitRef.current.target.addScaledVector(forward, dy * panSpeed);
        updateCameraFromSpherical();
      }
    };

    const onMouseUp = () => {
      orbitRef.current.isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      orbitRef.current.radius = Math.max(35, Math.min(450, orbitRef.current.radius + e.deltaY * 0.15));
      updateCameraFromSpherical();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });
    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    // Helper to calculate camera XYZ from spherical coordinates
    function updateCameraFromSpherical() {
      if (!cameraRef.current) return;
      const o = orbitRef.current;
      const sinPhi = Math.sin(o.phi);
      cameraRef.current.position.set(
        o.target.x + o.radius * sinPhi * Math.sin(o.theta),
        o.target.y + o.radius * Math.cos(o.phi),
        o.target.z + o.radius * sinPhi * Math.cos(o.theta)
      );
      cameraRef.current.lookAt(o.target);
    }

    // Main 60 FPS Render Loop
    let lastLabelUpdate = 0;
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const elapsed = clockRef.current.getElapsedTime();

      // Smooth Camera Lerp Animation for Presets
      const o = orbitRef.current;
      if (o.animProgress < 1.0 && o.targetPos && o.targetLook) {
        o.animProgress = Math.min(1.0, o.animProgress + 0.04);
        const t = easeOutCubic(o.animProgress);
        camera.position.lerp(o.targetPos, 0.12);
        o.target.lerp(o.targetLook, 0.12);
        camera.lookAt(o.target);
      }

      // Render Three scene
      renderer.render(scene, camera);

      // Throttled 2D billboard label projection (every ~100ms)
      if (elapsed - lastLabelUpdate > 0.08) {
        lastLabelUpdate = elapsed;
        projectScreenLabels(container, camera, infrastructureList);
      }
    };

    animate();

    // Cleanup & Resource Disposal on Unmount
    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);

      disposeSceneResources(scene);
      renderer.dispose();
      if (container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, []);

  // 2. Update Evacuation Routes visibility
  useEffect(() => {
    if (evacGroupRef.current) {
      evacGroupRef.current.visible = showEvacuationRoutes;
    }
  }, [showEvacuationRoutes]);

  // 3. Update Camera Preset or Follow Mode
  useEffect(() => {
    if (!cameraRef.current) return;
    const o = orbitRef.current;

    if (cameraMode === 'follow') {
      // Follow flood wave front dynamically
      const targetZ = Math.min(170, simState.frontZ);
      o.targetLook = new THREE.Vector3(0, 10, targetZ);
      o.targetPos = new THREE.Vector3(0, 55, targetZ - 75);
      o.animProgress = 0.0;
    } else if (CAMERA_PRESETS[cameraMode]) {
      const preset = CAMERA_PRESETS[cameraMode];
      o.targetLook = preset.target.clone();
      o.targetPos = preset.position.clone();
      o.radius = preset.position.distanceTo(preset.target);
      o.animProgress = 0.0;
    }
  }, [cameraMode, simState.frontZ]);

  // 4. Update Water Mesh Surface on state / time step change
  useEffect(() => {
    if (!waterMeshRef.current) return;
    const elapsed = clockRef.current.getElapsedTime();
    updateWaterMeshGeometry(waterMeshRef.current, simState, layerMode, elapsed);
  }, [simState, layerMode, isRunning]);

  // Project 3D node coordinates to 2D screen positions for floating labels
  function projectScreenLabels(container, camera, items) {
    if (!container || !camera) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const projected = items.map((item) => {
      const p = new THREE.Vector3(item.position.x, item.position.y + 7.5, item.position.z);
      p.project(camera);

      // Check if node is in front of camera
      const isVisible = p.z < 1.0 && p.x >= -1.1 && p.x <= 1.1 && p.y >= -1.1 && p.y <= 1.1;
      const screenX = (p.x * 0.5 + 0.5) * w;
      const screenY = (-(p.y * 0.5) + 0.5) * h;

      return {
        id: item.id,
        name: item.name,
        type: item.type,
        status: item.status,
        screenX,
        screenY,
        isVisible
      };
    });

    setScreenLabels(projected.filter((l) => l.isVisible));
  }

  return (
    <div className="sim3d-canvas-container" ref={mountRef}>
      {/* 2D Projected Floating Billboard Labels */}
      {screenLabels.map((lbl) => (
        <div
          key={lbl.id}
          style={{
            position: 'absolute',
            left: `${lbl.screenX}px`,
            top: `${lbl.screenY}px`,
            transform: 'translate(-50%, -100%)',
            pointerEvents: 'none',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'rgba(255, 255, 255, 0.94)',
            border: `1px solid ${lbl.status === 'FLOODED' ? '#e11d48' : lbl.status === 'AT RISK' ? '#d97706' : '#059669'}`,
            padding: '3px 8px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.1)',
            fontSize: '10.5px',
            fontWeight: '600',
            color: '#0f172a',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: lbl.status === 'FLOODED' ? '#e11d48' : lbl.status === 'AT RISK' ? '#d97706' : '#059669'
          }} />
          <span>{lbl.name}</span>
        </div>
      ))}
    </div>
  );
}

function easeOutCubic(x) {
  return 1 - Math.pow(1 - x, 3);
}
