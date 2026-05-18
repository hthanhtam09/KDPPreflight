export const POSTS_PER_PAGE = 18

export type PaginatedResult<T> = {
  items: T[]
  totalItems: number
  totalPages: number
  currentPage: number
  hasPrev: boolean
  hasNext: boolean
}

export function paginateItems<T>(items: T[], page: number, perPage = POSTS_PER_PAGE): PaginatedResult<T> {
  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))
  const safePage = Math.max(1, Math.min(page, totalPages))
  const start = (safePage - 1) * perPage
  return {
    items: items.slice(start, start + perPage),
    totalItems,
    totalPages,
    currentPage: safePage,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  }
}

export function getBlogPageCount(totalPosts: number, perPage = POSTS_PER_PAGE): number {
  return Math.max(1, Math.ceil(totalPosts / perPage))
}

export function buildPageUrl(baseUrl: string, page: number): string {
  return page === 1 ? baseUrl : `${baseUrl}/page/${page}`
}
