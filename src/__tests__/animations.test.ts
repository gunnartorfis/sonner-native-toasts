import { resolveAnimationField } from '../animations';
import type { ToastEntryExitAnimation } from '../types';

const fakeDefault = jest.fn();
const fakeToasterValue = jest.fn() as unknown as ToastEntryExitAnimation;
const fakeToastValue = jest.fn() as unknown as ToastEntryExitAnimation;

describe('resolveAnimationField', () => {
  it('returns the library default when both toast and toaster are undefined', () => {
    const result = resolveAnimationField(undefined, undefined, fakeDefault);
    expect(result).toBe(fakeDefault);
  });

  it('returns the toaster value when per-toast is undefined', () => {
    const result = resolveAnimationField(undefined, fakeToasterValue, fakeDefault);
    expect(result).toBe(fakeToasterValue);
  });

  it('returns the per-toast value over the toaster value', () => {
    const result = resolveAnimationField(fakeToastValue, fakeToasterValue, fakeDefault);
    expect(result).toBe(fakeToastValue);
  });

  it('treats the per-toast "default" sentinel as an explicit reset to the library default', () => {
    const result = resolveAnimationField('default', fakeToasterValue, fakeDefault);
    expect(result).toBe(fakeDefault);
  });

  it('treats the toaster "default" sentinel as the library default when per-toast is undefined', () => {
    const result = resolveAnimationField(undefined, 'default', fakeDefault);
    expect(result).toBe(fakeDefault);
  });

  it('lets a per-toast value override a toaster "default" sentinel', () => {
    const result = resolveAnimationField(fakeToastValue, 'default', fakeDefault);
    expect(result).toBe(fakeToastValue);
  });
});
