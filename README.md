# use-paginator

![npm](https://img.shields.io/npm/v/use-paginator)
[![Build Status](https://travis-ci.org/amazzalel-habib/use-paginator.svg?branch=master)](https://travis-ci.org/amazzalel-habib/use-paginator)
[![Coverage Status](https://coveralls.io/repos/github/amazzalel-habib/use-paginator/badge.svg?branch=master)](https://coveralls.io/github/amazzalel-habib/use-paginator?branch=master)

use-paginator library provide a helpful react hook for implementing pagination.

## Install

`npm install --save use-paginator`

## Usage

Very easy to use. Just provide the options to the hook `usePagination` and you will get everything you need to render and change between pages.

```typescript
function usePagination<T>(options: UsePaginationOptions<T>): UsePaginationProps<T>

interface UsePaginationOptions<T> {
  fetchPage: (page: number, maxPerPage: number) => Promise<FetchPageResposne<T>> | FetchPageResposne<T>;
  maxPerPage?: number;
  caching?: boolean;
  defaultPage?: number;
}
```

`maxPerPage`: is the number of items per page, you can change it with `changeMaxPerPage`.  

`caching`: default to `true`, to disable or enable caching of the pages, to optimize number of fething requests.  

`defaultPage`: default to 1, is the default page to load in when the component mount.

`fetchPage`: is a function that should load the data (from source ...) it should return an object of type `FetchPageResposne<T>` containing the page items and the total number of elements.

```typescript
interface FetchPageResposne<T> {
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
import usePagination, { FetchPageResposne } from "use-paginator";

type User = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
};
function adaptFakeData(data: any): FetchPageResposne<User> {
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
