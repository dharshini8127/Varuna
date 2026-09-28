import * as THREE from 'three';
import { getValleyElevation } from './terrainGenerator';

// Interpolate time step metrics for a given scenario and simulation time (in seconds)
export function getInterpolatedSimulationState(scenario, currentSec, params) {
  const steps = scenario.timeSteps;
  if (!steps || steps.length === 0) return null;

  // Compute parametric scale multiplier based on sliders
  const ref = scenario.defaultParams;
  const qRatio = params.peakDischargeM3s / ref.peakDischargeM3s;
  const hRatio = params.waterLevelM / ref.waterLevelM;
  const wRatio = params.breachWidthM / ref.breachWidthM;
  const tRatio = ref.formationTimeMin / Math.max(10, params.formationTimeMin);

  // Combined physical scaling factor (Froehlich/Delft parametric proxy)
  const scale = Math.max(0.4, Math.min(2.5, Math.pow(qRatio * 0.5 + hRatio * 0.3 + wRatio * 0.2, 0.85) * Math.pow(tRatio, 0.25)));

  // Clamp time
  const clampedSec = Math.max(0, Math.min(43200, currentSec));

  // Find surrounding time steps
  let prev = steps[0];
  let next = steps[steps.length - 1];

  for (let i = 0; i < steps.length - 1; i++) {
    if (clampedSec >= steps[i].timeSec && clampedSec <= steps[i + 1].timeSec) {
      prev = steps[i];
      next = steps[i + 1];
      break;
    }
  }

  const span = next.timeSec - prev.timeSec;
  const alpha = span === 0 ? 0 : (clampedSec - prev.timeSec) / span;

  // Interpolated raw values
  const rawFrontZ = prev.frontZ + (next.frontZ - prev.frontZ) * alpha;
  const rawExtent = prev.extentKm2 + (next.extentKm2 - prev.extentKm2) * alpha;
  const rawMaxDepth = prev.maxDepthM + (next.maxDepthM - prev.maxDepthM) * alpha;
  const rawVel = prev.avgVelMs + (next.avgVelMs - prev.avgVelMs) * alpha;

  // Apply slider scaling
  // Front reaches slightly further with higher discharge
  const frontBonusZ = (scale - 1.0) * 22;
  const frontZ = Math.min(195, rawFrontZ + (clampedSec > 100 ? frontBonusZ : 0));
  const extentKm2 = +(rawExtent * Math.pow(scale, 0.75)).toFixed(1);
  const maxDepthM = +(rawMaxDepth * Math.pow(scale, 0.65)).toFixed(1);
  const peakVelocityMs = +(rawVel * Math.pow(scale, 0.5)).toFixed(1);

  return {
    currentSec: clampedSec,
    frontZ,
    extentKm2,
    maxDepthM,
    peakVelocityMs,
    scale
  };
}

// Compute live status for each infrastructure item at current frontZ & simulation time
export function computeInfrastructureStatuses(infrastructureList, simState, currentSec) {
  const { frontZ, scale } = simState;

  return infrastructureList.map((item) => {
    // Effective scaled arrival time
    const adjustedArrivalSec = Math.max(300, Math.round(item.baseArrivalTimeSec / Math.pow(scale, 0.6)));

    let status = 'SAFE';
    let label = `ETA ${formatSecondsToHHMM(adjustedArrivalSec)}`;

    // Distance in Z from current flood wave front
    const zDist = item.position.z - frontZ;

    if (currentSec >= adjustedArrivalSec || zDist <= 0) {
      status = item.isHighGround ? 'SAFE' : 'FLOODED';
      label = item.isHighGround ? 'High Ground (Safe)' : `Flooded at T+${formatSecondsToHHMM(adjustedArrivalSec)}`;
    } else if (zDist < 35 || (adjustedArrivalSec - currentSec) < 2700) {
      // Within 45 min or 35 units of wave front
      status = item.isHighGround ? 'SAFE' : 'AT RISK';
      const remainingMin = Math.max(1, Math.round((adjustedArrivalSec - currentSec) / 60));
      label = item.isHighGround ? 'Relief Camp Ready' : `Wave ETA: ${remainingMin}m`;
    }

    return {
      ...item,
      status,
      displayLabel: label,
      scaledArrivalSec: adjustedArrivalSec
    };
  });
}

