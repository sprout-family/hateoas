import { State } from './state.js';

type SirenOptions = {
  defaultUri?: string;
};

type SirenEntity = {
  class?: string[];
  properties: Record<string, any>;
  entities?: (SirenLink | SirenSubEntity)[];

  links?: SirenLink[];
  title?: string;
}

type SirenLink = {
  class?: string[];
  rel: string[];
  href: string;
  type?: string;
  title?: string;
};

type SirenSubEntity = SirenEntity & { rel: string[] };

export function stateToSiren(state: State, options: SirenOptions = {}): SirenEntity {

  const links: SirenLink[] = [];
  const entities: SirenLink[] = [];

  const uri = state.uri ?? options.defaultUri;

  if (uri) {
    links.push({
      rel: ['self'],
      href: uri,
    });
  }

  for(const link of state.links) {
    links.push({
      rel: [link.rel],
      href: link.href,
      type: link.type,
      title: link.title,
    });
  }

  for(const [rel, relationships] of Object.entries(state.relationships)) {

    for(const relationship of Array.isArray(relationships) ? relationships : [relationships]) {

      if (!relationship.uri) {
        console.warn('Cannot encode a relationship without a uri. Skipping relationship with rel "%s"', rel);
        continue;
      }
      entities.push({
        rel: [rel],
        href: relationship.uri,
        title: relationship.title,
      });
    }

  }

  const siren: SirenEntity = {
    properties: state.data,
    title: state.title,
    links,
    entities,
  };
  return siren;

}
