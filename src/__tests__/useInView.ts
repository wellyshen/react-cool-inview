import { renderHook, act } from '@testing-library/react-hooks';

import useInView, { Return as Current, observerErr, observerWarn } from '..';

describe('useInView', () => {
  const renderHelper = ({
    target = { current: document.createElement('div') },
    opts = {},
  } = {}): { current: Current } => {
    return renderHook(() => useInView(target, opts)).result;
  };

  let callback: Function;
  const observe = jest.fn();
  const disconnect = jest.fn();
  const mockIntersectionObserver = jest.fn((cb, opts) => ({
    ...opts,
    observe: (): void => {
      callback = cb;
      observe();
    },
    disconnect,
  }));

  interface Event {
    intersectionRatio?: number;
    isIntersecting?: boolean;
    boundingClientRect?: { x?: number; y?: number };
    isVisible?: boolean;
  }

  const triggerCallback = ({
    intersectionRatio = 0,
    isIntersecting = false,
    boundingClientRect = { x: 0, y: 0 },
    isVisible,
  }: Event = {}): void =>
    callback([
      { intersectionRatio, isIntersecting, boundingClientRect, isVisible },
    ]);

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
    expect(observe).not.toHaveBeenCalled();
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

  it('should return workable unobserve method', () => {
    const result = renderHelper();
    result.current.unobserve();
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it('should return workable observe method', () => {
    const result = renderHelper();
    result.current.unobserve();
    result.current.observe();
    expect(observe).toHaveBeenCalledTimes(4);
  });

  it('should return inView correctly', () => {
    let result = renderHelper();
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ opts: { threshold: 0.5 } });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ opts: { threshold: [0, 1] } });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ opts: { threshold: [0.5, 1] } });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it('should return inView with intersection observer v2 correctly', () => {
    const result = renderHelper({ opts: { trackVisibility: true } });
    act(() => {
      triggerCallback({ isIntersecting: true, isVisible: false });
    });
    expect(result.current.inView).toBeFalsy();

    act(() => {
      triggerCallback({ isIntersecting: true, isVisible: true });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it('should return scrollDidrection correctly', () => {
    const result = renderHelper();
    act(() => {
      triggerCallback({ boundingClientRect: { y: 0 } });
      triggerCallback({ boundingClientRect: { y: 10 } });
    });
    expect(result.current.scrollDirection.vertical).toBe('down');

    act(() => {
      triggerCallback({ boundingClientRect: { y: 0 } });
      triggerCallback({ boundingClientRect: { y: -10 } });
    });
    expect(result.current.scrollDirection.vertical).toBe('up');

    act(() => {
      triggerCallback({ boundingClientRect: { x: 0 } });
      triggerCallback({ boundingClientRect: { x: 10 } });
    });
    expect(result.current.scrollDirection.horizontal).toBe('right');

    act(() => {
      triggerCallback({ boundingClientRect: { x: 0 } });
      triggerCallback({ boundingClientRect: { x: -10 } });
    });
    expect(result.current.scrollDirection.horizontal).toBe('left');
  });

  it('should return entry correctly', () => {
    const result = renderHelper();
    const e = {
      intersectionRatio: 0.5,
      isIntersecting: true,
      boundingClientRect: { x: 10, y: 10 },
      isVisible: false,
    };
    act(() => {
      triggerCallback(e);
    });
    expect(result.current.entry).toStrictEqual(e);
  });

  it('should stop observe when un-mount', () => {
    renderHelper();
    expect(disconnect).toHaveBeenCalled();
  });

  it('should throw intersection observer v2 warn', () => {
    global.console.warn = jest.fn();

    renderHelper({ opts: { trackVisibility: true } });
    act(() => {
      triggerCallback();
      triggerCallback();
    });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(observerWarn);
  });

  it('should throw intersection observer error', () => {
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
