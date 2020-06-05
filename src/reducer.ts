import { PagesStateType, UsePaginationStatus } from './usePagination';
import {
  UsePaginationActionsType,
  CHANGE_PAGE,
  CHANGE_MAX_PER_PAGE,
  LOAD_PAGE_SUCCESS,
  LOAD_PAGE_FAILURE,
} from './actions';
import { shouldFetchPage } from './utils';

export type PaginationReducerType<T> = (
  state: PagesStateType<T>,
  action: UsePaginationActionsType<T>,
) => PagesStateType<T>;

export default function usePaginationReducer<T>(
  state: PagesStateType<T>,
  action: UsePaginationActionsType<T>,
): PagesStateType<T> {
  switch (action.type) {
    case CHANGE_PAGE:
      if (shouldFetchPage(state.caching, state.content[action.page], state.loadingStatus)) {
        return {
          ...state,
          currentPage: action.page,
          loadingStatusMessage: 'Loading',
          loadingStatus: UsePaginationStatus.LOADING,
        };
      }
      return {
        ...state,
        currentPage: action.page,
      };
    case CHANGE_MAX_PER_PAGE:
      return {
        ...state,
        content: {},
        maxPerPage: action.maxPerPage,
      };
    case LOAD_PAGE_SUCCESS:
      let newContent = state.content;
      if (state.caching) {
        newContent = { ...newContent, [state.currentPage]: action.items };
      } else {
        newContent = { [state.currentPage]: action.items };
      }
      return {
        ...state,
        content: newContent,
        totalCount: action.totalCount,
        loadingStatus: UsePaginationStatus.SUCCESS,
        loadingStatusMessage: 'Loaded',
      };
    case LOAD_PAGE_FAILURE:
      return {
        ...state,
        loadingStatus: UsePaginationStatus.FAILLED,
        loadingStatusMessage: action.error,
      };
    default:
      return state;
  }
}
