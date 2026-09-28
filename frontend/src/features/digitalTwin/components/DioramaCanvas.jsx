import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { Eye, AlertTriangle } from 'lucide-react';

export default function DioramaCanvas({
  scenario,
  params,
  simTime,
  maxTime = 14400,
  isBreached,
  onTriggerBreach,
  settlements = []
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animFrameRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());

  // Dynamic references for meshes updated in animation loop
  const normalWaterRef = useRef(null);
  const reservoirWaterRef = useRef(null);
  const floodSurgeRef = useRef(null);
  const foamParticlesRef = useRef(null);
  const breachDebrisRef = useRef(null);
  const damBreachMeshRef = useRef(null);
  const spillwayGatesRef = useRef([]);

  // Active camera preset
  const [activeCam, setActiveCam] = useState('iso');
  // 2D screen projected labels
  const [screenLabels, setScreenLabels] = useState([]);

  // Camera Presets
  const cameraPresets = useMemo(() => ({
    iso: { pos: new THREE.Vector3(160, 150, 190), target: new THREE.Vector3(0, 10, 0) },
    dam: { pos: new THREE.Vector3(0, 45, -55), target: new THREE.Vector3(0, 24, -110) },
    valley: { pos: new THREE.Vector3(90, 85, 30), target: new THREE.Vector3(0, 12, 10) },
    villages: { pos: new THREE.Vector3(-70, 75, 120), target: new THREE.Vector3(10, 10, 80) },
    top: { pos: new THREE.Vector3(0, 270, 5), target: new THREE.Vector3(0, 0, 0) }
  }), []);

  // Compute wave progress (0.0 to 1.0)
  const waveProgress = Math.min(1.0, Math.max(0, simTime / maxTime));

  const settlementsRef = useRef(settlements);
  useEffect(() => {
    settlementsRef.current = settlements;
  }, [settlements]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#070b16');
    scene.fog = new THREE.FogExp2('#070b16', 0.0022);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.copy(cameraPresets.iso.pos);
    camera.lookAt(cameraPresets.iso.target);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight('#a5b4fc', 0.45);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.4);
    sunLight.position.set(140, 180, -90);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -160;
    sunLight.shadow.camera.right = 160;
    sunLight.shadow.camera.top = 180;
    sunLight.shadow.camera.bottom = -180;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    const blueFill = new THREE.DirectionalLight('#38bdf8', 0.5);
    blueFill.position.set(-120, 60, 100);
    scene.add(blueFill);

    // 5. Terrain Diorama Mesh
    const terrainGroup = buildDioramaTerrain();
    scene.add(terrainGroup);

    // 6. Concrete Dam with Spillway Gates & Pier
    const damGroup = buildDamStructure();
    scene.add(damGroup);

    // 7. Reservoir Upstream Water Plane
    const resWater = buildReservoirWater();
    scene.add(resWater);
    reservoirWaterRef.current = resWater;

    // 8. Normal Riverbed Water
    const normalWater = buildNormalRiverWater();
    scene.add(normalWater);
    normalWaterRef.current = normalWater;

    // 9. Dynamic Flood Surge Mesh (Breach Wave)
    const floodSurge = buildFloodSurgeMesh();
    scene.add(floodSurge);
    floodSurgeRef.current = floodSurge;

    // 10. Whitewater Foam & Spray Particle System
    const foamParticles = buildFoamParticles();
    scene.add(foamParticles);
    foamParticlesRef.current = foamParticles;

    // 11. Settlements & Vegetation
    const settlementGroup = buildSettlementsAndVegetation();
    scene.add(settlementGroup);

    // 12. Diorama Base Plinth / Geological Slice
    const plinth = buildDioramaPlinth();
    scene.add(plinth);

    // Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Mouse Interaction for Camera Orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let spherical = {
      radius: 280,
      theta: 0.8,
      phi: 1.05,
      target: new THREE.Vector3(0, 10, 0)
    };

    const updateCameraFromSpherical = () => {
      spherical.phi = Math.max(0.1, Math.min(Math.PI / 2.1, spherical.phi));
      spherical.radius = Math.max(40, Math.min(500, spherical.radius));
      const x = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta) + spherical.target.x;
      const y = spherical.radius * Math.cos(spherical.phi) + spherical.target.y;
      const z = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta) + spherical.target.z;
      camera.position.set(x, y, z);
      camera.lookAt(spherical.target);
    };

    const onMouseDown = (e) => {
      if (e.target !== renderer.domElement) return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      if (e.buttons === 1) { // Rotate
        spherical.theta -= dx * 0.006;
        spherical.phi -= dy * 0.006;
        updateCameraFromSpherical();
      } else if (e.buttons === 2) { // Pan
        const panSpeed = spherical.radius * 0.001;
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        const right = new THREE.Vector3().crossVectors(camera.up, forward).normalize();
        spherical.target.addScaledVector(right, dx * panSpeed);
        spherical.target.y += dy * panSpeed;
        updateCameraFromSpherical();
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e) => {
      e.preventDefault();
      spherical.radius += e.deltaY * 0.15;
      updateCameraFromSpherical();
    };

    const onContextMenu = (e) => e.preventDefault();

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    renderer.domElement.addEventListener('wheel', onWheel, { passive: false });
    renderer.domElement.addEventListener('contextmenu', onContextMenu);

    controlsRef.current = {
      setPreset: (presetKey) => {
        const targetConfig = cameraPresets[presetKey];
        if (!targetConfig) return;
        spherical.target.copy(targetConfig.target);
        camera.position.copy(targetConfig.pos);
        camera.lookAt(targetConfig.target);
        // recalculate spherical radius, theta, phi
        const diff = new THREE.Vector3().subVectors(targetConfig.pos, targetConfig.target);
        spherical.radius = diff.length();
        spherical.phi = Math.acos(diff.y / spherical.radius);
        spherical.theta = Math.atan2(diff.x, diff.z);
      }
    };

    // Animation Loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();

      // Animate normal river ripples
      if (normalWaterRef.current) {
        const pos = normalWaterRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getZ(i);
          const wave = Math.sin(u * 0.15 + elapsed * 3.5) * 0.35 + Math.cos(v * 0.1 - elapsed * 2.8) * 0.25;
          pos.setY(i, 4 + wave);
        }
        pos.needsUpdate = true;
      }

      // Animate reservoir ripples
      if (reservoirWaterRef.current) {
        const pos = reservoirWaterRef.current.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) {
          const u = pos.getX(i);
          const v = pos.getZ(i);
          const wave = Math.sin(u * 0.08 + elapsed * 1.8) * 0.2 + Math.cos(v * 0.08 + elapsed * 1.2) * 0.2;
          pos.setY(i, 23 + wave);
        }
        pos.needsUpdate = true;
      }

      // Animate foam particles
      if (foamParticlesRef.current) {
        const positions = foamParticlesRef.current.geometry.attributes.position.array;
        const count = positions.length / 3;
        for (let i = 0; i < count; i++) {
          // move downstream along Z
          positions[i * 3 + 2] += 0.8;
          positions[i * 3 + 1] += Math.sin(elapsed * 5 + i) * 0.05;
          if (positions[i * 3 + 2] > 160) {
            positions[i * 3 + 2] = -105 + (Math.random() * 10);
            positions[i * 3] = (Math.random() - 0.5) * 25;
          }
        }
        foamParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Project 3D settlements to 2D screen coordinates
      if (camera && container) {
        const w = container.clientWidth;
        const h = container.clientHeight;
        const labels = (settlementsRef.current || []).map((s) => {
          const v = new THREE.Vector3(s.x, 12, s.z);
          v.project(camera);
          const isBehind = v.z > 1.0;
          return {
            id: s.id,
            name: s.name,
            pop: s.pop,
            x: ((v.x + 1) * w) / 2,
            y: ((-v.y + 1) * h) / 2,
            visible: !isBehind && v.x >= -1.1 && v.x <= 1.1 && v.y >= -1.1 && v.y <= 1.1
          };
        });
        setScreenLabels(labels);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);
    animFrameRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.domElement.removeEventListener('wheel', onWheel);
      renderer.domElement.removeEventListener('contextmenu', onContextMenu);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update dynamic flood surge when simTime / isBreached / params change
  useEffect(() => {
    if (!floodSurgeRef.current) return;

    const floodMesh = floodSurgeRef.current;
    if (!isBreached) {
      floodMesh.visible = false;
      if (damBreachMeshRef.current) {
        damBreachMeshRef.current.position.y = 12; // closed
      }
      return;
    }

    floodMesh.visible = true;

    // Lower breached dam section
    if (damBreachMeshRef.current) {
      damBreachMeshRef.current.position.y = 3; // collapsed
    }

    // Progress along Z: from Dam (Z = -110) to Downstream End (Z = 165)
    const startZ = -110;
    const endZ = 165;
    const currentFrontZ = startZ + waveProgress * (endZ - startZ);
    const peakDepth = Math.min(params.waterLevelM * 0.22, 14);

    const geom = floodMesh.geometry;
    const pos = geom.attributes.position;
    const cols = 40;
    const rows = 60;

    for (let r = 0; r <= rows; r++) {
      const zNorm = r / rows;
      const worldZ = startZ + zNorm * (endZ - startZ);
      const isPastFront = worldZ > currentFrontZ;

      for (let c = 0; c <= cols; c++) {
        const cNorm = (c / cols) - 0.5; // -0.5 to 0.5
        // Lateral spread increases as flood moves downstream
        const valleySpread = 28 + zNorm * 65;
        const worldX = cNorm * valleySpread;
        const index = r * (cols + 1) + c;

        if (isPastFront) {
          pos.setXYZ(index, worldX, -5, worldZ); // submerged below riverbed
        } else {
          // Surge wave shape: highest behind wave front, tapering downstream
          const distFromFront = currentFrontZ - worldZ;
          let surgeHeight = peakDepth * Math.min(1.0, distFromFront / 25);
          // Wave crest foam lip
          if (distFromFront < 10) {
            surgeHeight += 1.8 * Math.sin((distFromFront / 10) * Math.PI);
          }
          pos.setXYZ(index, worldX, 5 + surgeHeight, worldZ);
        }
      }
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, [simTime, isBreached, params, waveProgress]);

  // Handle camera change button click
  const handleSelectCam = (key) => {
    setActiveCam(key);
    if (controlsRef.current) {
      controlsRef.current.setPreset(key);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* 3D WebGL Canvas Mount */}
      <div ref={mountRef} style={{ width: '100%', height: '100%', outline: 'none' }} />

      {/* Floating Camera Presets Bar */}
      <div className="dt-cam-bar">
        <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, padding: '0 6px', textTransform: 'uppercase' }}>
          Views:
        </span>
        <button
          className={`dt-cam-btn ${activeCam === 'iso' ? 'active' : ''}`}
          onClick={() => handleSelectCam('iso')}
        >
          Diorama Iso
        </button>
        <button
          className={`dt-cam-btn ${activeCam === 'dam' ? 'active' : ''}`}
          onClick={() => handleSelectCam('dam')}
        >
          Dam Spillway
        </button>
        <button
          className={`dt-cam-btn ${activeCam === 'valley' ? 'active' : ''}`}
          onClick={() => handleSelectCam('valley')}
        >
          River Valley
        </button>
        <button
          className={`dt-cam-btn ${activeCam === 'villages' ? 'active' : ''}`}
          onClick={() => handleSelectCam('villages')}
        >
          Downstream
        </button>
        <button
          className={`dt-cam-btn ${activeCam === 'top' ? 'active' : ''}`}
          onClick={() => handleSelectCam('top')}
        >
          Top Down
        </button>
      </div>

      {/* Dynamic 2D Settlement Billboard Overlays */}
      {screenLabels.map((lbl) => {
        if (!lbl.visible) return null;
        const isFlooded = isBreached && waveProgress > 0.25;
        return (
          <div
            key={lbl.id}
            style={{
              position: 'absolute',
              left: `${lbl.x}px`,
              top: `${lbl.y}px`,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <div style={{
              background: isFlooded ? 'rgba(239, 68, 68, 0.85)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${isFlooded ? '#ef4444' : '#38bdf8'}`,
              borderRadius: '6px',
              padding: '3px 8px',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              whiteSpace: 'nowrap'
            }}>
              {isFlooded ? <AlertTriangle size={12} color="#fef08a" /> : <Eye size={12} color="#38bdf8" />}
              <span>{lbl.name}</span>
              <span style={{ fontSize: '9px', opacity: 0.8, color: '#bae6fd' }}>({lbl.pop.toLocaleString()} pop)</span>
            </div>
            <div style={{
              width: '2px',
              height: '8px',
              background: isFlooded ? '#ef4444' : '#38bdf8'
            }} />
          </div>
        );
      })}
    </div>
  );

  // Helper: Procedural Diorama Terrain
  function buildDioramaTerrain() {
    const group = new THREE.Group();
    const width = 240;
    const length = 340;
    const segW = 80;
    const segL = 100;

    const geom = new THREE.PlaneGeometry(width, length, segW, segL);
    geom.rotateX(-Math.PI / 2);

    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);

      // Meandering river channel center
      const riverCenter = Math.sin(z * 0.025) * 14 + Math.sin(z * 0.06) * 6;
      const distFromRiver = Math.abs(x - riverCenter);

      let elevation = 0;
      if (z < -110) {
        // Upstream Mountain Reservoir Basin
        const mountainRidge = Math.pow(Math.abs(x) / 75, 2.2) * 55;
        const basinFloor = 8 + Math.cos(x * 0.05) * 4;
        elevation = Math.max(basinFloor, mountainRidge);
      } else {
        // Downstream Valley with Terraces & Mountain Flanks
        const canyonSlope = Math.pow(distFromRiver / 50, 1.8) * 38;
        const rollingHills = Math.sin(x * 0.08) * Math.cos(z * 0.05) * 4;
        // Slope down towards downstream
        const downstreamDescent = (z + 110) * -0.04;
        elevation = Math.max(3, canyonSlope + rollingHills + downstreamDescent);
      }

      pos.setY(i, elevation);
    }
    geom.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      color: '#2e3a23', // Deep natural alpine valley green
      roughness: 0.85,
      metalness: 0.1,
      flatShading: true
    });

    const terrainMesh = new THREE.Mesh(geom, mat);
    terrainMesh.receiveShadow = true;
    terrainMesh.castShadow = true;
    group.add(terrainMesh);

    return group;
  }

  // Helper: Dam Structure with Concrete Piers and Spillway Gates
  function buildDamStructure() {
    const damGroup = new THREE.Group();
    damGroup.position.set(0, 0, -110);

    const concreteMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.65,
      metalness: 0.2
    });

    // 1. Left Abutment Wall
    const leftGeom = new THREE.BoxGeometry(45, 26, 16);
    const leftAbut = new THREE.Mesh(leftGeom, concreteMat);
    leftAbut.position.set(-35, 13, 0);
    leftAbut.castShadow = true;
    leftAbut.receiveShadow = true;
    damGroup.add(leftAbut);

    // 2. Right Abutment Wall
    const rightGeom = new THREE.BoxGeometry(45, 26, 16);
    const rightAbut = new THREE.Mesh(rightGeom, concreteMat);
    rightAbut.position.set(35, 13, 0);
    rightAbut.castShadow = true;
    rightAbut.receiveShadow = true;
    damGroup.add(rightAbut);

    // 3. Central Spillway Piers & Sluice Gates
    const numGates = 4;
    const gateWidth = 5;
    const pierWidth = 2;
    const spillwayStart = -14;

    for (let i = 0; i < numGates; i++) {
      // Concrete Pier
      const pierGeom = new THREE.BoxGeometry(pierWidth, 24, 18);
      const pier = new THREE.Mesh(pierGeom, concreteMat);
      pier.position.set(spillwayStart + i * (gateWidth + pierWidth), 12, 0);
      pier.castShadow = true;
      damGroup.add(pier);

      // Steel Radial Gate (Dark Metallic)
      const gateGeom = new THREE.BoxGeometry(gateWidth, 12, 2);
      const gateMat = new THREE.MeshStandardMaterial({
        color: '#1e293b',
        roughness: 0.4,
        metalness: 0.8
      });
      const gate = new THREE.Mesh(gateGeom, gateMat);
      gate.position.set(spillwayStart + i * (gateWidth + pierWidth) + (gateWidth / 2) + 1, 9, 3);
      gate.castShadow = true;
      damGroup.add(gate);
      spillwayGatesRef.current.push(gate);
    }

    // 4. Central Breach Section (Collapses on breach)
    const breachGeom = new THREE.BoxGeometry(26, 22, 14);
    const breachMat = new THREE.MeshStandardMaterial({
      color: '#64748b',
      roughness: 0.75,
      metalness: 0.2
    });
    const breachMesh = new THREE.Mesh(breachGeom, breachMat);
    breachMesh.position.set(0, 12, 0);
    breachMesh.castShadow = true;
    breachMesh.receiveShadow = true;
    damGroup.add(breachMesh);
    damBreachMeshRef.current = breachMesh;

    // 5. Overhead Crest Roadway & Parapet
    const roadGeom = new THREE.BoxGeometry(110, 2, 8);
    const roadMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.8 });
    const road = new THREE.Mesh(roadGeom, roadMat);
    road.position.set(0, 24, 0);
    road.castShadow = true;
    damGroup.add(road);

    return damGroup;
  }

  // Helper: Upstream Reservoir Water Plane
  function buildReservoirWater() {
    const geom = new THREE.PlaneGeometry(160, 60, 32, 24);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, 23, -145);

    const mat = new THREE.MeshStandardMaterial({
      color: '#0369a1',
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.92
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper: Normal Flowing River Water
  function buildNormalRiverWater() {
    const geom = new THREE.PlaneGeometry(30, 260, 20, 80);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, 4.2, 20);

    const mat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.2,
      metalness: 0.7,
      transparent: true,
      opacity: 0.88
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    return mesh;
  }

  // Helper: Dynamic Breach Flood Surge Mesh
  function buildFloodSurgeMesh() {
    const cols = 40;
    const rows = 60;
    const geom = new THREE.PlaneGeometry(120, 275, cols, rows);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, 5, 27.5);

    const mat = new THREE.MeshStandardMaterial({
      color: '#0ea5e9',
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85
    });

    const mesh = new THREE.Mesh(geom, mat);
    mesh.receiveShadow = true;
    mesh.visible = false;
    return mesh;
  }

  // Helper: Foam & Whitewater Spray Particles
  function buildFoamParticles() {
    const particleCount = 280;
    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 25; // X width
      positions[i * 3 + 1] = 5 + Math.random() * 2;   // Y height
      positions[i * 3 + 2] = -105 + Math.random() * 260; // Z length
    }

    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.PointsMaterial({
      color: '#ffffff',
      size: 1.8,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    return new THREE.Points(geom, mat);
  }

  // Helper: Low-poly 3D Settlements and Forest Groves
  function buildSettlementsAndVegetation() {
    const group = new THREE.Group();

    // 1. Forest Groves (Pine Trees)
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const treeLeavesMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7, flatShading: true });

    const treePositions = [
      [-45, -80], [-55, -60], [-60, -20], [-48, 40], [-65, 90],
      [42, -90], [55, -45], [48, 10], [60, 65], [45, 110],
      [-30, -50], [35, -20], [-25, 70], [38, 130]
    ];

    treePositions.forEach(([tx, tz]) => {
      // Cluster of 3-5 trees
      for (let c = 0; c < 4; c++) {
        const ox = tx + (Math.random() - 0.5) * 16;
        const oz = tz + (Math.random() - 0.5) * 16;
        const treeGroup = new THREE.Group();
        treeGroup.position.set(ox, 10, oz);

        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.5, 3, 5), treeTrunkMat);
        trunk.position.y = 1.5;
        trunk.castShadow = true;
        treeGroup.add(trunk);

        const cone1 = new THREE.Mesh(new THREE.ConeGeometry(2.2, 4.5, 5), treeLeavesMat);
        cone1.position.y = 4.5;
        cone1.castShadow = true;
        treeGroup.add(cone1);

        const cone2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 3.5, 5), treeLeavesMat);
        cone2.position.y = 6.8;
        cone2.castShadow = true;
        treeGroup.add(cone2);

        group.add(treeGroup);
      }
    });

    // 2. Downstream Villages
    const houseWallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7 });
    const houseRoofMat = new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 0.6, flatShading: true });

    settlements.forEach((s) => {
      const vGroup = new THREE.Group();
      vGroup.position.set(s.x, 8, s.z);

      // Cluster of 6 buildings per village
      const houseOffsets = [
        [0, 0], [6, 3], [-5, 4], [8, -4], [-7, -3], [2, 8]
      ];

      houseOffsets.forEach(([hx, hz]) => {
        const wall = new THREE.Mesh(new THREE.BoxGeometry(3.5, 2.5, 4), houseWallMat);
        wall.position.set(hx, 1.25, hz);
        wall.castShadow = true;
        vGroup.add(wall);

        const roof = new THREE.Mesh(new THREE.ConeGeometry(3, 2, 4), houseRoofMat);
        roof.position.set(hx, 3.5, hz);
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        vGroup.add(roof);
      });

      // Village landmark tower
      const tower = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 9, 6), houseWallMat);
      tower.position.set(-2, 4.5, -2);
      tower.castShadow = true;
      vGroup.add(tower);

      const towerCap = new THREE.Mesh(new THREE.ConeGeometry(1.8, 3, 6), houseRoofMat);
      towerCap.position.set(-2, 10, -2);
      vGroup.add(towerCap);

      group.add(vGroup);
    });

    // 3. Safe Ridge Shelters (High Ground)
    const shelterMat = new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.5 });
    const shelterPositions = [
      [-60, -90], [65, -55], [-68, 5], [72, 70]
    ];

    shelterPositions.forEach(([sx, sz]) => {
      const sGroup = new THREE.Group();
      sGroup.position.set(sx, 28, sz);

      // Shelter large ridge tent
      const tent = new THREE.Mesh(new THREE.ConeGeometry(4, 4.5, 4), shelterMat);
      tent.position.y = 2.25;
      tent.castShadow = true;
      sGroup.add(tent);

      // Green Glowing Safety Beacon
      const beaconLight = new THREE.PointLight('#10b981', 1.2, 25);
      beaconLight.position.set(0, 6, 0);
      sGroup.add(beaconLight);

      const beaconSphere = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 8, 8),
        new THREE.MeshBasicMaterial({ color: '#34d399' })
      );
      beaconSphere.position.set(0, 6, 0);
      sGroup.add(beaconSphere);

      group.add(sGroup);
    });

    return group;
  }

  // Helper: Diorama Base Plinth (Geological cross section slab)
  function buildDioramaPlinth() {
    const group = new THREE.Group();
    const plinthMat = new THREE.MeshStandardMaterial({
      color: '#0f172a',
      roughness: 0.9,
      metalness: 0.1
    });

    // Slab Base Box under terrain
    const base = new THREE.Mesh(new THREE.BoxGeometry(242, 18, 342), plinthMat);
    base.position.set(0, -9, 0);
    base.receiveShadow = true;
    group.add(base);

    // Glowing Cyan Trim around diorama rim
    const edgeMat = new THREE.MeshBasicMaterial({ color: '#0284c7' });
    const edgeBox = new THREE.BoxGeometry(243, 0.6, 343);
    const edge = new THREE.Mesh(edgeBox, edgeMat);
    edge.position.set(0, 0, 0);
    group.add(edge);

    return group;
  }
}
