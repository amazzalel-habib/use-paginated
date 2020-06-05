import { useEffect, useReducer } from 'react';
import { changeMaxPerPageAction, changePageAction, loadPageSuccessAction, loadPageFailureAction } from './actions';
import usePaginationReducer, { PaginationReducerType } from './reducer';
import { shouldFetchPage } from './utils';

export enum UsePaginationStatus {
  LOADING = 'LOADING',
  FAILLED = 'FAILLED',
  SUCCESS = 'SUCCESS',
}

export interface UsePaginationProps<T> {
  currentPage: number;
  loadingStatus: UsePaginationStatus;
  loadingStatusMessage?: string;
  changePage: (page: number) => void;
  currentPageItems: T[];
  changeMaxPage: (maxPage: number) => void;
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
export interface FetchPageResposne<T> {
  pageItems: T[];
  totalCount: number;
}
export interface UsePaginationOptions<T> {
  fetchPage: (page: number, maxPerPage: number) => Promise<FetchPageResposne<T>> | FetchPageResposne<T>;
  maxPerPage?: number;
  caching?: boolean;
  defaultPage?: number;
}
export default function usePagination<T>({
  fetchPage,
  maxPerPage = 10,
  caching = true,
  defaultPage = 0,
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
  const changePage = (page: number) => {
    dispatch(changePageAction(page));
  };
  const changeMaxPage = (_maxPerPage: number) => {
    dispatch(changeMaxPerPageAction(_maxPerPage));
  };

  useEffect(() => {
    // If caching data is not disactivated or activated but current page is not yet fetched
    // go and fetch it
    if (shouldFetchPage(caching, currentPageContent, currentLoadingStatus)) {
      (async () => {
        try {
          const response: FetchPageResposne<T> = await fetchPage(currentPage, maxPerPage);
          dispatch(loadPageSuccessAction(response.pageItems, response.totalCount));
        } catch (error) {
          dispatch(loadPageFailureAction(error));
        }
      })();
    }
  }, [caching, currentPage, currentPageContent, currentLoadingStatus, fetchPage]);

  let totalPages = 0; 
  if(state.maxPerPage > 0 ){
    totalPages = Math.ceil(state.totalCount / state.maxPerPage);
  }
  return {
    totalCount: state.totalCount,
    currentPage: state.currentPage,
    maxPerPage: state.maxPerPage,
    currentPageItems: currentPageContent ? currentPageContent : [],
    loadingStatus: state.loadingStatus,
    loadingStatusMessage: state.loadingStatusMessage,
    changePage,
    changeMaxPage,
    totalPages
  };
}
