HATEOAS Toolkit for Javascript
==============================

This is an experimental package for making it easier to work with HATEOAS-style
APIs in Javascript on both the server and client-side.

The goals of this package is to provide some foundational types and utilities
to describe and pass resources, their links and relationships.

This fills a gap in the ecosystem. There are libraries that describe APIs,
but few that help you with following links and typing of resources after
following a link.

Likewise there are some tools that help you build HAL or Siren payloads, but
again fall short when it comes to strictly describe type of the full graph
of a HATOEAS API.

Note that this package is **experimental**. It's actively developed alongside
an internal API at Sprout, and is being used in production. It's subject to
change as our understanding of the problem domain evolves. We do however follow
semver.

If you're interested in going on this journey, we welcome any feedback. The
footprint of the library is small and we don't expect to bring in any
dependencies, so forking is also encouraged if you need a stable version.

What kind of HATEOAS formats will this library support?
-------------------------------------------------------

Our hope is to create an abstract, agnostic schema that can be used for a
variety of HATEOAS formats. Our focus is on HAL and Siren, but as long as
the following concepts can be easily translated more formats can be added.

* links, that appear at the top-level of a resource.
* embedded resources + their links.
* actions (called `_templates` in HAL Forms, `actions` in siren and `<form>` in HTML).

Notabily, we probably will never support the JSON-LD ecosystem. JSON-LD
is extremely flexible, and supporting it would imply we'd either need to
restrict JSON-LD support to a very narrow (not that useful) subset, or
the API of this library needs to effectively become an application of
[Linked Data][1], and instead creating mappings from other formats to this
kind of data model.

We just want to make it easier to describe and work with 'JSON + links'-style$
formats. 

What the library actually does
-------------------------------

Right now this library is only used for 1 use-case, specifying the HATEOAS
graph as a Typescript type, and generating HAL and Siren responses from a Node.js
server.

### Example

The following example describes 3 resources, a 'Article', 'Author' and 'Category'.
Articles have a link to their author and category. Categories are optional.


```typescript
import { State, StateSchema, stateToHal, stateToSiren } from '@sproutfamily/hateoas';

interface ArticleSchema extends StateSchema {
  data: {
    title: string;
    subtitle?: string;
    body: string;
  },
  relationships: {

    // Author linked resource, which is required.
    author: AuthorSchema

    // If a relationship includes | null, it's optional.
    category: CategorySchema | null
  }
}

interface AuthorSchema extends StateSchema {
  data: {
    name: string;
    pronouns: string;
  }
}

interface CategorySchema extends StateSchema {
  data: {
    name: string;
  }
}
```

The 'StateSchema' type describes a resource, it's properties (in `data`) and
what other kinds of resources it links to (in `relationships`).

Now, to create a 'State' object, you are required to provide any relationhips
that were non-optional.

```typescript
const author = new State<AuthorSchema>({
  // Some HATEOAS formats have a title property. This is a kind of 
  // meta-data, and we'll inject it in the format if possible. You
  title: 'This is an author resource',

  // Resources should have a URI. This can be relative
  uri: '/author/1',
  data: {
    name: 'Evert',
    pronouns: 'he/him'
  },
});

const article = new State<ArticleSchema>({
  title: 'This is an article resource',
  uri: '/article/hello-world',
  data: {
    title: 'Hello world',
    body: 'SUPPP',
  },
  relationships: {
    author,
    category: null
  }
});


```

Finally, to turn this State object into a HAL or Siren response:

#### HAL

```typescript
console.log(JSON.stringify(stateToHal(article)));
```

Output:

```json
{
  "_links": {
    "self": {
      "href": "/article/hello-world",
      "title": "This is an article resource"
    },
    "author": {
      "href": "/author/1",
      "title": "This is an author resource"
    }
  },
  "title": "Hello world",
  "body": "SUPPP"
}
```

#### Siren 

```typescript
console.log(JSON.stringify(stateToSiren(article)));
```

Output:

```json
{
  "properties": {
    "title": "Hello world",
    "body": "SUPPP"
  },
  "title": "This is an article resource",
  "links": [
    {
      "rel": [
        "self"
      ],
      "href": "/author/2"
    }
  ],
  "entities": [
    {
      "rel": [
        "author"
      ],
      "href": "/author/1",
      "title": "This is an author resource"
    }
  ]
}
```


Things that don't yet work
--------------------------

There's a lot of things that are needed for this library to be useful for
80% of use-cases, but here's some major things:

* deserializing HAL and Siren payloads into State objects.
* embedding instead of linking
* allowing relationhips in the State object to be specified as Links instead of
  full-blown objects.
* Recursive relationships (possible in schemas, not yet in State objects due
  to that fact that full 'State' objects are required for relationships).
* Let users specify 'at most 1 link' for a relationships. Right now if a
  relationship exists in a StateSchema, it implies 0 or more for optional or
  1 or more for required relantionships.

Slightly later:

* Actions (HAL Forms, Siren actions, HTML forms).
* Hooks for resolving remote resources. (required for building clients).
* Support for Collection+JSON, JSON-LD and others.
* Support for automatically instantiating a State from a [Request][2] object.



Installation
------------

    npm i @sproutfamily/hateoas


Getting started
---------------

...

API
---

...

[1]: https://en.wikipedia.org/wiki/Linked_data
[2]: https://developer.mozilla.org/en-US/docs/Web/API/Request
