/**
 * The StateSchema represents the general shape of the resource and tells us
 * what properties exists in the State class, and what kind of relationships it
 * has to other schemas.
 */
export interface StateSchema {
  data: Record<string, any>;
  metadata?: Record<string, any>;
  relationships: Record<string, StateSchema | null>;
  actions?: Record<string, ActionSchema>;
}


/**
 * This utility schema represents the usual shape of a collection.
 *
 * Using it is completely optional, but it's an exampel of how schemas
 * might be combined and composed.
 */
export interface CollectionOf<T extends StateSchema> extends StateSchema {

  data: {
    total: number;
  };

  relationships: {
    item: T;
  };

}

/**
 * This schema represents an action that can be performed on a resource.
 */
export interface ActionSchema {

  name: string;
  request: any;
  response: any;

}
