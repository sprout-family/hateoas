import { Link } from '@curveball/links';
import { StateSchema } from './types.js';

/**
 * This type is what's passsed to the constructor of the State class.
 */
type StateInit<T extends StateSchema> = AllOptional<T> extends true ? {
  data: T['data'];
  metadata?: T['metadata'] extends Record<string,any> ? T['metadata'] : undefined;
  links?: Link[];
  relationships?: SchemaToInitRelationships<T['relationships']>;
  uri?: string;
  title?: string;
} : {
  data: T['data'];
  metadata?: T['metadata'] extends Record<string,any> ? T['metadata'] : undefined;
  links?: Link[];
  relationships: SchemaToInitRelationships<T['relationships']>;
  uri?: string;
  title?: string;
}

/**
 * This is effectively the 'any' State.
 */
type SchemaDefaults = {
  data: Record<string, any>;
  relationships: Record<string, StateSchema|null>;
}

/**
 * This helper type takes an object type T, and if all of its properties
 * are optional, it, it returns the 'true' type otherwise, it returns 'false'.
 */
type AllOptional<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K
} extends {
  [K in keyof T]: never
} ? false : true;


/**
 * A helper type that converts the relationships of a StateSchema to a Record<rel, State|State[]|null>
 *
 * If the relationships are optional, it allows null, making it more
 * convenient to create a State.
 */
type SchemaToInitRelationships<T extends Record<string, any>> = {
  [K in keyof T]:
    // Relationship link
    | State<NonNullable<T[K]>>
    // Multiple may be specified
    | State<NonNullable<T[K]>>[]
    // If the relationship is optional we allow null.
    | (null extends T[K] ? null : never);
};

/**
 * A helper type that converts the relationships of a StateSchema to a Record<rel, State|State[]>
 *
 * Unlike SchemaToInitRelationships, this type does not allow null.
 */
type SchemaToStateRelationships<T extends Record<string, any>> = {
  [K in keyof T]:
    // Relationship link
    | State<NonNullable<T[K]>>
    // Multiple may be specified
    | State<NonNullable<T[K]>>[];

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
    this.relationships = Object.fromEntries(
      Object.entries(init.relationships ?? {})
        .filter(([_, v]) => v !== null)
    ) as SchemaToStateRelationships<TStateSchema['relationships']>;

    this.title = init.title;
    this.metadata = init.metadata ?? {};

  }

  follow<T extends string>(rel: T): State<NonNullable<TStateSchema['relationships'][T]>> {

    const result = this.relationships[rel];
    if (!result) {
      throw new Error('Relationship not found: ' + rel);
    }
    if (Array.isArray(result)) {
      if (result.length === 0) {
        throw new Error('Relationship not found: ' + rel);
      }
      return result[0] as any;
    }
    return result as any;

  }

}
