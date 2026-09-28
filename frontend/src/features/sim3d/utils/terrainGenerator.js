import * as THREE from 'three';

// Procedural valley height calculation
export function getValleyElevation(x, z) {
  // Upstream reservoir lake behind dam (z < -140)
  if (z < -140) {
    const lakeBed = 3.5 + Math.sin(x * 0.05) * 0.8;
    const sideWall = Math.pow(Math.abs(x) / 38, 2.2) * 22;
    return lakeBed + sideWall;
  }

  // Dam crest at z around -140
  if (z >= -142 && z <= -138) {
    // Breach gap near center (x between -12 and 12)
    const isBreachZone = Math.abs(x) < 14;
    if (isBreachZone) {
      return 4.2 + (Math.abs(x) / 14) * 2.5; // breached opening
    }
    const damCrest = 16.5;
    const wingWall = Math.pow(Math.abs(x) / 45, 2) * 12;
    return damCrest + wingWall;
  }

  // Downstream meandering river channel
  const riverCenterX = Math.sin(z * 0.022) * 20 + Math.sin(z * 0.06) * 5;
  const distFromRiver = Math.abs(x - riverCenterX);

  // Riverbed depression
  let channelDepth;
  if (distFromRiver < 12) {
    channelDepth = 3.0 + Math.pow(distFromRiver / 12, 1.8) * 2.5;
  } else if (distFromRiver < 42) {
    // Floodplain
    channelDepth = 5.5 + Math.pow((distFromRiver - 12) / 30, 1.4) * 5.0;
  } else {
    // Mountain ridges on sides
    const mountainRise = Math.pow((distFromRiver - 42) / 35, 1.9) * 26;
    const noise = Math.sin(x * 0.15) * Math.cos(z * 0.12) * 3.5 + Math.sin(z * 0.08) * 2.0;
    channelDepth = 10.5 + mountainRise + noise;
  }

  // Gentle downstream slope from z = -140 (elevation drops ~3.5m over 300 units)
  const gradient = (1 - (z + 140) / 340) * 2.5;
  return channelDepth + gradient;
}

// Build optimized terrain mesh (200x200 grid for fast 60fps rendering)
export function createValleyTerrainMesh() {
  const width = 220;
  const depth = 340;
  const segX = 180;
  const segZ = 220;

  const geometry = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geometry.rotateX(-Math.PI / 2); // Lay flat on XZ plane

  const posAttr = geometry.attributes.position;
  const vertexCount = posAttr.count;
  const colors = new Float32Array(vertexCount * 3);

  // Stylised low-poly terrain color palette (Light Theme compliant)
  const riverbedColor = new THREE.Color('#94a3b8');   // Wet river silt slate
  const floodplainColor = new THREE.Color('#86efac'); // Gentle floodplain meadow green
  const hillGrassColor = new THREE.Color('#4ade80');  // Lush terrace slope green
  const rockySlopeColor = new THREE.Color('#cbd5e1'); // High rock ridge grey
  const peakSnowColor = new THREE.Color('#f1f5f9');   // Summit limestone off-white

  const tempColor = new THREE.Color();

  for (let i = 0; i < vertexCount; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    const y = getValleyElevation(x, z);
    posAttr.setY(i, y);

    // Vertex coloring based on elevation and distance from river
    if (y < 4.8) {
      tempColor.copy(riverbedColor);
    } else if (y < 8.5) {
      const alpha = (y - 4.8) / 3.7;
      tempColor.copy(riverbedColor).lerp(floodplainColor, alpha);
    } else if (y < 16.0) {
      const alpha = (y - 8.5) / 7.5;
      tempColor.copy(floodplainColor).lerp(hillGrassColor, alpha);
    } else if (y < 26.0) {
      const alpha = (y - 16.0) / 10.0;
      tempColor.copy(hillGrassColor).lerp(rockySlopeColor, alpha);
    } else {
      const alpha = Math.min(1.0, (y - 26.0) / 12.0);
      tempColor.copy(rockySlopeColor).lerp(peakSnowColor, alpha);
    }

    colors[i * 3] = tempColor.r;
    colors[i * 3 + 1] = tempColor.g;
    colors[i * 3 + 2] = tempColor.b;
  }

  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.85,
    metalness: 0.05,
    flatShading: true
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.receiveShadow = true;
  mesh.castShadow = false;

  return mesh;
}

// Procedural Dam & Breach Embankment Structure
export function createDamStructureMesh() {
  const group = new THREE.Group();

  // Concrete Dam Body (2 Wings left & right of breach)
  const damMaterial = new THREE.MeshStandardMaterial({
    color: '#94a3b8',
    roughness: 0.6,
    metalness: 0.15,
    flatShading: true
  });

  // Left wing (x: -45 to -12)
  const leftGeom = new THREE.BoxGeometry(32, 14, 8);
  const leftWing = new THREE.Mesh(leftGeom, damMaterial);
  leftWing.position.set(-28, 10, -140);
  leftWing.castShadow = true;
  leftWing.receiveShadow = true;
  group.add(leftWing);

  // Right wing (x: 12 to 45)
  const rightGeom = new THREE.BoxGeometry(32, 14, 8);
  const rightWing = new THREE.Mesh(rightGeom, damMaterial);
  rightWing.position.set(28, 10, -140);
  rightWing.castShadow = true;
  rightWing.receiveShadow = true;
  group.add(rightWing);

  // Crest Roadway railing / roadway
  const roadMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.9 });
  const roadL = new THREE.Mesh(new THREE.BoxGeometry(32, 0.6, 9), roadMat);
  roadL.position.set(-28, 17.3, -140);
  group.add(roadL);

  const roadR = new THREE.Mesh(new THREE.BoxGeometry(32, 0.6, 9), roadMat);
  roadR.position.set(28, 17.3, -140);
  group.add(roadR);

  // Breached concrete erosion rubble blocks
  const rubbleMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.95 });
  for (let i = 0; i < 7; i++) {
    const rubble = new THREE.Mesh(
      new THREE.DodecahedronGeometry(1.4 + Math.random() * 0.8),
      rubbleMat
    );
    rubble.position.set(
      (Math.random() - 0.5) * 22,
      4.0 + Math.random() * 1.5,
      -138 + Math.random() * 6
    );
    rubble.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(rubble);
  }

  return group;
}
