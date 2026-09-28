// Precomputed and parametric simulation data for 3D Scientific Simulation View
export const SCENARIOS_3D = [
  {
    id: 'kosi-breach',
    name: 'Kosi - Embankment Breach',
    river: 'Kosi River (Eastern Embankment, Kushaha)',
    type: 'Embankment Failure / SPH Hydrodynamic Near-Field',
    defaultParams: {
      breachWidthM: 180,
      formationTimeMin: 45,
      waterLevelM: 42,
      peakDischargeM3s: 18500
    },
    durationHours: 12,
    baseExtentKm2: 142.5,
    baseMaxDepthM: 7.8,
    basePeakVelocityMs: 5.6,
    damPosition: { x: 0, z: -140 },
    // Time-stepped front progress in normalized valley units (0 to 280)
    timeSteps: [
      { hour: 0, timeSec: 0, frontZ: -140, extentKm2: 0, maxDepthM: 0, avgVelMs: 0, villagesAffected: 0, popAtRisk: 0 },
      { hour: 0.5, timeSec: 1800, frontZ: -110, extentKm2: 12.4, maxDepthM: 4.2, avgVelMs: 4.8, villagesAffected: 1, popAtRisk: 3400 },
      { hour: 1, timeSec: 3600, frontZ: -80, extentKm2: 28.6, maxDepthM: 6.5, avgVelMs: 5.2, villagesAffected: 2, popAtRisk: 8200 },
      { hour: 2, timeSec: 7200, frontZ: -30, extentKm2: 54.1, maxDepthM: 7.8, avgVelMs: 4.6, villagesAffected: 3, popAtRisk: 15600 },
      { hour: 4, timeSec: 14400, frontZ: 30, extentKm2: 89.3, maxDepthM: 6.9, avgVelMs: 3.8, villagesAffected: 4, popAtRisk: 24800 },
      { hour: 6, timeSec: 21600, frontZ: 85, extentKm2: 114.7, maxDepthM: 5.8, avgVelMs: 3.1, villagesAffected: 5, popAtRisk: 33500 },
      { hour: 8, timeSec: 28800, frontZ: 130, extentKm2: 131.2, maxDepthM: 4.9, avgVelMs: 2.4, villagesAffected: 6, popAtRisk: 41200 },
      { hour: 12, timeSec: 43200, frontZ: 180, extentKm2: 148.6, maxDepthM: 4.2, avgVelMs: 1.8, villagesAffected: 7, popAtRisk: 48900 }
    ]
  },
  {
    id: 'kosi-controlled',
    name: 'Kosi - Controlled Release',
    river: 'Kosi Barrage (56 Sluice Gates Operation)',
    type: 'Emergency Spillway Discharge / Delft3D-FM Flexible Mesh',
    defaultParams: {
      breachWidthM: 120,
      formationTimeMin: 90,
      waterLevelM: 35,
      peakDischargeM3s: 11200
    },
    durationHours: 12,
    baseExtentKm2: 78.4,
    baseMaxDepthM: 4.6,
    basePeakVelocityMs: 3.4,
    damPosition: { x: 0, z: -140 },
    timeSteps: [
      { hour: 0, timeSec: 0, frontZ: -140, extentKm2: 0, maxDepthM: 0, avgVelMs: 0, villagesAffected: 0, popAtRisk: 0 },
      { hour: 0.5, timeSec: 1800, frontZ: -120, extentKm2: 5.2, maxDepthM: 2.1, avgVelMs: 2.8, villagesAffected: 0, popAtRisk: 0 },
      { hour: 1, timeSec: 3600, frontZ: -95, extentKm2: 14.8, maxDepthM: 3.4, avgVelMs: 3.2, villagesAffected: 1, popAtRisk: 3400 },
      { hour: 2, timeSec: 7200, frontZ: -55, extentKm2: 32.1, maxDepthM: 4.6, avgVelMs: 3.4, villagesAffected: 2, popAtRisk: 8200 },
      { hour: 4, timeSec: 14400, frontZ: 0, extentKm2: 52.6, maxDepthM: 4.2, avgVelMs: 2.9, villagesAffected: 3, popAtRisk: 15600 },
      { hour: 6, timeSec: 21600, frontZ: 50, extentKm2: 66.8, maxDepthM: 3.7, avgVelMs: 2.4, villagesAffected: 4, popAtRisk: 24800 },
      { hour: 8, timeSec: 28800, frontZ: 95, extentKm2: 74.5, maxDepthM: 3.2, avgVelMs: 1.9, villagesAffected: 4, popAtRisk: 24800 },
      { hour: 12, timeSec: 43200, frontZ: 145, extentKm2: 81.3, maxDepthM: 2.8, avgVelMs: 1.4, villagesAffected: 5, popAtRisk: 33500 }
    ]
  },
  {
    id: 'south-lhonak-glof',
    name: 'South Lhonak - GLOF',
    river: 'Teesta River Basin (Moraine Dam Outburst)',
    type: 'Glacial Lake Outburst / SPH-Delft3D Hybrid Surge',
    defaultParams: {
      breachWidthM: 240,
      formationTimeMin: 25,
      waterLevelM: 65,
      peakDischargeM3s: 24800
    },
    durationHours: 12,
    baseExtentKm2: 186.2,
    baseMaxDepthM: 14.2,
    basePeakVelocityMs: 8.9,
    damPosition: { x: 0, z: -140 },
    timeSteps: [
      { hour: 0, timeSec: 0, frontZ: -140, extentKm2: 0, maxDepthM: 0, avgVelMs: 0, villagesAffected: 0, popAtRisk: 0 },
      { hour: 0.5, timeSec: 1800, frontZ: -95, extentKm2: 22.1, maxDepthM: 12.4, avgVelMs: 8.6, villagesAffected: 2, popAtRisk: 7800 },
      { hour: 1, timeSec: 3600, frontZ: -55, extentKm2: 49.8, maxDepthM: 14.2, avgVelMs: 7.9, villagesAffected: 3, popAtRisk: 17200 },
      { hour: 2, timeSec: 7200, frontZ: 5, extentKm2: 88.4, maxDepthM: 11.8, avgVelMs: 6.4, villagesAffected: 5, popAtRisk: 32400 },
      { hour: 4, timeSec: 14400, frontZ: 70, extentKm2: 134.2, maxDepthM: 9.3, avgVelMs: 5.1, villagesAffected: 6, popAtRisk: 42100 },
      { hour: 6, timeSec: 21600, frontZ: 120, extentKm2: 158.7, maxDepthM: 7.4, avgVelMs: 3.9, villagesAffected: 7, popAtRisk: 51800 },
      { hour: 8, timeSec: 28800, frontZ: 155, extentKm2: 174.5, maxDepthM: 5.8, avgVelMs: 2.8, villagesAffected: 7, popAtRisk: 51800 },
      { hour: 12, timeSec: 43200, frontZ: 195, extentKm2: 191.0, maxDepthM: 4.9, avgVelMs: 2.1, villagesAffected: 7, popAtRisk: 51800 }
    ]
  }
];
