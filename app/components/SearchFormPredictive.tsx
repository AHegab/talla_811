import React, { useEffect, useRef } from 'react';
import {
    useFetcher,
    useNavigate,
    type Fetcher,
    type FormProps,
} from 'react-router';
import type { PredictiveSearchReturn } from '~/lib/search';
import { useAside } from './Aside';

type SearchFormPredictiveChildren = (args: {
  fetchResults: (event: React.ChangeEvent<HTMLInputElement>) => void;
  goToSearch: () => void;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  fetcher: Fetcher<PredictiveSearchReturn>;
}) => React.ReactNode;

type SearchFormPredictiveProps = Omit<FormProps, 'children'> & {
  children: SearchFormPredictiveChildren | null;
};

export const SEARCH_ENDPOINT = '/search';

/**
 *  Search form component that sends search requests to the `/search` route
 **/
export function SearchFormPredictive({
  children,
  className = 'predictive-search-form',
  ...props
}: SearchFormPredictiveProps) {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'});
  const inputRef = useRef<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const aside = useAside();

  /** Reset the input value and blur the input */
  function resetInput(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (inputRef?.current?.value) {
      inputRef.current.blur();
    }
  }

  /** Navigate to the search page with the current input value */
  function goToSearch() {
    const term = inputRef?.current?.value;
    void navigate(SEARCH_ENDPOINT + (term ? `?q=${term}` : ''));
    aside.close();
  }

  /** Fetch search results based on the input value */
  function fetchResults(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value || '';
    // debounce submissions to avoid excessive requests
    if ((fetchResults as any)._timer) {
      clearTimeout((fetchResults as any)._timer);
    }

    (fetchResults as any)._timer = setTimeout(() => {
      // only fetch predictive results for queries longer than 3 characters
      if (value.trim().length > 3) {
        void fetcher.submit(
          {q: value, limit: 5, predictive: true},
          {method: 'GET', action: SEARCH_ENDPOINT},
        );
      } else {
        // clear predictive results when query is too short
        void fetcher.submit(
          {q: '', limit: 0, predictive: true},
          {method: 'GET', action: SEARCH_ENDPOINT},
        );
      }
    }, 220);
  }

  // ensure the passed input has a type of search, because SearchResults
  // will select the element based on the input
  useEffect(() => {
    inputRef?.current?.setAttribute('type', 'search');
  }, []);

  if (typeof children !== 'function') {
    return null;
  }

  const formAction = (props as any).action ?? SEARCH_ENDPOINT;

  return (
    <fetcher.Form
      {...props}
      action={formAction}
      className={className}
      onSubmit={resetInput}
      data-turbo="false"
    >
      {children({inputRef, fetcher, fetchResults, goToSearch})}
    </fetcher.Form>
  );
}
