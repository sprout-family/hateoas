import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { State, StateSchema, stateToHal } from '../src/index.js';

interface AuthorSchema extends StateSchema {
  data: {
    name: string;
  }
}

interface CommentSchema extends StateSchema {
  data: {
    body: string;
  }
}

interface ArticleSchema extends StateSchema {
  data: {
    title: string;
  };
  relationships: {
    author: AuthorSchema;
    comments?: CommentSchema | null;
    related?: ArticleSchema | null;
  };
}

describe('stateToHal _embedded behavior', () => {
  it('does not embed by default; uses _links for relationships', () => {
    const author = new State<AuthorSchema>({
      uri: '/authors/1',
      data: { name: 'Evert' },
    });

    const article = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Hello' },
      relationships: { author },
    });

    const hal = stateToHal(article);

    // _links.self
    assert.ok(hal._links);
    assert.deepEqual(hal._links!.self, { href: '/articles/1', title: undefined });

    // relationship should be a link (not embedded)
    assert.ok(hal._links!.author, 'author link should exist');
    if (Array.isArray(hal._links!.author)) throw new Error('expected single link');
    assert.equal((hal._links!.author as any).href, '/authors/1');
    assert.ok(!('_embedded' in hal), 'no _embedded by default');
  });

  it('embeds a single relationship when rel is in embedRels', () => {
    const author = new State<AuthorSchema>({ uri: '/authors/1', data: { name: 'Evert' } });

    const article = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Hello' },
      relationships: { author },
    });

    const hal = stateToHal(article, { embedRels: ['author'] });

    assert.ok(hal._embedded, 'expected _embedded');
    const embeddedAuthor = hal._embedded!.author as any;
    assert.ok(embeddedAuthor, 'expected embedded author');
    assert.equal(embeddedAuthor._links.self.href, '/authors/1');
    assert.equal(embeddedAuthor.name, 'Evert');

    // ensure no author link in _links (only self)
    assert.ok(!('author' in hal._links!), 'author should not appear in _links when embedded');
  });

  it('embeds multiple relationships of same rel as an array', () => {
    const c1 = new State<CommentSchema>({ uri: '/comments/1', data: { body: 'First' } });
    const c2 = new State<CommentSchema>({ uri: '/comments/2', data: { body: 'Second' } });

    const article = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Hello' },
      relationships: {
        author: new State<AuthorSchema>({ uri: '/authors/1', data: { name: 'Evert' } }),
        comments: [c1, c2],
      },
    });

    const hal = stateToHal(article, { embedRels: ['comments'] });

    assert.ok(hal._embedded, 'expected _embedded');
    const embeddedComments = hal._embedded!.comments as any[];
    assert.ok(Array.isArray(embeddedComments), 'comments should be array when multiple');
    assert.equal(embeddedComments.length, 2);
    assert.equal(embeddedComments[0]._links.self.href, '/comments/1');
    assert.equal(embeddedComments[1]._links.self.href, '/comments/2');

    // comments should not also appear in _links
    assert.ok(!('comments' in hal._links!));

    // author not embedded → remains link
    assert.ok('author' in hal._links!);
  });

  it('converts single embedded to array when same rel repeats', () => {
    const r1 = new State<ArticleSchema>({ uri: '/articles/2', data: { title: 'Rel 1' }, relationships: { author: new State<AuthorSchema>({ uri: '/authors/2', data: { name: 'A' } }) } });
    const r2 = new State<ArticleSchema>({ uri: '/articles/3', data: { title: 'Rel 2' }, relationships: { author: new State<AuthorSchema>({ uri: '/authors/3', data: { name: 'B' } }) } });

    const article = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Hello' },
      relationships: { author: new State<AuthorSchema>({ uri: '/authors/1', data: { name: 'Evert' } }), related: [r1, r2] },
    });

    const hal = stateToHal(article, { embedRels: ['related'] });

    const embeddedRelated = hal._embedded!.related as any[];
    assert.ok(Array.isArray(embeddedRelated));
    assert.equal(embeddedRelated.length, 2);
    assert.equal(embeddedRelated[0]._links.self.href, '/articles/2');
    assert.equal(embeddedRelated[1]._links.self.href, '/articles/3');
  });

  it('supports nested embedded resources recursively', () => {
    const innerAuthor = new State<AuthorSchema>({ uri: '/authors/2', data: { name: 'Inner' } });
    const innerArticle = new State<ArticleSchema>({
      uri: '/articles/2',
      data: { title: 'Inner Article' },
      relationships: { author: innerAuthor },
    });

    const outerArticle = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Outer Article' },
      relationships: { author: new State<AuthorSchema>({ uri: '/authors/1', data: { name: 'Outer' } }), related: innerArticle },
    });

    const hal = stateToHal(outerArticle, { embedRels: ['related', 'author'] });

    // Outer embeds related and author
    assert.ok(hal._embedded);
    assert.ok(hal._embedded!.related);
    assert.ok(hal._embedded!.author);

    // Related (inner) also embeds its author
    const embeddedRelated = hal._embedded!.related as any;
    assert.ok(embeddedRelated._embedded);
    assert.ok(embeddedRelated._embedded.author);
    assert.equal(embeddedRelated._embedded.author.name, 'Inner');
  });

  it('skips relationships without a uri and logs a warning', () => {
    // A relationship without uri should be skipped entirely
    const bad = new State<AuthorSchema>({ data: { name: 'No URI' } } as any);
    const good = new State<AuthorSchema>({ uri: '/authors/1', data: { name: 'Okay' } });

    const article = new State<ArticleSchema>({
      uri: '/articles/1',
      data: { title: 'Hello' },
      relationships: { author: [bad, good] as any },
    });

    const hal = stateToHal(article);

    // Only the good one should appear as a link
    assert.ok(hal._links);
    const authorLinks = (hal._links as any).author as any;
    assert.ok(authorLinks && !Array.isArray(authorLinks));
    assert.equal(authorLinks.href, '/authors/1');
  });
});
