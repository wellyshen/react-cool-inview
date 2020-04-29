import { renderHook } from '@testing-library/react-hooks';

import useInView, { Options, observerErr } from '..';

describe('useInView', () => {
  global.console.error = jest.fn();

  const testHook = (
    target = { current: document.createElement('div') },
    opts: Options = {}
  ): any => renderHook(() => useInView(target, opts));

  const observe = jest.fn();
  const disconnect = jest.fn();
  const mockIntersectionObserver = jest.fn(() => ({
    observe,
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

  afterEach(() => {
    // @ts-ignore
    if (global.IntersectionObserver) global.IntersectionObserver.mockClear();
  });

  it("should not start observe if the target isn't set", () => {
    testHook(null);
    expect(observe).not.toHaveBeenCalled();
  });

  it('should throw observer error', () => {
    testHook();
    expect(console.error).not.toHaveBeenCalled();

    // @ts-ignore
    delete global.IntersectionObserver;
    testHook();
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(observerErr);

    // @ts-ignore
    global.IntersectionObserver = mockIntersectionObserver;
    // @ts-ignore
    delete global.IntersectionObserverEntry;
    testHook();
    expect(console.error).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledWith(observerErr);

    // @ts-ignore
    global.IntersectionObserverEntry = jest.fn();
    // @ts-ignore
    delete global.IntersectionObserverEntry.prototype.isIntersecting;
    testHook();
    expect(console.error).toHaveBeenCalledTimes(3);
    expect(console.error).toHaveBeenCalledWith(observerErr);
  });

  it('should stop observe when un-mount', () => {
    testHook();
    expect(disconnect).toHaveBeenCalled();
  });
});
