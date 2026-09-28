import * as THREE from 'three';
import { getValleyElevation } from './terrainGenerator';

// Recursive disposal utility to prevent WebGL memory leaks
export function disposeSceneResources(scene) {
  if (!scene) return;

  scene.traverse((obj) => {
    if (obj.geometry) {
      obj.geometry.dispose();
    }
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach((mat) => disposeMaterial(mat));
      } else {
        disposeMaterial(obj.material);
      }
    }
  });
}

function disposeMaterial(mat) {
  if (!mat) return;
  // Dispose all potential texture maps
  ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'alphaMap'].forEach((prop) => {
    if (mat[prop] && typeof mat[prop].dispose === 'function') {
      mat[prop].dispose();
    }
  });
  mat.dispose();
}

// Low-poly Instanced Forest on Valley Hillsides
export function createInstancedVegetation(count = 220) {
  const group = new THREE.Group();

  // Cone tree canopy geometry & cylinder trunk
  const trunkGeom = new THREE.CylinderGeometry(0.2, 0.35, 1.8, 5);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9, flatShading: true });
  const trunkMesh = new THREE.InstancedMesh(trunkGeom, trunkMat, count);

  const foliageGeom = new THREE.ConeGeometry(1.6, 3.8, 5);
  const foliageMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.8, flatShading: true });
  const foliageMesh = new THREE.InstancedMesh(foliageGeom, foliageMat, count);

  const dummy = new THREE.Object3D();
  const treeColors = [new THREE.Color('#166534'), new THREE.Color('#15803d'), new THREE.Color('#14532d'), new THREE.Color('#22c55e')];

  let placed = 0;
  for (let i = 0; i < count * 2 && placed < count; i++) {
    // Distribute along slopes away from river channel
    const xSign = Math.random() > 0.5 ? 1 : -1;
    const x = xSign * (22 + Math.random() * 65);
    const z = -135 + Math.random() * 300;

    const y = getValleyElevation(x, z);
    if (y < 8.0 || y > 32.0) continue; // Only on slopes, not in river and not on peaks

    const scale = 0.7 + Math.random() * 0.6;

    // Trunk
    dummy.position.set(x, y + 0.9 * scale, z);
    dummy.scale.set(scale, scale, scale);
    dummy.rotation.y = Math.random() * Math.PI;
    dummy.updateMatrix();
    trunkMesh.setMatrixAt(placed, dummy.matrix);

    // Foliage
    dummy.position.set(x, y + (1.8 + 1.9) * scale, z);
    dummy.updateMatrix();
    foliageMesh.setMatrixAt(placed, dummy.matrix);

    // Subtle shade variation
    const pick = treeColors[Math.floor(Math.random() * treeColors.length)];
    foliageMesh.setColorAt(placed, pick);

    placed++;
  }

  trunkMesh.instanceMatrix.needsUpdate = true;
  foliageMesh.instanceMatrix.needsUpdate = true;
  if (foliageMesh.instanceColor) foliageMesh.instanceColor.needsUpdate = true;

  group.add(trunkMesh);
  group.add(foliageMesh);
  return group;
}