// Format seconds into HH:MM:SS
export function formatSecondsToHHMMSS(totalSec) {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = Math.floor(totalSec % 60);
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

// Format seconds into HH:MM
export function formatSecondsToHHMM(totalSec) {
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const pad = (n) => (n < 10 ? `0${n}` : n);
  return `${pad(hrs)}h ${pad(mins)}m`;
}

// Create the dynamic flood water mesh that flows down the valley
export function createDynamicWaterMesh() {
  const width = 140;
  const depth = 340;
  const segX = 100;
  const segZ = 160;

  const geometry = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geometry.rotateX(-Math.PI / 2);

  const vertexCount = geometry.attributes.position.count;
  const colors = new Float32Array(vertexCount * 3);
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  // Custom transparent material supporting vertex colors and depth fading
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.88,
    roughness: 0.15,
    metalness: 0.25,
    flatShading: false,
    side: THREE.DoubleSide,
    depthWrite: false
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.renderOrder = 2; // Render after terrain
  return mesh;
}

// Update water vertices and colors based on flood front Z, mode, and time elapsed
export function updateWaterMeshGeometry(waterMesh, simState, layerMode, elapsedRealSeconds) {
  if (!waterMesh) return;

  const { frontZ, maxDepthM, peakVelocityMs, scale } = simState;
  const posAttr = waterMesh.geometry.attributes.position;
  const colorAttr = waterMesh.geometry.attributes.color;
  const count = posAttr.count;

  // Layer Color Palettes
  // 1. Realistic Water
  const cRealistic = new THREE.Color('#38bdf8');
  const cDeepRealistic = new THREE.Color('#0284c7');

  // 2. Water Depth (<1m Cyan, 1-3m Blue, 3-5m Navy, >5m Crimson)
  const cDepthShallow = new THREE.Color('#22d3ee');
  const cDepthMid = new THREE.Color('#3b82f6');
  const cDepthDeep = new THREE.Color('#1d4ed8');
  const cDepthExtreme = new THREE.Color('#be123c');

  // 3. Flow Velocity (0-1m/s Turquoise, 1-2m/s Emerald, 2-4m/s Amber, >4m/s Rose)
  const cVelLow = new THREE.Color('#06b6d4');
  const cVelMid = new THREE.Color('#10b981');
  const cVelFast = new THREE.Color('#f59e0b');
  const cVelTorrent = new THREE.Color('#e11d48');

  // 4. Arrival Time (Early Purple/Indigo -> Mid Sky -> Late Amber)
  const cArrEarly = new THREE.Color('#7c3aed');
  const cArrMid = new THREE.Color('#0284c7');
  const cArrLate = new THREE.Color('#f59e0b');

  const tempColor = new THREE.Color();
  const flowWave = elapsedRealSeconds * 3.5;

  for (let i = 0; i < count; i++) {
    const x = posAttr.getX(i);
    const z = posAttr.getZ(i);

    // River centerline and terrain bed elevation at this point
    const riverCenterX = Math.sin(z * 0.022) * 20 + Math.sin(z * 0.06) * 5;
    const bedY = getValleyElevation(x, z);

    // Has the flood front reached here?
    // Before breach (z < -140) is upstream reservoir pool
    const isUpstream = z < -140;
    const isUnderWave = z <= frontZ;

    if (!isUpstream && !isUnderWave) {
      // Ahead of wave: dry channel
      posAttr.setY(i, bedY - 0.5); // hidden under terrain
      colorAttr.setXYZ(i, 0, 0, 0);
      continue;
    }

    // Distance from wave front (wave profile tapers at the very front tip)
    const distFromTip = frontZ - z;
    const tipTaper = isUpstream ? 1.0 : Math.min(1.0, Math.max(0.05, distFromTip / 16));

    // Dynamic water depth above riverbed
    const distFromCenter = Math.abs(x - riverCenterX);
    const channelProfile = Math.max(0, 1.0 - Math.pow(distFromCenter / 36, 2));

    // Traveling wave ripple disturbance
    const waveRipple = Math.sin(z * 0.25 - flowWave) * Math.cos(x * 0.3) * 0.18;

    const baseDepth = (isUpstream ? 9.5 : (maxDepthM * 0.82)) * tipTaper * channelProfile;
    const waterLevelY = Math.max(bedY - 0.2, bedY + baseDepth + waveRipple);

    posAttr.setY(i, waterLevelY);

    // Color mapping depending on selected visualization mode
    const localDepth = Math.max(0, waterLevelY - bedY);
    const localVel = Math.min(peakVelocityMs, (localDepth / 6.0) * peakVelocityMs + 0.5);

    if (layerMode === 'realistic') {
      const depthRatio = Math.min(1.0, localDepth / 5.0);
      tempColor.copy(cRealistic).lerp(cDeepRealistic, depthRatio);
    } else if (layerMode === 'depth') {
      if (localDepth < 1.0) {
        tempColor.copy(cDepthShallow);
      } else if (localDepth < 3.0) {
        tempColor.copy(cDepthShallow).lerp(cDepthMid, (localDepth - 1.0) / 2.0);
      } else if (localDepth < 5.0) {
        tempColor.copy(cDepthMid).lerp(cDepthDeep, (localDepth - 3.0) / 2.0);
      } else {
        tempColor.copy(cDepthDeep).lerp(cDepthExtreme, Math.min(1.0, (localDepth - 5.0) / 4.0));
      }
    } else if (layerMode === 'velocity') {
      if (localVel < 1.5) {
        tempColor.copy(cVelLow).lerp(cVelMid, localVel / 1.5);
      } else if (localVel < 3.5) {
        tempColor.copy(cVelMid).lerp(cVelFast, (localVel - 1.5) / 2.0);
      } else {
        tempColor.copy(cVelFast).lerp(cVelTorrent, Math.min(1.0, (localVel - 3.5) / 3.0));
      }
    } else if (layerMode === 'arrival') {
      // Isochrone arrival bands
      const zRatio = Math.max(0, Math.min(1.0, (z + 140) / 320));
      if (zRatio < 0.4) {
        tempColor.copy(cArrEarly).lerp(cArrMid, zRatio / 0.4);
      } else {
        tempColor.copy(cArrMid).lerp(cArrLate, (zRatio - 0.4) / 0.6);
      }
    }

    colorAttr.setXYZ(i, tempColor.r, tempColor.g, tempColor.b);
  }

  posAttr.needsUpdate = true;
  colorAttr.needsUpdate = true;
}
