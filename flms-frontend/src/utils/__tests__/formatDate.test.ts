import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatNumber } from '../formatDate';

describe('formatDate utilities', () => {
  it('should format date to YYYY-MM-DD', () => {
    expect(formatDate('2026-02-23T10:00:00Z')).toBe('2026-02-23');
  });

  it('should handle null or invalid dates', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('invalid')).toBe('—');
    expect(formatDateTime(null)).toBe('—');
  });

  it('should format numbers correctly', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber('5000')).toBe('5,000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('0');
  });
});
