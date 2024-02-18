import { Link } from '@curveball/links';

type StateInit<T extends StateSchema> = {
  data: T['data'];
  links?: Link[];
  relationships: SchemaToStateRelationships<T['relationships']>;
  uri: string;
  title?: string;
}

type StateSchema = {
  data: Record<string, any>;
  relationships: Record<string, StateSchema>;
}

type SchemaDefaults = {
  data: Record<string, unknown>;
  relationships: Record<string, SchemaDefaults>;
}

type SchemaToStateRelationships<T extends Record<string, any>> = {
  [K in keyof T]: State<T[K]>[] | State<T[K]>;
}

/**
 * The State represents a past, current or desired state.
 *
 * This is sometimes called a Model or Entity in other systems.
 */
export class State<TStateSchema extends StateSchema = SchemaDefaults> {

  public uri?: string;
  public links: Link[];
  public data: TStateSchema['data'];
  public relationships: SchemaToStateRelationships<TStateSchema['relationships']>;
  public title?: string;

  constructor(init: StateInit<TStateSchema & SchemaDefaults>) {

    this.uri = init.uri;
    this.links = init.links ?? [];
    this.data = init.data;
    this.relationships = init.relationships;
    this.title = init.title;

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
