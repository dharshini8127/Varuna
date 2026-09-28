// Digital Twin Simulation Scenarios & Critical Settlements Data
export const DT_SCENARIOS = [
  {
    id: 'kosi-breach',
    name: 'Kosi Embankment Breach',
    river: 'Kosi River (Eastern Afflux Bund)',
    location: 'Kushaha, Nepal-Bihar Border',
    type: 'Earthen Embankment Sudden Failure',
    lakeVolumeM3: 450e6,
    defaultParams: {
      breachWidthM: 180,
      formationTimeMin: 45,
      waterLevelM: 42,
      peakDischargeM3s: 18500
    },
    maxFloodExtentKm2: 154.2,
    maxDepthM: 8.4,
    peakVelocityMs: 5.8,
    totalPopulationExposed: 48900,
    settlements: [
      { id: 'set-1', name: 'Kushaha Village', distKm: 2.5, baseArrivalSec: 1500, pop: 4200, elevationM: 88, x: -16, z: -110, safeShelter: 'Kushaha Ridge Camp' },
      { id: 'set-2', name: 'Bhimnagar Colony', distKm: 6.2, baseArrivalSec: 3300, pop: 8600, elevationM: 84, x: 20, z: -75, safeShelter: 'Bhimnagar High Ground' },
      { id: 'set-3', name: 'Birpur Lowland Subdiv', distKm: 11.5, baseArrivalSec: 6300, pop: 15600, elevationM: 79, x: -25, z: -20, safeShelter: 'Birpur Stadium Plateau' },
      { id: 'set-4', name: 'Supaul Basin Central', distKm: 18.0, baseArrivalSec: 12600, pop: 20500, elevationM: 74, x: 28, z: 45, safeShelter: 'District Administrative High Camp' }
    ],
    safeShelters: [
      { id: 'sh-1', name: 'Kushaha Ridge Camp', x: -60, z: -90, elevM: 125, capacity: 6000 },
      { id: 'sh-2', name: 'Bhimnagar High Ground', x: 65, z: -55, elevM: 130, capacity: 11000 },
      { id: 'sh-3', name: 'Birpur Stadium Plateau', x: -68, z: 5, elevM: 135, capacity: 18000 },
      { id: 'sh-4', name: 'District Administrative High Camp', x: 72, z: 70, elevM: 142, capacity: 25000 }
    ]
  },
  {
    id: 'kosi-controlled',
    name: 'Kosi Controlled Release',
    river: 'Kosi Barrage Spillway Sluices',
    location: 'Bhimnagar Barrage Axis',
    type: 'High-Volume Controlled Release',
    lakeVolumeM3: 280e6,
    defaultParams: {
      breachWidthM: 120,
      formationTimeMin: 90,
      waterLevelM: 35,
      peakDischargeM3s: 11200
    },
    maxFloodExtentKm2: 84.6,
    maxDepthM: 4.8,
    peakVelocityMs: 3.6,
    totalPopulationExposed: 28400,
    settlements: [
      { id: 'set-1', name: 'Kushaha Village', distKm: 2.5, baseArrivalSec: 2100, pop: 4200, elevationM: 88, x: -16, z: -110, safeShelter: 'Kushaha Ridge Camp' },
      { id: 'set-2', name: 'Bhimnagar Colony', distKm: 6.2, baseArrivalSec: 4600, pop: 8600, elevationM: 84, x: 20, z: -75, safeShelter: 'Bhimnagar High Ground' },
      { id: 'set-3', name: 'Birpur Lowland Subdiv', distKm: 11.5, baseArrivalSec: 8800, pop: 15600, elevationM: 79, x: -25, z: -20, safeShelter: 'Birpur Stadium Plateau' },
      { id: 'set-4', name: 'Supaul Basin Central', distKm: 18.0, baseArrivalSec: 17200, pop: 20500, elevationM: 74, x: 28, z: 45, safeShelter: 'District Administrative High Camp' }
    ],
    safeShelters: [
      { id: 'sh-1', name: 'Kushaha Ridge Camp', x: -60, z: -90, elevM: 125, capacity: 6000 },
      { id: 'sh-2', name: 'Bhimnagar High Ground', x: 65, z: -55, elevM: 130, capacity: 11000 },
      { id: 'sh-3', name: 'Birpur Stadium Plateau', x: -68, z: 5, elevM: 135, capacity: 18000 },
      { id: 'sh-4', name: 'District Administrative High Camp', x: 72, z: 70, elevM: 142, capacity: 25000 }
    ]
  },
  {
    id: 'south-lhonak-glof',
    name: 'South Lhonak GLOF',
    river: 'Teesta River Basin',
    location: 'South Lhonak Glacial Lake & Chungthang Dam',
    type: 'Glacial Moraine Dam Outburst Flash Wave',
    lakeVolumeM3: 650e6,
    defaultParams: {
      breachWidthM: 250,
      formationTimeMin: 25,
      waterLevelM: 68,
      peakDischargeM3s: 26000
    },
    maxFloodExtentKm2: 198.5,
    maxDepthM: 15.6,
    peakVelocityMs: 9.2,
    totalPopulationExposed: 54200,
    settlements: [
      { id: 'set-1', name: 'Kushaha Village', distKm: 2.5, baseArrivalSec: 1100, pop: 4200, elevationM: 88, x: -16, z: -110, safeShelter: 'Kushaha Ridge Camp' },
      { id: 'set-2', name: 'Bhimnagar Colony', distKm: 6.2, baseArrivalSec: 2400, pop: 8600, elevationM: 84, x: 20, z: -75, safeShelter: 'Bhimnagar High Ground' },
      { id: 'set-3', name: 'Birpur Lowland Subdiv', distKm: 11.5, baseArrivalSec: 4900, pop: 15600, elevationM: 79, x: -25, z: -20, safeShelter: 'Birpur Stadium Plateau' },
      { id: 'set-4', name: 'Supaul Basin Central', distKm: 18.0, baseArrivalSec: 9800, pop: 20500, elevationM: 74, x: 28, z: 45, safeShelter: 'District Administrative High Camp' }
    ],
    safeShelters: [
      { id: 'sh-1', name: 'Kushaha Ridge Camp', x: -60, z: -90, elevM: 125, capacity: 6000 },
      { id: 'sh-2', name: 'Bhimnagar High Ground', x: 65, z: -55, elevM: 130, capacity: 11000 },
      { id: 'sh-3', name: 'Birpur Stadium Plateau', x: -68, z: 5, elevM: 135, capacity: 18000 },
      { id: 'sh-4', name: 'District Administrative High Camp', x: 72, z: 70, elevM: 142, capacity: 25000 }
    ]
  }
];
