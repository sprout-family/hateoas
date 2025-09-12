import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { State, StateSchema } from '../src/index.js';

interface ArticleSchema extends StateSchema {
  data: {
    title: string;
    body: string;
  },
  relationships: {
    author: AuthorSchema
    category: CategorySchema | null
  }
}

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
        website: 'https://evertpot.com/',
      },
    });

    const article = new State<ArticleSchema>({
      uri: '/article/2',
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

  it('The type system should reject unknown properties when creating the State', () => {

    new State<AuthorSchema>({
      uri: '/author/1',
      data: {
        name: 'Evert',
        website: 'https://evertpot.com/',
        // @ts-expect-error we should get an error when using unknown properties.
        randomProp: 'should error',
      },
    });

  });

  it('The type system should error when accessing an optional relationship', () => {

    const author = new State<AuthorSchema>({
      uri: '/author/1',
      data: {
        name: 'Evert',
        website: 'https://evertpot.com/',
      },
    });
    const article = new State<ArticleSchema>({
      uri: '/article/2',
      data: {
        title: 'Hello world',
        body: 'SUPPP',
      },
      relationships: {
        author,
        category: null
      }
    });
    // We're not executing this code, just testing the type system.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () => {

      // @ts-expect-error category is optional, so we should get an error.
      const category = article.follow('category').data.name;
      console.info(category);;

    };

  });
  it('The type system should not error when accessing a required relationship', () => {

    const author = new State<AuthorSchema>({
      uri: '/author/1',
      data: {
        name: 'Evert',
        website: 'https://evertpot.com/',
      },
    });
    const article = new State<ArticleSchema>({
      uri: '/article/2',
      data: {
        title: 'Hello world',
        body: 'SUPPP',
      },
      relationships: {
        author,
        category: null
      }
    });
    // We're not executing this code, just testing the type system.
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    () => {

      const author = article.follow('author').data.name;
      console.info(author);

    };

  });

  it('followAll() should return all linked states for a given rel', () => {

    const category1 = new State<CategorySchema>({
      uri: '/category/1',
      data: {
        name: 'Category 1',

      }
    });

    const category2 = new State<CategorySchema>({
      uri: '/category/2',
      data: {
        name: 'Category 2',
      }
    });

    const author = new State<AuthorSchema>({
      uri: '/author/1',
      data: {
        name: 'Evert',
        website: 'https://evertpot.com/',
      },
    });

    const article = new State<ArticleSchema>({
      uri: '/article/2',
      data: {
        title: 'Hello world',
        body: 'SUPPP',
      },
      relationships: {
        author,
        category: [category1, category2],
      }
    });

    const categories = article.followAll('category');
    assert.strictEqual(categories.length, 2);
    assert.strictEqual(categories[0], category1);
    assert.strictEqual(categories[1], category2);

    const authors = article.followAll('author');
    assert.strictEqual(authors.length, 1);
    assert.strictEqual(authors[0], author);

   const noResults = article.followAll('non-existing' as any);
   assert.strictEqual(noResults.length, 0);

  });

});
