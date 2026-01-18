export const CACHE_KEYS = {
  pokemon: {
    species: (identifier: string) => `pokemon:${identifier}`,
    form: (identifier: string) => `pokemon:form:${identifier}`,
    search: 'pokemon:search',
  },
  articles: {
    article: (identifier: string) => `articles:${identifier}`,
    search: 'articles:search',
  },
} as const;
