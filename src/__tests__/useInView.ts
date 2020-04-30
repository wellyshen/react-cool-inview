import { renderHook } from '@testing-library/react-hooks';

import useInView, { Return as Current, observerErr } from '..';

describe('useInView', () => {
  const renderHelper = ({
    target = { current: document.createElement('div') },
    opts = {},
  } = {}): { current: Current } => {
    return renderHook(() => useInView(target, opts)).result;
  };

  let callback: Function;
  const observe = (cb?: Function): Function =>
    jest.fn(() => {
      callback = cb;
    });
  const disconnect = jest.fn();
  const mockIntersectionObserver = jest.fn((cb, opts) => ({
    ...opts,
    observe: observe(cb),
    disconnect,
  }));

  beforeAll(() => {
    // @ts-ignore
    global.IntersectionObserver = mockIntersectionObserver;
    // @ts-ignore
    global.IntersectionObserverEntry = jest.fn();
    // @ts-ignore
    global.IntersectionObserverEntry.prototype.isIntersecting = false;
  });

  it("should not start observe if the target isn't set", () => {
    renderHelper({ target: null });
    expect(observe()).not.toHaveBeenCalled();
  });

  it('should set the options of intersection observer correctly', () => {
    const opts = {
      root: 'div',
      rootMargin: '0',
      threshold: 0,
      trackVisibility: true,
      delay: 100,
    };
    renderHelper({ opts });
    // @ts-ignore
    const mkIntersectionObserver = IntersectionObserver.mock.results[0].value;
    expect(mkIntersectionObserver.root).toBe(opts.root);
    expect(mkIntersectionObserver.rootMargin).toBe(opts.rootMargin);
    expect(mkIntersectionObserver.threshold).toBe(opts.threshold);
    expect(mkIntersectionObserver.trackVisibility).toBe(opts.trackVisibility);
    expect(mkIntersectionObserver.delay).toBe(opts.delay);
  });

  it('should stop observe when un-mount', () => {
    renderHelper();
    expect(disconnect).toHaveBeenCalled();
  });

  it('should throw observer error', () => {
    global.console.error = jest.fn();

    renderHelper();
    expect(console.error).not.toHaveBeenCalled();

    // @ts-ignore
    delete global.IntersectionObserver;
    renderHelper();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(observerErr);

    // @ts-ignore
    global.IntersectionObserver = mockIntersectionObserver;
    // @ts-ignore
    delete global.IntersectionObserverEntry;
    renderHelper();
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(observerErr);

    // @ts-ignore
    global.IntersectionObserverEntry = jest.fn();
    // @ts-ignore
    delete global.IntersectionObserverEntry.prototype.isIntersecting;
    renderHelper();
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledWith(observerErr);
  });
});
