import { act } from 'react';
import * as React from 'react';
import { toast } from '../toast-fns';
import { Toaster } from '../toaster';
import { createToasterHarness, resetToastStore } from './test-utils';

// Platform.OS is mocked to 'ios' in setup.ts, so the FullWindowOverlay branch
// is the one under test here.
const mockFullWindowOverlay = jest.fn(
  ({ children }: { children?: React.ReactNode }) => children
);
jest.mock('react-native-screens', () => ({
  __esModule: true,
  FullWindowOverlay: (props: { children?: React.ReactNode }) =>
    mockFullWindowOverlay(props),
}));

describe('Toaster overlay wrapping', () => {
  const { render, cleanup } = createToasterHarness();

  beforeEach(() => {
    resetToastStore();
    mockFullWindowOverlay.mockClear();
    jest.clearAllTimers();
  });
  afterEach(cleanup);

  it('wraps in FullWindowOverlay on iOS by default', () => {
    render(<Toaster />);
    act(() => {
      toast('A');
    });
    expect(mockFullWindowOverlay).toHaveBeenCalled();
  });

  it('renders inline when fullWindowOverlay is false', () => {
    render(<Toaster id="sheet" fullWindowOverlay={false} />);
    act(() => {
      toast('A', { toasterId: 'sheet' });
    });
    expect(mockFullWindowOverlay).not.toHaveBeenCalled();
  });

  it('still renders its toasts when the overlay is disabled', () => {
    const renderer = render(
      <Toaster id="sheet" fullWindowOverlay={false} />
    );
    act(() => {
      toast('inline toast', { toasterId: 'sheet' });
    });
    const tree = JSON.stringify(renderer.toJSON());
    expect(tree).toContain('inline toast');
  });

  it('lets ToasterOverlayWrapper take precedence', () => {
    const Wrapper = ({ children }: { children: React.ReactNode }) => (
      <>{children}</>
    );
    render(<Toaster ToasterOverlayWrapper={Wrapper} />);
    act(() => {
      toast('A');
    });
    expect(mockFullWindowOverlay).not.toHaveBeenCalled();
  });
});
