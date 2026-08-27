import { describe, expect, it } from 'vitest';
import { robotsMetaContent, robotsTxtBody, siteEnvFrom } from '../../src/lib/site-env';

// ADR-0006: unset means staging, staging is noindex + Disallow: /, production is neither.
describe('site environment mapping (ADR-0006)', () => {
	it('treats an unset variable as staging', () => {
		expect(siteEnvFrom(undefined)).toBe('staging');
	});

	it.each(['staging', 'preview', 'Production', 'production ', ''])(
		'treats %o as staging',
		(value) => {
			expect(siteEnvFrom(value)).toBe('staging');
		}
	);

	it('treats the exact string production as production', () => {
		expect(siteEnvFrom('production')).toBe('production');
	});

	it('emits the noindex meta and a disallowing robots.txt in staging', () => {
		expect(robotsMetaContent('staging')).toBe('noindex, nofollow');
		expect(robotsTxtBody('staging')).toBe('User-agent: *\nDisallow: /\n');
	});

	it('emits no meta and a permissive robots.txt in production', () => {
		expect(robotsMetaContent('production')).toBeNull();
		expect(robotsTxtBody('production')).toBe('User-agent: *\nDisallow:\n');
	});
});