// Low-poly village clusters, bridges, and shelters
export function createInfrastructure3DMeshes(infrastructureList) {
  const group = new THREE.Group();

  // Materials
  const houseWallMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.7, flatShading: true });
  const houseRoofMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.6, flatShading: true });
  const bridgeMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.5, metalness: 0.3, flatShading: true });
  const shelterTentMat = new THREE.MeshStandardMaterial({ color: '#059669', roughness: 0.4, flatShading: true });

  infrastructureList.forEach((item) => {
    const nodeGroup = new THREE.Group();
    nodeGroup.name = `node-${item.id}`;
    nodeGroup.position.set(item.position.x, item.position.y, item.position.z);

    if (item.type === 'village') {
      // Cluster of 5 small houses
      for (let h = 0; h < 5; h++) {
        const hGroup = new THREE.Group();
        const ox = ((h % 3) - 1) * 3.5 + (Math.random() - 0.5) * 1.5;
        const oz = Math.floor(h / 3) * 4.0 + (Math.random() - 0.5) * 1.5;

        // Base box
        const wall = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 2.4), houseWallMat);
        wall.position.y = 1.1;
        hGroup.add(wall);

        // Roof
        const roof = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.4, 4), houseRoofMat);
        roof.position.y = 2.2 + 0.7;
        roof.rotation.y = Math.PI / 4;
        hGroup.add(roof);

        hGroup.position.set(ox, 0, oz);
        nodeGroup.add(hGroup);
      }
    } else if (item.type === 'bridge') {
      // Concrete viaduct span across valley
      const deck = new THREE.Mesh(new THREE.BoxGeometry(38, 1.2, 5.0), bridgeMat);
      deck.position.y = 1.5;
      nodeGroup.add(deck);

      // Pillars
      const pillar1 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 6, 8), bridgeMat);
      pillar1.position.set(-10, -1.5, 0);
      nodeGroup.add(pillar1);

      const pillar2 = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.5, 6, 8), bridgeMat);
      pillar2.position.set(10, -1.5, 0);
      nodeGroup.add(pillar2);
    } else if (item.type === 'shelter') {
      // Relief barracks & emergency dome tents
      for (let t = 0; t < 3; t++) {
        const ox = (t - 1) * 4.5;
        const tent = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 2.6, 2.8, 6), shelterTentMat);
        tent.position.set(ox, 1.4, 0);
        nodeGroup.add(tent);
      }
      // Flagpole
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 6.5), bridgeMat);
      pole.position.set(0, 3.25, 4);
      nodeGroup.add(pole);
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide }));
      flag.position.set(0.9, 5.8, 4);
      nodeGroup.add(flag);
    }

    group.add(nodeGroup);
  });

  return group;
}

// Glowing evacuation routes connecting low villages to high-ground shelters
export function createEvacuationRouteLines(infrastructureList) {
  const group = new THREE.Group();
  group.name = 'evacuation-routes-group';

  const shelterMap = {};
  infrastructureList.forEach((item) => {
    if (item.type === 'shelter') shelterMap[item.id] = item;
  });

  const lineMat = new THREE.LineDashedMaterial({
    color: '#059669',
    linewidth: 3,
    scale: 1,
    dashSize: 3,
    gapSize: 2,
    transparent: true,
    opacity: 0.95
  });

  infrastructureList.forEach((item) => {
    if (item.type === 'village' && item.associatedShelterId && shelterMap[item.associatedShelterId]) {
      const target = shelterMap[item.associatedShelterId];

      const p1 = new THREE.Vector3(item.position.x, item.position.y + 2.0, item.position.z);
      const p3 = new THREE.Vector3(target.position.x, target.position.y + 2.5, target.position.z);

      // Arc through midpoint elevated above terrain
      const midX = (p1.x + p3.x) / 2;
      const midZ = (p1.z + p3.z) / 2;
      const terrainMidY = getValleyElevation(midX, midZ);
      const p2 = new THREE.Vector3(midX, Math.max(terrainMidY + 3.0, (p1.y + p3.y) / 2 + 5.0), midZ);

      const curve = new THREE.QuadraticBezierCurve3(p1, p2, p3);
      const points = curve.getPoints(24);
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      const line = new THREE.Line(geom, lineMat);
      line.computeLineDistances();
      group.add(line);
    }
  });

  return group;
}

// Camera Preset Configurations
export const CAMERA_PRESETS = {
  perspective: {
    position: new THREE.Vector3(0, 75, -210),
    target: new THREE.Vector3(0, 10, -20)
  },
  top: {
    position: new THREE.Vector3(0, 220, 10),
    target: new THREE.Vector3(0, 0, 10)
  },
  dam: {
    position: new THREE.Vector3(28, 25, -175),
    target: new THREE.Vector3(0, 8, -135)
  },
  reset: {
    position: new THREE.Vector3(0, 75, -210),
    target: new THREE.Vector3(0, 10, -20)
  }
};
