// CHANGE_PAGE
export const CHANGE_PAGE = 'CHANGE_PAGE';
type ChangePageAction = {
  type: typeof CHANGE_PAGE;
  page: number;
};
export const changePageAction = (page: number): ChangePageAction => ({
  type: CHANGE_PAGE,
  page,
});

// CHANGE_MAX_PER_PAGE
export const CHANGE_MAX_PER_PAGE = 'CHANGE_MAX_PER_PAGE';
type ChangeMaxPerPageAction = {
  type: typeof CHANGE_MAX_PER_PAGE;
  maxPerPage: number;
};
export const changeMaxPerPageAction = (maxPerPage: number): ChangeMaxPerPageAction => ({
  type: CHANGE_MAX_PER_PAGE,
  maxPerPage,
});

// LOAD_PAGE_SUCCESS
export const LOAD_PAGE_SUCCESS = 'LOAD_PAGE_SUCCESS';
type LoadPageSuccessAction<T> = {
  type: typeof LOAD_PAGE_SUCCESS;
  items: T[];
  totalCount: number;
};
export const loadPageSuccessAction = <T>(items: T[], totalCount: number): LoadPageSuccessAction<T> => ({
  type: LOAD_PAGE_SUCCESS,
  items,
  totalCount,
});

// LOAD_PAGE_FAILURE
export const LOAD_PAGE_FAILURE = 'LOAD_PAGE_FAILURE';
type LoadPageFailureAction = {
  type: typeof LOAD_PAGE_FAILURE;
  error: any;
};
export const loadPageFailureAction = (error: any): LoadPageFailureAction => ({
  type: LOAD_PAGE_FAILURE,
  error,
});

export type UsePaginationActionsType<T> =
  | ChangePageAction
  | ChangeMaxPerPageAction
  | LoadPageSuccessAction<T>
  | LoadPageFailureAction;
