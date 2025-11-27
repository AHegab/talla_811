import * as vit from 'vitest';
console.log('vitest import keys:', Object.keys(vit));

vit.test('should have vitest import test', () => {
  vit.expect(2 + 2).toBe(4);
});
