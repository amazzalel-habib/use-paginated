import usePagination, { FetchPageResposne } from '../usePagination';
import { UsePaginationProps, UsePaginationStatus } from '..';
import { renderHook, act } from '@testing-library/react-hooks';

type T = { name: string };
const data: { [page: number]: T[] } = {
  1: [{ name: 'name1-0' }, { name: 'name1-1' }],
  2: [{ name: 'name2-0' }, { name: 'name2-1' }],
  3: [{ name: 'name3-0' }],
};

const mockPageFetched = jest.fn(
  (page: number, maxPerPage: number): Promise<FetchPageResposne<T>> => {
    return Promise.resolve({
      pageItems: data[page],
      totalCount: 5,
    });
  },
);

describe('use-pagination', () => {
  beforeEach(() => {
    mockPageFetched.mockClear();
  });
  it('should exist', () => {
    expect(usePagination).toBeDefined();
  });
  it('should work and prepare for loading the first page', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: true,
        maxPerPage: 2,
      }),
    );
    const hooks = renderHookResult.result.current;
    expect(mockPageFetched).toBeCalledTimes(1);
    expect(hooks.currentPageItems).toStrictEqual([]);
    expect(hooks.maxPerPage).toBe(2);
    expect(hooks.currentPage).toBe(1);
    expect(hooks.totalCount).toBe(0);
    expect(hooks.loadingStatus).toBe(UsePaginationStatus.LOADING);
    expect(hooks.loadingStatusMessage).toBe('Loading');
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
    });
  });
  it('should load the default page', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: true,
        maxPerPage: 2,
      }),
    );
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
    });
    const hooks = renderHookResult.result.current;
    expect(mockPageFetched).toBeCalledTimes(1);
    expect(hooks.currentPageItems).toBe(data[1]);
    expect(hooks.maxPerPage).toBe(2);
    expect(hooks.currentPage).toBe(1);
    expect(hooks.totalCount).toBe(5);
    expect(hooks.loadingStatus).toBe(UsePaginationStatus.SUCCESS);
    expect(hooks.loadingStatusMessage).toBe('Loaded');
  });
  it('should load the next page when calling nextPage', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: true,
        maxPerPage: 2,
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      hooks = renderHookResult.result.current;
      expect(hooks.loadingStatus).toBe(UsePaginationStatus.LOADING);
      await renderHookResult.waitForNextUpdate();
    });
    hooks = renderHookResult.result.current;
    expect(mockPageFetched).toBeCalledTimes(2);
    expect(hooks.currentPageItems).toBe(data[2]);
    expect(hooks.maxPerPage).toBe(2);
    expect(hooks.currentPage).toBe(2);
    expect(hooks.totalCount).toBe(5);
    expect(hooks.totalPages).toBe(3);
    expect(hooks.loadingStatus).toBe(UsePaginationStatus.SUCCESS);
    expect(hooks.loadingStatusMessage).toBe('Loaded');
  });

  it('should not reload a page when caching is enabled', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: true,
        maxPerPage: 2,
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.previousPage();
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      await renderHookResult.waitForNextUpdate();
    });
    expect(mockPageFetched).toBeCalledTimes(2);
  });
  it('should reload a page when caching is disabled', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: false,
        maxPerPage: 2,
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.previousPage();
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      await renderHookResult.waitForNextUpdate();
    });
    expect(mockPageFetched).toBeCalledTimes(4);
  });

  it('should reload a page when changing max per page', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: true,
        maxPerPage: 2,
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.nextPage();
      await renderHookResult.waitForNextUpdate();
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.changeMaxPerPage(3);
      await renderHookResult.waitForNextUpdate();
    });
    expect(mockPageFetched).toBeCalledTimes(3);
  });
  it('should return error when loading a page fails', async () => {
    const faillingFetcher = jest.fn(() => Promise.reject('Some error'));
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: faillingFetcher,
        caching: false,
      }),
    );
    await act(async () => {
      await renderHookResult.waitForNextUpdate({
        suppressErrors: false,
      });
      const hooks = renderHookResult.result.current;
      expect(faillingFetcher).toBeCalledTimes(1);
      expect(hooks.loadingStatus).toBe(UsePaginationStatus.FAILLED);
    });
  });

  it('should not change if trying to change to unexisting page', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        defaultPage: 1,
        caching: false,
        maxPerPage: 5,
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      hooks.changePage(4);
      await renderHookResult.waitForNextUpdate();
      hooks = renderHookResult.result.current;
      expect(hooks.currentPage).toBe(1);
    });
    await act(async () => {
      hooks = renderHookResult.result.current;
      hooks.previousPage();
      hooks = renderHookResult.result.current;
      expect(hooks.currentPage).toBe(1);
      hooks.nextPage();
      hooks = renderHookResult.result.current;
      expect(hooks.currentPage).toBe(1);
    });
  });
  it('should return 0 pages when maxPerPage is 0', async () => {
    const renderHookResult = renderHook<{}, UsePaginationProps<T>>(() =>
      usePagination<T>({
        fetchPage: mockPageFetched,
        maxPerPage: 0
      }),
    );
    let hooks = renderHookResult.result.current;
    await act(async () => {
      await renderHookResult.waitForNextUpdate();
      hooks = renderHookResult.result.current;
      expect(hooks.totalPages).toBe(0);
    });
  });
});
