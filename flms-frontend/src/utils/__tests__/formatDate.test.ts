import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, formatNumber } from '../formatDate';

describe('formatDate utilities', () => {
  it('should format date correctly', () => {
    expect(formatDate('2023-10-05')).toBe('2023-10-05');
    expect(formatDate(new Date(2023, 9, 5))).toBe('2023-10-05');
  });

  it('should format date-time correctly', () => {
    const date = new Date(2023, 9, 5, 14, 30, 5);
    expect(formatDateTime(date)).toBe('2023-10-05 14:30:05');
  });

  it('should handle null/invalid dates', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDateTime(undefined)).toBe('—');
    expect(formatDate('invalid-date')).toBe('—');
  });

  it('should format numbers correctly', () => {
    expect(formatNumber(1234.56)).toBe('1,234.56');
    expect(formatNumber('1000000')).toBe('1,000,000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(null)).toBe('0');
  });
});
