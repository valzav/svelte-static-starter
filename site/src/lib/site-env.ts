// Pure environment mapping (ADR-0006, ADR-0006). It imports no `$env` module so unit tests can
// drive both environments; `env.ts` is the only file that reads the real environment.

export type SiteEnv = 'production' | 'staging';

/** Anything but the exact string `production` is staging — a misconfigured deploy stays noindex. */
export function siteEnvFrom(value: string | undefined): SiteEnv {
	return value === 'production' ? 'production' : 'staging';
}

/** The `content` of the robots meta, or `null` when no meta belongs in the head. */
export function robotsMetaContent(env: SiteEnv): string | null {
	return env === 'production' ? null : 'noindex, nofollow';
}

export function robotsTxtBody(env: SiteEnv): string {
	return env === 'production' ? 'User-agent: *\nDisallow:\n' : 'User-agent: *\nDisallow: /\n';
}
