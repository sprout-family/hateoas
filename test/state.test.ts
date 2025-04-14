import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { State, StateSchema } from '../src/index.js';

/**
 * Note: This file doesn't really run any code, but exists to validate
 * assumptions about the types this package exports.
 */
type ArticleSchema = {
  data: {
    title: string;
    body: string;
  },
  relationships: {
    author: AuthorSchema
    category: CategorySchema | null
  }
}

/**
 * Interface should work the same as type
 */
interface AuthorSchema extends StateSchema {
  data: {
    name: string;
    website: string;
  }
}

interface CategorySchema extends StateSchema {
  data: {
    name: string;
  }
}


describe('State Schemas', () => {
  it('Should allow instantiating a State graph', () => {

    const author = new State<AuthorSchema>({
      uri: '/author/1',
      data: {
        name: 'Evert',
        website: 'https://evertpot.com/'
      },
    });

    const article = new State<ArticleSchema>({
      uri: '/author/2',
      data: {
        title: 'Hello world',
        body: 'SUPPP',
      },
      relationships: {
        author,
        category: null
      }
    });

    const yo = article.follow('author');
    assert.strictEqual(yo, author);

  });
});
