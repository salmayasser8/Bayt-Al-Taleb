import type { SearchProvider, SearchResults, SearchableType } from './search.types.js';
import type { SearchQueryInput } from './search.validation.js';

/**
 * SearchService — thin orchestration over a pluggable SearchProvider.
 * Normalizes the query and delegates to the injected provider.
 */
export class SearchService {
  constructor(private readonly provider: SearchProvider) {}

  async search(input: SearchQueryInput): Promise<SearchResults> {
    return this.provider.search({
      term:     input.q.trim(),
      types:    input.types as SearchableType[] | undefined,
      page:     input.page,
      pageSize: input.pageSize,
    });
  }
}