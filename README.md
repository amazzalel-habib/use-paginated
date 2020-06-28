# use-paginated

[![npm](https://img.shields.io/npm/v/use-paginated)](https://www.npmjs.com/package/use-paginated)
[![Build Status](https://travis-ci.org/amazzalel-habib/use-paginated.svg?branch=master)](https://travis-ci.org/amazzalel-habib/use-paginated)
[![Coverage Status](https://coveralls.io/repos/github/amazzalel-habib/use-paginated/badge.svg)](https://coveralls.io/github/amazzalel-habib/use-paginated)

**use-paginated** library provides a helpful react hook for implementing pagination logic in [React](https://reactjs.org/).  

This is not a *UI* component, if you want a library for rendering a UI pagination bar you can think of [react-js-pagination
](https://www.npmjs.com/package/react-js-pagination) which by the way can be used easily with **use-paginated** library.

This library uses React hooks and local state, so any loaded pages data will be stored localy in the component. In the upcoming versions of this library we may add support for storing the data in a redux store...

## Install

`npm install --save use-paginated`

## Usage

Very easy to use. Just provide the options to the hook `usePagination` and you will get everything you need to render and change between pages.

```typescript
function usePagination<T>(options: UsePaginationOptions<T>): UsePaginationProps<T>

interface UsePaginationOptions<T> {
  fetchPage: (page: number, maxPerPage: number) => Promise<FetchPageResponse<T>> | FetchPageResponse<T>;
  maxPerPage?: number;
  caching?: boolean;
  defaultPage?: number;
}
```

`maxPerPage`: is the number of items per page, you can change it using `changeMaxPerPage`.  

`caching`: default to `true`, to disable or enable caching of loaded data in order to optimize the number of fething requests.  

`defaultPage`: default to 1, is the default page to load when the component mounts.

`fetchPage`: is a function that should load the data (from a source...) it should return a promise or simple object of type `FetchPageResponse<T>` containing the page items and the total number of elements.

```typescript
interface FetchPageResponse<T> {
  pageItems: T[];
  totalCount: number;
}
interface UsePaginationProps<T> {
  currentPage: number;
  loadingStatus: UsePaginationStatus; // The status of loading the current page
  loadingStatusMessage?: string; // A message error when loading the page failed
  changePage: (page: number) => void; // to change current page
  nextPage: () => void; // To load next page
  previousPage: () => void; // to load previous page
  currentPageItems: T[]; // The content of the current page, that should be displayed
  changeMaxPage: (maxPage: number) => void;
  maxPerPage: number;
  totalCount: number; // Total number of items
  totalPages: number; // Number of pages
}
```

## Example

```typescript
import React, { useState } from "react";
import usePagination, { FetchPageResponse } from "use-paginated";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};
function adaptFakeData(data: any): FetchPageResponse<User> {
  return {
    pageItems: data.data,
    totalCount: data.total,
  };
}
const fetchPage = (page: number, maxPerPage: number) => {
    // This is a fake api I found in the net
  return fetch(
    `https://reqres.in/api/users?page=${page}&per_page=${maxPerPage}`
  )
    .then((response) => response.json())
    .then((data) => adaptFakeData(data));
};

function App() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(3);
  const {
    totalCount,
    currentPage,
    maxPerPage,
    currentPageItems,
    loadingStatus,
    loadingStatusMessage,
    changePage,
    nextPage,
    previousPage,
    changeMaxPerPage,
    totalPages,
  } = usePagination({
    fetchPage,
    caching: true,
    defaultPage: 1,
    maxPerPage: perPage
  });
  const onPerPageChange = (event: any) =>{
    if(event.currentTarget.value && event.currentTarget.value !== "")
      setPerPage(parseInt(event.currentTarget.value))
  }
  const onPageChange = (event: any) =>{
    if(event.currentTarget.value && event.currentTarget.value !== "")
      setPage(parseInt(event.currentTarget.value))
  }
  return <div>
      <pre>
        { JSON.stringify(currentPageItems, null, 2 )}
      </pre>
      <p>{"Current page:"} {currentPage}</p>
      <p>{"Loading status:"} {loadingStatus}</p>
      <p>{"Loading status message:"} {loadingStatusMessage}</p>
      <p>{"Total count:"} {totalCount}</p>
      <p>{"Max per page:"} {maxPerPage}</p>
      <p>{"Number of pages:"} {totalPages}</p>
      <button onClick={previousPage} disabled={currentPage === 1}> {"Previous"} </button>
      <button onClick={nextPage} disabled={currentPage === totalPages}> {"Next"} </button>
      <input type="number" value={page} onChange={onPageChange} />
      <button onClick={() => changePage(page)} disabled={page > totalPages || page < 1}> {"Go to this page"} </button>
      <input type="number" value={perPage} onChange={onPerPageChange} />
      <button onClick={() => changeMaxPerPage(perPage)}> {"Change max per page"} </button>

  </div>;
}

export default App;

```

## Feedback

If you have any feedback or interested in imporving this library, please send a PR or post an issue.
