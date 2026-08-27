import { demo } from './demo';
import { faq } from './faq';
import { footer } from './footer';
import { site } from './site';
import type { ContentInventory } from './types';

export { demo, faq, footer, site };
export type { Column, ContentInventory, FaqItem, Link, LogoEntry, Metric, Status } from './types';

export const content = { site, demo, faq, footer } satisfies ContentInventory;
