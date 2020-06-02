import { useState, useEffect } from 'react';

export enum UsePaginationStatus {
  LOADING,
  FAILLED,
  SUCCESS,
}

export interface UsePaginationProps<T> {
  currentPage: number;
  status: UsePaginationStatus;
  changePage: (page: number) => void;
  currentPageItems: T[];
  changeMaxPage: (maxPage: number) => void;
  maxPage: number;
  totalCount: number;
}

export interface UsePaginationResposne<T> {
  pageItems: T[];
  totalCount: number;
}

export default function usePagination<T>(
  fetchPage: (page: number, maxPerPage: number) => Promise<UsePaginationResposne<T>> | UsePaginationResposne<T>,
  maxPage: number = 10,
  defaultPage: number = 0,
  cache: boolean = true,
): UsePaginationProps<T> {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [totalCount, setTotalCount] = useState(0);
  const [maxPerPage, setMaxPerPage] = useState(maxPage);
  const [pages, setPages] = useState<{ [page: number]: T[] }>({});
  const changePage = (page: number) => {
    setCurrentPage(page);
  };
  const changeMaxPage = (_newMaxPage: number) => {
    setMaxPerPage(_newMaxPage);
  };
  useEffect(() => {
    if (cache && !pages[currentPage]) {
      Promise.resolve(fetchPage(currentPage, maxPerPage)).then((response: UsePaginationResposne<T>) => {
        setPages((_pages) => {
          _pages[currentPage] = response.pageItems;
          return _pages;
        });
        setTotalCount(response.totalCount);
      });
    }
  }, [cache, pages, currentPage, setTotalCount, setPages, fetchPage]);
  return {
    totalCount,
    currentPage,
    maxPage: maxPerPage,
    currentPageItems: pages[currentPage],
    status: UsePaginationStatus.SUCCESS,
    changePage,
    changeMaxPage,
  };
}
