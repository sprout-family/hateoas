import { State } from './state.js';
import { HalResource, HalLink } from 'hal-types';
import { Link } from './link.js';
import { StateSchema } from './types.js';

type HalOptions = {
  defaultUri?: string;
};

export function stateToHal<T extends StateSchema>(state: State<T>, options: HalOptions = {}): HalResource {

  const links: Link[] = [];
  for(const link of state.links) {
    links.push(link);
  }
  for(const [relType, relationships] of Object.entries(state.relationships)) {

    if (!relationships) {
      continue;
    }
    for(const relationship of Array.isArray(relationships) ? relationships : [relationships] ) {

      if (!relationship.uri) {
        console.warn('Cannot encode a relationship without a uri. Skipping relationship with rel "%s"', relType);
        continue;
      }
      links.push({
        rel: relType,
        href: relationship.uri,
        title: relationship.title,
      });

    }

  }

  const halLinks: HalResource['_links'] = {
    self: {
      href: state.uri ?? options.defaultUri ?? '',
      title: state.title,
    }
  };

  for(const link of links) {

    const newLink:HalLink = {
      href: link.href,
    }

    if (link.title) newLink.title = link.title;
    if (link.type) newLink.type = link.type;
    if (link.hints) newLink.hints = link.hints;

    if (halLinks[link.rel]) {
      // There already was a link with this rel
      if (Array.isArray(halLinks[link.rel])) {
        // It was an array, so we just add one more
        (halLinks[link.rel] as HalLink[]).push(newLink);
      } else {
        // Convert existing link to array
        halLinks[link.rel] = [
          halLinks[link.rel] as HalLink,
          newLink
        ];
      }
    } else {
      halLinks[link.rel] = newLink;
    }
  }

  return {
    _links: halLinks,
    ...state.data,
  };


}
