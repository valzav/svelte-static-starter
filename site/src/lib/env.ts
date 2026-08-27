// The only file that reads the environment (ADR-0006: nothing else reads the flag).
// `$env/dynamic/public`, not `$env/static/public`: the static module emits one export per *defined*
// variable, so an unset `PUBLIC_SITE_ENV` fails the build instead of defaulting to staging. Values
// are still frozen at build time because every page is prerendered (ADR-0002).
import { env } from '$env/dynamic/public';
import { siteEnvFrom } from './site-env';

export const siteEnv = siteEnvFrom(env.PUBLIC_SITE_ENV);
