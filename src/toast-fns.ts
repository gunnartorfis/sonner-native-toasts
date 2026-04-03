import { toastStore } from './toast-store';
import { type toast as toastType } from './types';

export const toast: typeof toastType = (title, options) => {
  return toastStore.addToast({
    title,
    variant: 'info',
    ...options,
  });
};

toast.success = (title, options = {}) => {
  return toastStore.addToast({
    ...options,
    title,
    variant: 'success',
  });
};

toast.wiggle = (id) => {
  return toastStore.wiggleToast(id);
};

toast.error = (title: string, options = {}) => {
  return toastStore.addToast({
    ...options,
    title,
    variant: 'error',
  });
};

toast.warning = (title: string, options = {}) => {
  return toastStore.addToast({
    ...options,
    title,
    variant: 'warning',
  });
};

toast.info = (title: string, options = {}) => {
  return toastStore.addToast({
    title,
    ...options,
    variant: 'info',
  });
};

toast.promise = <T,>(promise: Promise<T>, options: Parameters<typeof toastType.promise<T>>[1]) => {
  const { loading, success, error, ...restOptions } = options;
  return toastStore.addToast({
    ...restOptions,
    title: loading,
    variant: 'info',
    promiseOptions: {
      promise: promise as Promise<unknown>,
      loading,
      success: success as (result: unknown) => string,
      error,
    },
  });
};

toast.custom = (jsx, options) => {
  return toastStore.addToast({
    title: '',
    variant: 'info',
    jsx,
    ...options,
  });
};

toast.loading = (title, options = {}) => {
  return toastStore.addToast({
    title,
    variant: 'loading',
    ...options,
  });
};

toast.dismiss = (id) => {
  return toastStore.dismissToast(id);
};
