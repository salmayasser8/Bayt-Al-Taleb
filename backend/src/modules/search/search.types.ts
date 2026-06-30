export type SearchableType = 'major' | 'scholarship' | 'file';

export interface SearchQuery {
  term: string;
  types?: SearchableType[];
  page: number;
  pageSize: number;
}

export interface SearchHit {
  type: SearchableType;
  id: string;
  title: string;
  slug?: string;
  score?: number;
}

export interface SearchResults {
  query: string;
  hits: SearchHit[];
  total: number;
  page: number;
  pageSize: number;
}

export interface SearchProvider {
  search(query: SearchQuery): Promise<SearchResults>;
}