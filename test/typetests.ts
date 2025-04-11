import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { State } from '../src/state.js';

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
  }
}

type AuthorSchema = {
  data: {
    name: string;
    website: string;
  }
  relationships: {};
}


describe('State Schemas', () => {
  it('Should be correct from a Typescript perspective and pass basic tests', () => {

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
    assert.strictEqual(yo, author);

  });
});
