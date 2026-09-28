// Critical infrastructure nodes placed inside the 3D river valley
export const INFRASTRUCTURE_3D = [
  // Villages
  {
    id: 'vil-1',
    name: 'Kushaha Hamlet',
    type: 'village',
    category: 'VILLAGE',
    position: { x: -18, y: 7.2, z: -105 },
    population: 3400,
    elevationM: 88,
    distanceFromDamKm: 2.8,
    baseArrivalTimeSec: 1650, // ~27 min
    associatedShelterId: 'sh-1'
  },
  {
    id: 'vil-2',
    name: 'Bhimnagar Settlement',
    type: 'village',
    category: 'VILLAGE',
    position: { x: 22, y: 6.8, z: -70 },
    population: 4800,
    elevationM: 84,
    distanceFromDamKm: 5.4,
    baseArrivalTimeSec: 3200, // ~53 min
    associatedShelterId: 'sh-1'
  },
  {
    id: 'vil-3',
    name: 'Birpur Lowland Ward',
    type: 'village',
    category: 'VILLAGE',
    position: { x: -28, y: 6.1, z: -25 },
    population: 7400,
    elevationM: 79,
    distanceFromDamKm: 9.1,
    baseArrivalTimeSec: 6100, // ~1h 41m
    associatedShelterId: 'sh-2'
  },
  {
    id: 'vil-4',
    name: 'Supaul Basin Township',
    type: 'village',
    category: 'VILLAGE',
    position: { x: 30, y: 5.5, z: 35 },
    population: 9200,
    elevationM: 74,
    distanceFromDamKm: 14.2,
    baseArrivalTimeSec: 12800, // ~3h 33m
    associatedShelterId: 'sh-2'
  },
  {
    id: 'vil-5',
    name: 'Dikchu River Confluence',
    type: 'village',
    category: 'VILLAGE',
    position: { x: -22, y: 5.1, z: 90 },
    population: 8700,
    elevationM: 70,
    distanceFromDamKm: 19.5,
    baseArrivalTimeSec: 19500, // ~5h 25m
    associatedShelterId: 'sh-3'
  },
  {
    id: 'vil-6',
    name: 'Singtam Commercial Area',
    type: 'village',
    category: 'VILLAGE',
    position: { x: 26, y: 4.8, z: 135 },
    population: 7700,
    elevationM: 67,
    distanceFromDamKm: 24.1,
    baseArrivalTimeSec: 27200, // ~7h 33m
    associatedShelterId: 'sh-3'
  },

  // Critical Bridges
  {
    id: 'br-1',
    name: 'Kosi Barrage Access Bridge',
    type: 'bridge',
    category: 'BRIDGE',
    position: { x: 0, y: 7.5, z: -88 },
    spanM: 140,
    elevationM: 86,
    distanceFromDamKm: 4.1,
    baseArrivalTimeSec: 2400,
    associatedShelterId: null
  },
  {
    id: 'br-2',
    name: 'Rangpo National Viaduct',
    type: 'bridge',
    category: 'BRIDGE',
    position: { x: 2, y: 6.2, z: 5 },
    spanM: 180,
    elevationM: 76,
    distanceFromDamKm: 11.8,
    baseArrivalTimeSec: 8900,
    associatedShelterId: null
  },
  {
    id: 'br-3',
    name: 'Lower Bypass Suspension Bridge',
    type: 'bridge',
    category: 'BRIDGE',
    position: { x: -4, y: 5.2, z: 110 },
    spanM: 160,
    elevationM: 71,
    distanceFromDamKm: 21.4,
    baseArrivalTimeSec: 22800,
    associatedShelterId: null
  },

  // Safe High-Ground Shelters
  {
    id: 'sh-1',
    name: 'Relief Camp Alpha (Ridge)',
    type: 'shelter',
    category: 'SHELTER',
    position: { x: -65, y: 16.5, z: -85 },
    capacity: 6500,
    elevationM: 125,
    distanceFromDamKm: 4.8,
    isHighGround: true,
    associatedShelterId: null
  },
  {
    id: 'sh-2',
    name: 'Central School High Plateau',
    type: 'shelter',
    category: 'SHELTER',
    position: { x: 70, y: 17.2, z: 15 },
    capacity: 12000,
    elevationM: 132,
    distanceFromDamKm: 12.5,
    isHighGround: true,
    associatedShelterId: null
  },
  {
    id: 'sh-3',
    name: 'High-Ground Barracks Camp',
    type: 'shelter',
    category: 'SHELTER',
    position: { x: -68, y: 18.0, z: 115 },
    capacity: 9500,
    elevationM: 140,
    distanceFromDamKm: 22.0,
    isHighGround: true,
    associatedShelterId: null
  }
];
