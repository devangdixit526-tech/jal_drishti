import { useEffect, useState } from 'react';

/**
 * Runs an api.* call and reports { data, meta, loading, error }.
 *
 * Every screen needs the same three states - loading, loaded, failed - and
 * writing that by hand in each component is how inconsistent UIs happen.
 *
 * @param fetcher  (opts) => Promise<{data, meta}>  e.g. `(o) => api.listStates(o)`
 * @param deps     refetch whenever these values change
 * @param options  { skip } - true to not fetch yet (e.g. waiting on a selection)
 */
export function useApi(fetcher, deps = [], { skip = false } = {}) {
  // A stable string identifying "which request the current arguments describe".
  const depsKey = JSON.stringify([...deps, skip]);

  const [result, setResult] = useState({
    key: null,
    data: null,
    meta: null,
    error: null,
  });

  // `loading` is DERIVED, not stored: we are loading whenever the result we
  // hold does not belong to the arguments we currently have.
  //
  // Deriving it avoids calling setState synchronously inside the effect, which
  // triggers an extra render pass on every single fetch.
  const loading = !skip && result.key !== depsKey;

  useEffect(() => {
    if (skip) return undefined;

    // AbortController cancels the in-flight request when deps change or the
    // component unmounts. Without it, switching state twice quickly lets a
    // slow first response overwrite a fast second one - the stale-response bug.
    const controller = new AbortController();

    fetcher({ signal: controller.signal })
      .then(({ data, meta }) =>
        setResult({ key: depsKey, data, meta, error: null }),
      )
      .catch((error) => {
        if (error.name === 'AbortError') return; // expected, not a failure
        setResult({ key: depsKey, data: null, meta: null, error });
      });

    return () => controller.abort();
    // `fetcher` is intentionally excluded: callers pass an inline arrow that is
    // a new function object every render, which would refetch forever.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [depsKey, skip]);

  if (skip) {
    return { data: null, meta: null, loading: false, error: null };
  }

  return {
    data: result.data,
    meta: result.meta,
    loading,
    error: result.error,
  };
}
