import { describe, expect, it } from 'vitest';
import { prerender } from '../../src/routes/+layout';

describe('root layout', () => {
	it('prerenders every route (ADR-0002)', () => {
		expect(prerender).toBe(true);
	});
});
