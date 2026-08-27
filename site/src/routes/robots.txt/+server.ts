import { siteEnv } from '$lib/env';
import { robotsTxtBody } from '$lib/site-env';

// Page options in `+layout.ts` do not reach `+server.ts`, so prerendering is declared here;
// without it the build fails and no `build/robots.txt` is written (ADR-0006).
export const prerender = true;

export function GET(): Response {
	return new Response(robotsTxtBody(siteEnv), { headers: { 'content-type': 'text/plain' } });
}
