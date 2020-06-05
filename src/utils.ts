import { UsePaginationStatus } from '.';

export function shouldFetchPage(caching: boolean, currentPageItems: any[], status: UsePaginationStatus): boolean {
  // In case caching is enabled and we haven't fetched the page yet
  if (caching && !currentPageItems) return true;
  // In case caching is enabled and we have already fetched and cached the page
  if (caching && currentPageItems) return false;
  // In case caching is disabled and we have already fetched the page ( the status is LOADING when we haven't fetched the new page)
  if (currentPageItems && status !== UsePaginationStatus.LOADING) return false;
  return true;
}
