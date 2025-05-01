import { LinkHints } from 'hal-types';

export type Link = {
  /**
   * Target URI
   */
  href: string;

  /**
   * Relation type
   */
  rel: string;

  /**
   * Link title
   */
  title?: string;

  /**
   * Content type hint of the target resource
   */
  type?: string;

  /**
   * Language of the target resource
   */
  hreflang?: string;

  /**
   * HTML5 media attribute
   */
  media?: string;

  /**
   * Link hints, as defined in draft-nottingham-link-hint
   */
  hints?: LinkHints;

}
