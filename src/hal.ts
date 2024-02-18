import { State } from "./state.js";
import { HalResource, HalLink } from 'hal-types';
import { Link } from '@curveball/links';

export function stateToHal(state: State): HalResource {

  const links: Link[] = []
  for(const link of state.links) {
    links.push(link);
  }
  for(const [relType, relationships] of Object.entries(state.relationships)) {

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
      href: state.uri ?? '',
      title: state.title,
    }
  };

  for(const link of links) {
    if (halLinks[link.rel]) {
      if (Array.isArray(halLinks[link.rel])) {
        (halLinks[link.rel] as HalLink[]).push({
          href: link.href,
          title: link.title,
        });
      } else {
        halLinks[link.rel] = [
          halLinks[link.rel] as HalLink,
          {
            href: link.href,
            title: link.title,
          }
        ];
      }
    } else {
      halLinks[link.rel] = {
        href: link.href,
        title: link.title,
      }
    }
  }
    
  return {
    _links: halLinks,
    ...state.data,
  };


}
