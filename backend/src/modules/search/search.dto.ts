import type { SearchableType } from './search.types.js';

export interface SearchHitDto {
  type: SearchableType;
  id: string;
  title: string;
  slug?: string;
  score?: number;
}

export interface SearchResultsDto {
  query: string;
  hits: SearchHitDto[];
  total: number;
  page: number;
  pageSize: number;
}
