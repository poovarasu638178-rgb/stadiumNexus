"use strict";

// 20. REAL TEST SUITE
/**
 * @function runTest
 * @description Runs a single test assertion with numeric tolerance.
 * @param {string} name - Test name.
 * @param {*} actual - Actual value.
 * @param {*} expected - Expected value.
 * @returns {boolean} Whether the test passed.
 */
function runTest(name, actual, expected) {
  const passed = typeof actual === 'number' && typeof expected === 'number'
    ? Math.abs(actual - expected) < 0.01
    : actual === expected;
  console.log(`${passed ? '✅' : '❌'} ${name}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  return passed;
}

/**
 * @function executeAllTests
 * @description Runs the complete StadiumNexus test suite with 120+ real assertions.
 * @returns {Object} Test results with passed, total, and percentage.
 */
function executeAllTests() {
  console.group('🧪 StadiumNexus Test Suite v1.0');
  let passed = 0, total = 0;

  function assert(name, actual, expected) {
    if (runTest(name, actual, expected)) passed++;
    total++;
  }

  // ═══ CROWD LEVEL TESTS (25) ═══
  console.group('Crowd Level Tests');
  assert('Crowd level 0% = Low', getCrowdLevel(0), 'Low');
  assert('Crowd level 10% = Low', getCrowdLevel(10), 'Low');
  assert('Crowd level 25% = Low', getCrowdLevel(25), 'Low');
  assert('Crowd level 49% = Low', getCrowdLevel(49), 'Low');
  assert('Crowd level 50% = Medium', getCrowdLevel(50), 'Medium');
  assert('Crowd level 55% = Medium', getCrowdLevel(55), 'Medium');
  assert('Crowd level 65% = Medium', getCrowdLevel(65), 'Medium');
  assert('Crowd level 74% = Medium', getCrowdLevel(74), 'Medium');
  assert('Crowd level 75% = High', getCrowdLevel(75), 'High');
  assert('Crowd level 80% = High', getCrowdLevel(80), 'High');
  assert('Crowd level 85% = High', getCrowdLevel(85), 'High');
  assert('Crowd level 89% = High', getCrowdLevel(89), 'High');
  assert('Crowd level 90% = Critical', getCrowdLevel(90), 'Critical');
  assert('Crowd level 95% = Critical', getCrowdLevel(95), 'Critical');
  assert('Crowd level 100% = Critical', getCrowdLevel(100), 'Critical');
  assert('Crowd color Low', getCrowdColor('Low'), '#4ADE80');
  assert('Crowd color Medium', getCrowdColor('Medium'), '#FBBF24');
  assert('Crowd color High', getCrowdColor('High'), '#FB923C');
  assert('Crowd color Critical', getCrowdColor('Critical'), '#FF5252');
  assert('Crowd color unknown defaults', getCrowdColor('Unknown'), '#4ADE80');
  assert('Boundary 49.9 = Low', getCrowdLevel(49.9), 'Low');
  assert('Boundary 50.0 = Medium', getCrowdLevel(50.0), 'Medium');
  assert('Boundary 74.9 = Medium', getCrowdLevel(74.9), 'Medium');
  assert('Boundary 75.0 = High', getCrowdLevel(75.0), 'High');
  assert('Boundary 89.9 = High', getCrowdLevel(89.9), 'High');
  console.groupEnd();

  // ═══ CO2 CALCULATION TESTS (25) ═══
  console.group('CO2 Calculation Tests');
  assert('Metro CO2 1km', calcCO2('metro', 1), 0.02);
  assert('Metro CO2 10km', calcCO2('metro', 10), 0.20);
  assert('Metro CO2 50km', calcCO2('metro', 50), 1.00);
  assert('Metro CO2 0km', calcCO2('metro', 0), 0);
  assert('Bus CO2 1km', calcCO2('bus', 1), 0.08);
  assert('Bus CO2 10km', calcCO2('bus', 10), 0.80);
  assert('Bus CO2 25km', calcCO2('bus', 25), 2.00);
  assert('Car CO2 1km', calcCO2('car', 1), 0.21);
  assert('Car CO2 10km', calcCO2('car', 10), 2.10);
  assert('Car CO2 50km', calcCO2('car', 50), 10.50);
  assert('Bike CO2 1km', calcCO2('bike', 1), 0);
  assert('Bike CO2 100km', calcCO2('bike', 100), 0);
  assert('Walk CO2 5km', calcCO2('walk', 5), 0);
  assert('Shuttle CO2 10km', calcCO2('shuttle', 10), 0.80);
  assert('CO2 savings metro vs car 10km', parseFloat((calcCO2('car', 10) - calcCO2('metro', 10)).toFixed(2)), 1.90);
  assert('CO2 savings bike vs car 20km', parseFloat((calcCO2('car', 20) - calcCO2('bike', 20)).toFixed(2)), 4.20);
  assert('CO2 savings bus vs car 15km', parseFloat((calcCO2('car', 15) - calcCO2('bus', 15)).toFixed(2)), 1.95);
  assert('Metro CO2 100km', calcCO2('metro', 100), 2.00);
  assert('Car CO2 100km', calcCO2('car', 100), 21.00);
  assert('Bus CO2 0km', calcCO2('bus', 0), 0);
  assert('Bike CO2 0km', calcCO2('bike', 0), 0);
  assert('Walk CO2 0km', calcCO2('walk', 0), 0);
  assert('Shuttle CO2 0km', calcCO2('shuttle', 0), 0);
  assert('Car CO2 0km', calcCO2('car', 0), 0);
  assert('Metro CO2 5km', calcCO2('metro', 5), 0.10);
  console.groupEnd();

  // ═══ SANITIZER TESTS (20) ═══
  console.group('Input Sanitizer Tests');
  assert('XSS script tag blocked', sanitizeInput('<script>alert(1)</script>'), -1);
  assert('XSS Script uppercase blocked', sanitizeInput('<Script>'), -1);
  assert('XSS javascript: blocked', sanitizeInput('javascript:void(0)'), -1);
  assert('XSS onerror blocked', sanitizeInput('onerror=alert(1)'), -1);
  assert('XSS onload blocked', sanitizeInput('onload=hack()'), -1);
  assert('Clean text passes', typeof sanitizeInput('Hello World'), 'string');
  assert('Clean number string', typeof sanitizeInput('12345'), 'string');
  assert('Clean special chars', typeof sanitizeInput('Gate A-14'), 'string');
  assert('Clean unicode', typeof sanitizeInput('Stade de France'), 'string');
  assert('Empty string passes', typeof sanitizeInput(''), 'string');
  assert('Clean question', typeof sanitizeInput('Where is Gate 14?'), 'string');
  assert('Clean email-like', typeof sanitizeInput('user@stadium.com'), 'string');
  assert('Clean with numbers', typeof sanitizeInput('Section 101, Row 5'), 'string');
  assert('Script in mixed case', sanitizeInput('<sCrIpT>'), -1);
  assert('JS protocol with spaces', sanitizeInput('javascript:alert(1)'), -1);
  assert('Onerror with space', sanitizeInput('onerror=test'), -1);
  assert('Clean arabic text', typeof sanitizeInput('مرحبا'), 'string');
  assert('Clean spanish text', typeof sanitizeInput('¿Dónde está?'), 'string');
  assert('Clean french text', typeof sanitizeInput('Où est la sortie?'), 'string');
  assert('Clean portuguese text', typeof sanitizeInput('Estádio Nacional'), 'string');
  console.groupEnd();

  // ═══ GREEN SCORE TESTS (15) ═══
  console.group('Green Score Tests');
  assert('Score A for 6kg saved', getGreenScore(6), 'A');
  assert('Score A for 10kg saved', getGreenScore(10), 'A');
  assert('Score A for 5.01 saved', getGreenScore(5.01), 'A');
  assert('Score B for 4kg saved', getGreenScore(4), 'B');
  assert('Score B for 3.5 saved', getGreenScore(3.5), 'B');
  assert('Score B for 3.01 saved', getGreenScore(3.01), 'B');
  assert('Score C for 2kg saved', getGreenScore(2), 'C');
  assert('Score C for 1.5 saved', getGreenScore(1.5), 'C');
  assert('Score C for 1.01 saved', getGreenScore(1.01), 'C');
  assert('Score D for 0.5 saved', getGreenScore(0.5), 'D');
  assert('Score D for 0.01 saved', getGreenScore(0.01), 'D');
  assert('Score F for 0 saved', getGreenScore(0), 'F');
  assert('Score F for negative', getGreenScore(-1), 'F');
  assert('Score boundary 5.0 = B', getGreenScore(5.0), 'B');
  assert('Score boundary 3.0 = C', getGreenScore(3.0), 'C');
  console.groupEnd();

  // ═══ UTILITY TESTS (15) ═══
  console.group('Utility Tests');
  assert('clamp below min', clamp(-5, 0, 100), 0);
  assert('clamp above max', clamp(150, 0, 100), 100);
  assert('clamp in range', clamp(50, 0, 100), 50);
  assert('clamp at min', clamp(0, 0, 100), 0);
  assert('clamp at max', clamp(100, 0, 100), 100);
  assert('formatNumber 1000', formatNumber(1000), '1,000');
  assert('formatNumber 0', formatNumber(0), '0');
  assert('formatNumber 1000000', formatNumber(1000000), '1,000,000');
  assert('getRandomInRange min<=result', getRandomInRange(5, 5) >= 5, true);
  assert('getRandomInRange max>=result', getRandomInRange(5, 5) <= 5, true);
  assert('CONSTANTS.STADIUM_CAPACITY', CONSTANTS.STADIUM_CAPACITY, 85000);
  assert('CONSTANTS.ZONES length', CONSTANTS.ZONES.length, 6);
  assert('CONSTANTS.LANGUAGES length', CONSTANTS.LANGUAGES.length, 5);
  assert('CONSTANTS.CO2_CAR', CONSTANTS.CO2_CAR, 0.21);
  assert('CONSTANTS.CO2_BIKE', CONSTANTS.CO2_BIKE, 0);
  console.groupEnd();

  // ═══ TRANSPORT TESTS (15) ═══
  console.group('Transport Tests');
  assert('Wait time 0% capacity', calculateWaitTime(0), 0);
  assert('Wait time 50% capacity', calculateWaitTime(50), 10);
  assert('Wait time 80% capacity', calculateWaitTime(80), 16);
  assert('Wait time 100% capacity', calculateWaitTime(100), 20);
  assert('Wait time 30% capacity', calculateWaitTime(30), 6);
  assert('Wait time negative clamped', calculateWaitTime(-10), 0);
  assert('Wait time over 100 clamped', calculateWaitTime(120), 20);
  assert('Transport data has routes', state.transportData.length > 0, true);
  assert('Parking data has 6 lots', state.parkingData.length, 6);
  assert('Parking P1 has total', state.parkingData[0].total > 0, true);
  assert('Parking P1 has available', state.parkingData[0].available >= 0, true);
  assert('Parking has EV spots', state.parkingData[0].evSpots >= 0, true);
  assert('Transport has CO2 data', state.transportData[0].co2PerPerson >= 0, true);
  assert('calcCO2 with unknown mode defaults', calcCO2('unknown', 10), 0);
  assert('Parking price exists', state.parkingData[0].price > 0, true);
  console.groupEnd();

  // ═══ ACCESSIBILITY TESTS (10) ═══
  console.group('Accessibility Tests');
  assert('Elevator data has 6', state.elevatorData.length, 6);
  assert('Elevator has status', typeof state.elevatorData[0].status, 'string');
  assert('Elevator has floor', typeof state.elevatorData[0].floor, 'string');
  assert('Elevator has waitTime', state.elevatorData[0].waitTime >= 0, true);
  assert('Volunteer stations = 12', state.volunteerStations.length, 12);
  assert('Volunteer has staffCount', state.volunteerStations[0].staffCount >= 0, true);
  assert('Zones includes North', CONSTANTS.ZONES.includes('North'), true);
  assert('Zones includes Concourse A', CONSTANTS.ZONES.includes('Concourse A'), true);
  assert('Match data exists', typeof state.matchData.homeTeam, 'string');
  assert('Sustainability data exists', state.sustainabilityData.renewable > 0, true);
  console.groupEnd();

  // FINAL RESULTS
  const percentage = ((passed / total) * 100).toFixed(1);
  console.log(
    `%c\n[StadiumNexus Test Suite] Final: ${passed}/${total} tests passed (${percentage}%)`,
    passed === total ? 'color:#4ADE80;font-weight:bold;font-size:14px' : 'color:#FF5252;font-weight:bold;font-size:14px'
  );
  console.groupEnd();
  return { passed, total, percentage };
}

window.executeAllTests = executeAllTests;
window.addEventListener('load', () => setTimeout(executeAllTests, 1000));
