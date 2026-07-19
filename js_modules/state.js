"use strict";

// 2. STATE MANAGEMENT
const state = {
  activeTab: 'fan-portal',
  crowdData: {
    'North': 45,
    'South': 72,
    'East': 62,
    'West': 31,
    'Concourse A': 88,
    'Concourse B': 40
  },
  gateStatuses: {
    A: 'open', B: 'open', C: 'busy', D: 'open',
    E: 'closed', F: 'open', G: 'busy', H: 'open'
  },
  incidents: [
    { id: 'INC-001', zone: 'North', type: 'Medical', severity: 'High', time: '14:30', status: 'Active', aiAction: 'Dispatched medical team to North Stand, Row 24' },
    { id: 'INC-002', zone: 'Concourse A', type: 'Crowd', severity: 'Medium', time: '14:45', status: 'Active', aiAction: 'Redirecting flow via Gate F, opening auxiliary corridor' },
    { id: 'INC-003', zone: 'South', type: 'Technical', severity: 'Low', time: '14:50', status: 'Active', aiAction: 'Maintenance crew dispatched to fix display board' },
    { id: 'INC-004', zone: 'West', type: 'Security', severity: 'Critical', time: '15:00', status: 'Active', aiAction: 'Security detail deployed, area cordoned' },
    { id: 'INC-005', zone: 'East', type: 'Weather', severity: 'Low', time: '15:10', status: 'Resolved', aiAction: 'Temporary shelters activated in East concourse' }
  ],
  transportData: [
    { route: 'Metro Line 1', type: 'Metro', nextDeparture: '3 min', capacity: 45, status: 'On Time', co2PerPerson: CONSTANTS.CO2_METRO, name: 'Stadium Express' },
    { route: 'Metro Line 2', type: 'Metro', nextDeparture: '8 min', capacity: 72, status: 'On Time', co2PerPerson: CONSTANTS.CO2_METRO, name: 'City Center' },
    { route: 'Shuttle Bus A', type: 'Shuttle', nextDeparture: '5 min', capacity: 60, status: 'On Time', co2PerPerson: CONSTANTS.CO2_BUS, name: 'North Parking' },
    { route: 'Shuttle Bus B', type: 'Shuttle', nextDeparture: '12 min', capacity: 30, status: 'On Time', co2PerPerson: CONSTANTS.CO2_BUS, name: 'South Parking' },
    { route: 'Free Bike Share', type: 'Bike', nextDeparture: 'Now', capacity: 28, status: 'Available', co2PerPerson: CONSTANTS.CO2_BIKE, name: 'Stadium Zone' }
  ],
  parkingData: [
    { id: 'P1', total: 1200, available: 340, distance: '0.2 mi', evSpots: 60, price: 45 },
    { id: 'P2', total: 800, available: 52, distance: '0.4 mi', evSpots: 25, price: 35 },
    { id: 'P3', total: 1500, available: 780, distance: '0.8 mi', evSpots: 120, price: 20 },
    { id: 'P4', total: 600, available: 0, distance: '0.1 mi', evSpots: 15, price: 55 },
    { id: 'P5', total: 2000, available: 1100, distance: '1.2 mi', evSpots: 200, price: 15 },
    { id: 'P6', total: 900, available: 180, distance: '0.5 mi', evSpots: 40, price: 30 }
  ],
  elevatorData: [
    { id: 'E1', floor: 'Ground', status: 'Operational', capacity: 35, waitTime: 2 },
    { id: 'E2', floor: 'Level 1', status: 'Operational', capacity: 70, waitTime: 5 },
    { id: 'E3', floor: 'Level 2', status: 'Maintenance', capacity: 0, waitTime: 0 },
    { id: 'E4', floor: 'Ground', status: 'Operational', capacity: 15, waitTime: 1 },
    { id: 'E5', floor: 'Level 3', status: 'Operational', capacity: 90, waitTime: 8 },
    { id: 'E6', floor: 'Level 1', status: 'Operational', capacity: 50, waitTime: 3 }
  ],
  volunteerStations: [
    { name: 'Gate A Welcome', staffCount: 3, required: 5 },
    { name: 'Gate B Welcome', staffCount: 5, required: 4 },
    { name: 'Gate C Tickets', staffCount: 2, required: 4 },
    { name: 'Gate D Security', staffCount: 4, required: 4 },
    { name: 'North Concourse', staffCount: 8, required: 10 },
    { name: 'South Concourse', staffCount: 12, required: 8 },
    { name: 'VIP Lounge', staffCount: 6, required: 6 },
    { name: 'Transport Hub', staffCount: 10, required: 15 },
    { name: 'Medical Station 1', staffCount: 4, required: 4 },
    { name: 'Medical Station 2', staffCount: 2, required: 5 },
    { name: 'Fan Zone East', staffCount: 10, required: 10 },
    { name: 'Fan Zone West', staffCount: 5, required: 12 }
  ],
  greenPoints: 0,
  completedChallenges: {},
  matchData: {
    homeTeam: 'Brazil',
    awayTeam: 'France',
    homeScore: 1,
    awayScore: 2,
    time: '65:00',
    venue: 'MetLife Stadium, New Jersey',
    status: 'Second Half',
    homeFlag: '🇧🇷',
    awayFlag: '🇫🇷'
  },
  sustainabilityData: {
    renewable: 85,
    waterRecycling: 73,
    wasteDiverted: 68,
    carbonOffset: 2400
  },
  selectedLanguage: 'English',
  chatHistories: {
    fan: [],
    command: [],
    accessibility: []
  },
  lastApiCall: 0
};
