import { renderHook } from '@testing-library/react-hooks';

import useInView, { observerErr } from '..';

describe('useInView', () => {
  global.console.error = jest.fn();
  const mockTarget = { current: document.createElement('div') };
  const observe = jest.fn();
  const disconnect = jest.fn();
  const mockIntersectionObserver = jest.fn(() => ({
    observe,
    disconnect,
  }));
  const renderHelper = (target = mockTarget): any =>
    renderHook(() => useInView(target));

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
    renderHelper(null);
    expect(observe).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('should throw observer error', () => {
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
