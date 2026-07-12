import { describe, expect, it } from 'vitest';
import { isValidAdSenseClientId, isValidAdSenseSlotId } from './adConfig';

describe('isValidAdSenseClientId', () => {
  it('accepts ca-pub format', () => {
    expect(isValidAdSenseClientId('ca-pub-1234567890123456')).toBe(true);
  });

  it('rejects invalid format', () => {
    expect(isValidAdSenseClientId('pub-123')).toBe(false);
    expect(isValidAdSenseClientId('')).toBe(false);
  });
});

describe('isValidAdSenseSlotId', () => {
  it('accepts numeric slot id', () => {
    expect(isValidAdSenseSlotId('1234567890')).toBe(true);
  });

  it('rejects invalid slot id', () => {
    expect(isValidAdSenseSlotId('slot-1')).toBe(false);
  });
});
