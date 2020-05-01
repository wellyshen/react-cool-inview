import { RefObject } from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import useInView, {
  Options,
  Return as Current,
  observerErr,
  observerWarn,
} from '..';

describe('useInView', () => {
  interface Args extends Options {
    target?: RefObject<HTMLDivElement>;
  }

  const renderHelper = ({
    target = { current: document.createElement('div') },
    ...rest
  }: Args = {}): { current: Current } => {
    return renderHook(() => useInView(target, rest)).result;
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

  const defaultEvent: Event = {
    intersectionRatio: 0,
    isIntersecting: false,
    boundingClientRect: { x: 0, y: 0 },
    isVisible: undefined,
  };
  const triggerCallback = ({
    intersectionRatio = defaultEvent.intersectionRatio,
    isIntersecting = defaultEvent.isIntersecting,
    boundingClientRect = defaultEvent.boundingClientRect,
    isVisible = defaultEvent.isVisible,
  } = {}): void =>
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
    const args = {
      root: document.createElement('div'),
      rootMargin: '0',
      threshold: 0,
      trackVisibility: true,
      delay: 100,
    };
    renderHelper(args);
    const {
      root,
      rootMargin,
      threshold,
      trackVisibility,
      delay,
      // @ts-ignore
    } = IntersectionObserver.mock.results[0].value;
    expect(root).toBe(args.root);
    expect(rootMargin).toBe(args.rootMargin);
    expect(threshold).toBe(args.threshold);
    expect(trackVisibility).toBe(args.trackVisibility);
    expect(delay).toBe(args.delay);
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

    result = renderHelper({ threshold: 0.5 });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0, 1] });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0.5, 1] });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerCallback({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it('should return inView with intersection observer v2 correctly', () => {
    const result = renderHelper({ trackVisibility: true });
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

  it('should stop observe on-enter when set the unobserveOnEnter as true', () => {
    renderHelper({ unobserveOnEnter: true });
    act(() => {
      triggerCallback({ isIntersecting: true });
    });
    expect(disconnect).toHaveBeenCalledTimes(12);
  });

  it('should stop observe when un-mount', () => {
    renderHelper();
    expect(disconnect).toHaveBeenCalled();
  });

  it('should trigger onChange correctly', () => {
    const onChange = jest.fn((e) => {
      e.unobserve();
      e.observe();
    });
    renderHelper({ onChange });
    const isIntersecting = true;
    const boundingClientRect = { x: 0, y: 10 };
    act(() => {
      triggerCallback();
      triggerCallback({ isIntersecting, boundingClientRect });
    });
    const e = {
      inView: defaultEvent.isIntersecting,
      entry: defaultEvent,
      scrollDirection: {},
      observe: expect.any(Function),
      unobserve: expect.any(Function),
    };
    expect(onChange).toHaveBeenCalledWith(e);
    expect(onChange).toHaveBeenLastCalledWith({
      ...e,
      inView: isIntersecting,
      entry: { ...defaultEvent, isIntersecting, boundingClientRect },
      scrollDirection: { vertical: 'down' },
    });
    expect(disconnect).toHaveBeenCalledTimes(15);
    expect(observe).toHaveBeenCalledTimes(16);
  });

  it('should throw intersection observer v2 warn', () => {
    global.console.warn = jest.fn();

    renderHelper({ trackVisibility: true });
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
