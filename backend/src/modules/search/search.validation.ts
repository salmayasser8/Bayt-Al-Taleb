import { z } from 'zod';

export const searchQuerySchema = z.object({
  q:        z.string().min(1, 'Search term is required').max(200),
  types:    z.string().optional().transform(val =>
              val ? val.split(',').map(t => t.trim()) : undefined
            ),
  page:     z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;