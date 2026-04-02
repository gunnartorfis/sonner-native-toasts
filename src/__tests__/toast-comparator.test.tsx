import { View } from 'react-native';
import type { ToastProps } from '../types'; // Adjust the import path Adjust the import path
import { areToastsEqual } from '../toast-comparator';

// Mock helper function to simulate a click handler
const mockClickHandler = () => {};

describe('areToastsEqual', () => {
  it('should return true when all important properties are equal', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      closeButton: true,
      invert: false,
      position: 'top-center',
      dismissible: true,
      action: { label: 'Retry', onClick: mockClickHandler },
      cancel: { label: 'Cancel', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      closeButton: true,
      invert: false,
      position: 'top-center',
      dismissible: true,
      action: { label: 'Retry', onClick: mockClickHandler },
      cancel: { label: 'Cancel', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(true);
  });

  it('should return false when IDs are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 2,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });

  it('should return false when titles are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 2',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });

  it('should return false when variants are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'error',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });

  it('should return false when descriptions are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is a toast',
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      description: 'This is another toast',
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });

  it('should return false when action labels are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      action: { label: 'Retry', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      action: { label: 'Ignore', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });

  it('should return true when action and cancel are both React nodes and equal', () => {
    const mockReactNode = <View />;

    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      action: mockReactNode,
      cancel: mockReactNode,
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      action: mockReactNode,
      cancel: mockReactNode,
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(true);
  });

  it('should return false when cancel labels are different', () => {
    const toast1: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      cancel: { label: 'Cancel', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    const toast2: ToastProps = {
      id: 1,
      title: 'Toast 1',
      variant: 'success',
      cancel: { label: 'Dismiss', onClick: mockClickHandler },
      index: 0,
      numberOfToasts: 1,
    };

    expect(areToastsEqual(toast1, toast2)).toBe(false);
  });
});
