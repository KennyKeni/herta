export const CACHE_KEYS = {
  pokemon: {
    species: (identifier: string) => `pokemon:${identifier}`,
    speciesGroup: (identifier: string) => `group:pokemon:${identifier}`,
    form: (identifier: string) => `pokemon:form:${identifier}`,
    formGroup: (identifier: string) => `group:pokemon:form:${identifier}`,
    search: 'pokemon:search',
    searchGroup: 'group:pokemon:search',
  },
  articles: {
    article: (identifier: string) => `articles:${identifier}`,
    articleGroup: (identifier: string) => `group:articles:${identifier}`,
    search: 'articles:search',
    searchGroup: 'group:articles:search',
  },
} as const;
