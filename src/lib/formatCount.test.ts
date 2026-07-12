import { describe, expect, it } from 'vitest';
import { formatCompactCount } from './formatCount';

describe('formatCompactCount', () => {
  it('formats numbers below 10000 as-is', () => {
    expect(formatCompactCount(0)).toBe('0');
    expect(formatCompactCount(999)).toBe('999');
    expect(formatCompactCount(9999)).toBe('9999');
  });

  it('formats numbers from 10000 in 万 units', () => {
    expect(formatCompactCount(10_000)).toBe('1万');
    expect(formatCompactCount(50_000)).toBe('5万');
    expect(formatCompactCount(500_000)).toBe('50万');
    expect(formatCompactCount(12_345)).toBe('1.2万');
  });
});
