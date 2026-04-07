import * as React from 'react';
import {
  type DynamicToastContextType,
  type StableToastContextType,
} from './types';

export const ToastContext = React.createContext<StableToastContextType | null>(
  null
);

export const DynamicToastContext =
  React.createContext<DynamicToastContextType | null>(null);

export const useToastContext = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};

export const useDynamicToastContext = () => {
  const context = React.useContext(DynamicToastContext);
  if (!context) {
    throw new Error(
      'useDynamicToastContext must be used within a ToastProvider'
    );
  }
  return context;
};
