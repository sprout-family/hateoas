import { State } from './state.js';
import { HalResource, HalLink } from 'hal-types';
import { Link } from './link.js';
import { StateSchema } from './types.js';

type HalOptions = {
  /**
   * If no 'self' link is provided in the state, this URI will be used as the 'self' link.
   */
  defaultUri?: string;

  /**
   * When provided, any relationships (specified with 'rel') in this list
   * will be included in the '_embedded' section of the HAL resource.
   *
   * Otherwise, they will only be included in the '_links' section.
   */
  embedRels?: string[];
};

export function stateToHal<T extends StateSchema>(state: State<T>, options: HalOptions = {}): HalResource {

  const links: Link[] = [];
  const embedded: HalResource['_embedded'] = {};
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
      if (options.embedRels && options.embedRels.includes(relType)) {
        // This relationship should be embedded
        if (!embedded[relType]) {
          embedded[relType] = stateToHal(relationship, options);
        } else if (Array.isArray(embedded[relType])) {
          // We already have an array of embedded resources for this relType
          embedded[relType].push(stateToHal(relationship, options));
        } else {
          // We already have a single embedded resource for this relType
          // Convert it to an array and add the new one
          embedded[relType] = [embedded[relType], stateToHal(relationship, options)];
        }

      } else {
        const link: any = {
          rel: relType,
          href: relationship.uri,
        };
        if (relationship.title) {
          link.title = relationship.title;
        }
        links.push(link);
      }

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
    };

    if (link.title) newLink.title = link.title;
    if (link.type) newLink.type = link.type;
    if (link.hints) newLink.hints = link.hints;
    if (link.templated) newLink.templated = link.templated;

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

  const result: HalResource = {
    _links: halLinks,
    ...state.data,
  };
  if (Object.keys(embedded).length > 0) {
    result._embedded = embedded;
  }
  return result;

}
