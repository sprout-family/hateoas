// Example from README
import { State, StateSchema, stateToHal, stateToSiren } from '../src/index.js';

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


const author = new State<AuthorSchema>({
  title: 'This is an author resource',
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

console.info(JSON.stringify(stateToHal(article)));
console.info(JSON.stringify(stateToSiren(article)));
