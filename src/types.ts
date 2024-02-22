/**
 * The StateSchema represents the general shape of the resource and tells us
 * what properties exists in the State class, and what kind of relationships it
 * has to other states.
 */
export interface StateSchema {
  data: Record<string, any>;
  metadata?: Record<string, any>;
  relationships: Record<string, StateSchema>;
}


/**
 * This utility schema represents the usual shape of a collection.
 */
export interface CollectionOf<T extends StateSchema> extends StateSchema {

  data: {
    total: number;
  };

  relationships: {
    item: T;
  };


}
