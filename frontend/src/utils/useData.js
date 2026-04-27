import { ref, triggerRef } from "vue";

/**
 * @template T
 * @typedef {import("vue").Ref<T>} Ref
 */

/**
 * @function
 * @template T
 * @param {() => Promise<T>} fn
 * @returns {{data: Ref<T | null>, loading: Ref<boolean>, error: Ref<Error | null>}}
 */
export function useData(fn) {
  const loading = ref(true);
  /** @type {Ref<T | null>} */
  const data = ref(null);
  /** @type {Ref<Error | null>} */
  const error = ref(null);

  fn()
    .then((d) => {
      data.value = d;
    })
    .catch((e) => {
      error.value = e;
    })
    .finally(() => {
      loading.value = false;
    });

  return {
    data,
    loading,
    error,
  };
}

/**
 * @function
 * @template Args extends unknown[]
 * @template Result
 * @param {(...args: Args) => Promise<Result>} fn
 * @returns {{fn: (...args: Args) => Promise<Result>, loading: Ref<boolean>, error: Ref<Error | null>}}
 */
export function useMutation(fn) {
  const loading = ref(false);
  /** @type {Ref<Error | null>} */
  const error = ref(null);

  const newFn = async (...args) => {
    loading.value = true;
    error.value = null;
    try {
      return await fn(...args);
    } catch (e) {
      error.value = e;
    } finally {
      loading.value = false;
    }
  };

  return {
    fn: newFn,
    loading,
    error,
  };
}
