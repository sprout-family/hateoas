import { Link } from '@curveball/links';

/**
 * This type is what's passsed to the constructor of the State class.
 */
type StateInit<T extends StateSchema> = {
  data: T['data'];
  metadata: T['metadata'] extends Record<string,any> ? T['metadata'] : undefined;
  links?: Link[];
  relationships?: SchemaToStateRelationships<T['relationships']>;
  uri?: string;
  title?: string;
}

/**
 * The StateSchema represents the general shape of the resource and tells us
 * what properties exists in the State class, and what kind of relationships it
 * has to other states.
 */
type StateSchema = {
  data: Record<string, any>;
  metadata?: Record<string, any>;
  relationships: Record<string, StateSchema>;
}

/**
 * This is effectively the 'any' State.
 */
type SchemaDefaults = {
  data: Record<string, any>;
  relationships: Record<string, StateSchema>;
}

/**
 * A helper type that converts the relationships of a StateSchema to a Record<rel, State|State[]>
 */
type SchemaToStateRelationships<T extends Record<string, any>> = {
  [K in keyof T]: State<T[K]>[] | State<T[K]>;
}

/**
 * The State represents a past, current or desired state.
 *
 * This is sometimes called a Model or Entity in other systems.
 */
export class State<TStateSchema extends StateSchema = SchemaDefaults> {

  /**
   * The (relative) URL pointing to the resource.
   */
  public uri?: string;

  /**
   * A list of navigation links.
   */
  public links: Link[];

  /**
   * Properties that will be serialized.
   */
  public data: TStateSchema['data'];

  /**
   * List of relationships to other entities.
   */
  public relationships: SchemaToStateRelationships<TStateSchema['relationships']>;

  /**
   * Human-readable title
   */
  public title?: string;

  /**
   * Data relevant to the server but that will not be sent to clients.
   */
  public metadata: TStateSchema['metadata'];

  constructor(init: StateInit<TStateSchema & SchemaDefaults>) {

    this.uri = init.uri;
    this.links = init.links ?? [];
    this.data = init.data;
    this.relationships = init.relationships ?? {} as typeof this.relationships;
    this.title = init.title;
    this.metadata = init.metadata ?? {};

  }

  follow<T extends string>(rel: T): State<TStateSchema['relationships'][T]> {

    const result = this.relationships[rel];
    if (!result) {
      throw new Error('Relationship not found: ' + rel);
    }
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new Error('Relationship not found: ' + rel);
      }
      return result[0];
    }
    return result;

  }

}

/*
type ArticleSchema = {
  data: {
    title: string;
    body: string;
  },
  relationships: {
    author: AuthorSchema
  }
}

type AuthorSchema = {
  data: {
    name: string;
    website: string;
  }
  relationships: {};
}

const author = new State<AuthorSchema>({
  uri: '/author/1',
  data: {
    name: 'Evert',
    website: 'https://evertpot.com/'
  },
  relationships: {},

});

const article = new State<ArticleSchema>({
  uri: '/author/2',
  data: {
    title: 'Hello world',
    body: 'SUPPP',
  },
  relationships: {
    author
  }
});

const yo = article.follow('author');
console.debug(yo);

*/
