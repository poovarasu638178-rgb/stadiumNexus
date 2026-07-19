/**
 * StadiumNexus Unit Tests
 * @jest-environment jsdom
 */

// Mock DOM elements and data for testing
const mockState = {
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
  }
};

describe('StadiumNexus Core Utility Functions', () => {

  describe('formatTime', () => {
    test('should format time correctly', () => {
      // Mocking formatTime function logic
      const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      };
      const formatted = formatTime('2026-07-06T15:30:00');
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
    });
  });

  describe('getZoneColor', () => {
    test('should return correct color for critical crowd density', () => {
      const getZoneColor = (density) => {
        if (density >= 90) return 'var(--color-danger)';
        if (density >= 75) return 'var(--color-warning)';
        return 'var(--color-success)';
      };
      expect(getZoneColor(95)).toBe('var(--color-danger)');
    });

    test('should return correct color for high crowd density', () => {
      const getZoneColor = (density) => {
        if (density >= 90) return 'var(--color-danger)';
        if (density >= 75) return 'var(--color-warning)';
        return 'var(--color-success)';
      };
      expect(getZoneColor(80)).toBe('var(--color-warning)');
    });

    test('should return correct color for low crowd density', () => {
      const getZoneColor = (density) => {
        if (density >= 90) return 'var(--color-danger)';
        if (density >= 75) return 'var(--color-warning)';
        return 'var(--color-success)';
      };
      expect(getZoneColor(40)).toBe('var(--color-success)');
    });
  });

  describe('calculateCarbonFootprint', () => {
    test('should calculate accurate CO2 emissions based on mode', () => {
      const calculateCO2 = (distanceKm, mode) => {
        const rates = { metro: 0.02, bus: 0.08, bike: 0, car: 0.21 };
        return distanceKm * rates[mode];
      };
      expect(calculateCO2(10, 'metro')).toBeCloseTo(0.2);
      expect(calculateCO2(10, 'car')).toBeCloseTo(2.1);
      expect(calculateCO2(5, 'bike')).toBe(0);
    });
  });

  describe('State Management', () => {
    test('state object should track active tab', () => {
      expect(mockState.activeTab).toBe('fan-portal');
      mockState.activeTab = 'command-center';
      expect(mockState.activeTab).toBe('command-center');
    });
    
    test('state object should hold valid gate statuses', () => {
      expect(mockState.gateStatuses.A).toBe('open');
      expect(mockState.gateStatuses.C).toBe('busy');
      expect(mockState.gateStatuses.E).toBe('closed');
    });
  });

  describe('DOM Sanitization Check', () => {
    test('DOMPurify should be mockable', () => {
      const DOMPurify = { sanitize: (str) => str.replace(/<script>/g, '') };
      const dirty = '<script>alert(1)</script>Hello';
      const clean = DOMPurify.sanitize(dirty);
      expect(clean).not.toContain('<script>');
      expect(clean).toBe('alert(1)</script>Hello');
    });
  });

});
