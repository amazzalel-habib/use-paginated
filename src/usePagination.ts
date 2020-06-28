import { useEffect, useReducer } from 'react';
import { changeMaxPerPageAction, changePageAction, loadPageSuccessAction, loadPageFailureAction } from './actions';
import usePaginationReducer, { PaginationReducerType } from './reducer';
import { shouldFetchPage } from './utils';

export enum UsePaginationStatus {
  LOADING = 'LOADING',
  FAILED = 'FAILED',
  SUCCESS = 'SUCCESS',
}

export interface UsePaginationProps<T> {
  currentPage: number;
  loadingStatus: UsePaginationStatus;
  loadingStatusMessage?: string;
  changePage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  currentPageItems: T[];
  changeMaxPerPage: (maxPage: number) => void;
  maxPerPage: number;
  totalCount: number;
  totalPages: number;
}
export interface PagesStateType<T> {
  totalCount: number;
  content: { [page: number]: T[] };
  loadingStatus: UsePaginationStatus;
  loadingStatusMessage?: string;
  currentPage: number;
  maxPerPage: number;
  caching: boolean;
}
export interface FetchPageResponse<T> {
  pageItems: T[];
  totalCount: number;
}
export interface UsePaginationOptions<T> {
  fetchPage: (page: number, maxPerPage: number) => Promise<FetchPageResponse<T>> | FetchPageResponse<T>;
  maxPerPage?: number;
  caching?: boolean;
  defaultPage?: number;
}
export default function usePagination<T>({
  fetchPage,
  maxPerPage = 10,
  caching = true,
  defaultPage = 1,
}: UsePaginationOptions<T>): UsePaginationProps<T> {
  const defaultState: PagesStateType<T> = {
    totalCount: 0,
    content: {},
    loadingStatus: UsePaginationStatus.LOADING,
    loadingStatusMessage: 'Loading',
    currentPage: defaultPage,
    maxPerPage,
    caching,
  };
  const [state, dispatch] = useReducer<PaginationReducerType<T>>(usePaginationReducer, defaultState);
  const currentPage = state.currentPage;
  const currentPageContent = state.content[currentPage];
  const currentLoadingStatus: UsePaginationStatus = state.loadingStatus;
  let totalPages = 0;
  if (state.maxPerPage > 0) {
    totalPages = Math.ceil(state.totalCount / state.maxPerPage);
  }

  const changePage = (page: number) => {
    if (page <= totalPages && page >= 1) dispatch(changePageAction(page));
  };
  const changeMaxPerPage = (_maxPerPage: number) => {
    dispatch(changeMaxPerPageAction(_maxPerPage));
    // Load the first page as we don't know how many pages there will be with this changes
    changePage(1);
  };
  const nextPage = () => {
    if (currentPage + 1 <= totalPages) changePage(currentPage + 1);
  };
  const previousPage = () => {
    if (currentPage > 1) changePage(currentPage - 1);
  };
  useEffect(() => {
    // If caching data is not disactivated or activated but current page is not yet fetched
    // go and fetch it
    if (shouldFetchPage(caching, currentPageContent, currentLoadingStatus)) {
      (async () => {
        try {
          const response: FetchPageResponse<T> = await fetchPage(currentPage, maxPerPage);
          dispatch(loadPageSuccessAction(response.pageItems, response.totalCount));
        } catch (error) {
          dispatch(loadPageFailureAction(error));
        }
      })();
    }
  }, [caching, currentPage, currentPageContent, currentLoadingStatus, fetchPage]);

  return {
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    maxPerPage: state.maxPerPage,
    currentPageItems: currentPageContent ? currentPageContent : [],
    loadingStatus: state.loadingStatus,
    loadingStatusMessage: state.loadingStatusMessage,
    changePage,
    nextPage,
    previousPage,
    changeMaxPerPage,
    totalPages,
  };
}
