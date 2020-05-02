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

  const observerEvent: Event = {
    intersectionRatio: 0,
    isIntersecting: false,
    isVisible: undefined,
    boundingClientRect: { x: 0, y: 0 },
  };
  const triggerObserverCb = ({
    intersectionRatio = observerEvent.intersectionRatio,
    isIntersecting = observerEvent.isIntersecting,
    boundingClientRect = observerEvent.boundingClientRect,
    isVisible = observerEvent.isVisible,
  } = {}): void => {
    callback([
      { intersectionRatio, isIntersecting, boundingClientRect, isVisible },
    ]);
  };

  const baseEvent = {
    entry: observerEvent,
    scrollDirection: {},
    observe: expect.any(Function),
    unobserve: expect.any(Function),
  };
  const changeEvent = {
    ...baseEvent,
    inView: observerEvent.isIntersecting,
  };

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
      triggerObserverCb({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: 0.5 });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0, 1] });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0.5, 1] });
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it('should return inView with intersection observer v2 correctly', () => {
    const result = renderHelper({ trackVisibility: true });
    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: false });
    });
    expect(result.current.inView).toBeFalsy();

    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: true });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it('should return scrollDidrection correctly', () => {
    const result = renderHelper();
    act(() => {
      triggerObserverCb({ boundingClientRect: { y: 0 } });
      triggerObserverCb({ boundingClientRect: { y: 10 } });
    });
    expect(result.current.scrollDirection.vertical).toBe('down');

    act(() => {
      triggerObserverCb({ boundingClientRect: { y: 0 } });
      triggerObserverCb({ boundingClientRect: { y: -10 } });
    });
    expect(result.current.scrollDirection.vertical).toBe('up');

    act(() => {
      triggerObserverCb({ boundingClientRect: { x: 0 } });
      triggerObserverCb({ boundingClientRect: { x: 10 } });
    });
    expect(result.current.scrollDirection.horizontal).toBe('right');

    act(() => {
      triggerObserverCb({ boundingClientRect: { x: 0 } });
      triggerObserverCb({ boundingClientRect: { x: -10 } });
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
      triggerObserverCb(e);
    });
    expect(result.current.entry).toStrictEqual(e);
  });

  it('should stop observe on-enter when set the unobserveOnEnter as true', () => {
    renderHelper({ unobserveOnEnter: true });
    act(() => {
      triggerObserverCb({ isIntersecting: true });
    });
    expect(disconnect).toHaveBeenCalledTimes(12);
  });

  it('should stop observe when un-mount', () => {
    renderHelper();
    expect(disconnect).toHaveBeenCalled();
  });

  it('should trigger onChange', () => {
    const onChange = jest.fn((e) => {
      e.unobserve();
      e.observe();
    });
    renderHelper({ onChange });
    const isIntersecting = true;
    const boundingClientRect = { y: 10 };
    act(() => {
      triggerObserverCb();
      triggerObserverCb({ isIntersecting, boundingClientRect });
    });
    expect(onChange).toHaveBeenCalledWith(changeEvent);
    expect(onChange).toHaveBeenLastCalledWith({
      ...changeEvent,
      inView: isIntersecting,
      scrollDirection: { vertical: 'down' },
      entry: { ...changeEvent.entry, isIntersecting, boundingClientRect },
    });
    expect(disconnect).toHaveBeenCalledTimes(15);
    expect(observe).toHaveBeenCalledTimes(16);
  });

  it('should trigger onChange with intersection observer v2', () => {
    const onChange = jest.fn();
    renderHelper({ trackVisibility: true, onChange });
    const isIntersecting = true;
    let isVisible = false;
    act(() => {
      triggerObserverCb({ isIntersecting, isVisible });
    });
    expect(onChange).toHaveBeenCalledWith({
      ...changeEvent,
      entry: { ...changeEvent.entry, isIntersecting, isVisible },
    });

    isVisible = true;
    act(() => {
      triggerObserverCb({ isIntersecting, isVisible });
    });
    expect(onChange).toHaveBeenLastCalledWith({
      ...changeEvent,
      inView: isVisible,
      entry: { ...changeEvent.entry, isIntersecting, isVisible },
    });
  });

  it('should trigger onEnter', () => {
    const onEnter = jest.fn((e) => {
      e.unobserve();
      e.observe();
    });
    renderHelper({ onEnter });
    const isIntersecting = true;
    const boundingClientRect = { y: 10 };
    act(() => {
      triggerObserverCb();
      triggerObserverCb({ isIntersecting, boundingClientRect });
      triggerObserverCb({ isIntersecting });
    });
    expect(onEnter).toHaveBeenCalledTimes(1);
    expect(onEnter).toHaveBeenCalledWith({
      ...baseEvent,
      scrollDirection: { vertical: 'down' },
      entry: { ...baseEvent.entry, isIntersecting, boundingClientRect },
    });
    expect(disconnect).toHaveBeenCalledTimes(18);
    expect(observe).toHaveBeenCalledTimes(19);
  });

  it('should trigger onEnter with intersection observer v2', () => {
    const onEnter = jest.fn();
    renderHelper({ trackVisibility: true, onEnter });
    const isIntersecting = true;
    let isVisible = false;
    act(() => {
      triggerObserverCb({ isVisible });
      triggerObserverCb({ isIntersecting, isVisible });
    });
    expect(onEnter).not.toHaveBeenCalled();

    isVisible = true;
    act(() => {
      triggerObserverCb({ isVisible });
      triggerObserverCb({ isIntersecting, isVisible });
    });
    expect(onEnter).toHaveBeenCalledWith({
      ...baseEvent,
      entry: { ...baseEvent.entry, isVisible },
    });
  });

  it('should trigger onLeave', () => {
    const onLeave = jest.fn((e) => {
      e.unobserve();
      e.observe();
    });
    renderHelper({ onLeave });
    const boundingClientRect = { y: 10 };
    act(() => {
      triggerObserverCb({ isIntersecting: true });
      triggerObserverCb({ isIntersecting: false, boundingClientRect });
      triggerObserverCb({ isIntersecting: false });
    });
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledWith({
      ...baseEvent,
      scrollDirection: { vertical: 'down' },
      entry: { ...baseEvent.entry, isIntersecting: false, boundingClientRect },
    });
    expect(disconnect).toHaveBeenCalledTimes(21);
    expect(observe).toHaveBeenCalledTimes(22);
  });

  it('should trigger onLeave with intersection observer v2', () => {
    const onLeave = jest.fn();
    renderHelper({ trackVisibility: true, onLeave });
    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: false });
      triggerObserverCb({ isIntersecting: false, isVisible: false });
    });
    expect(onLeave).not.toHaveBeenCalled();

    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: true });
      triggerObserverCb({ isIntersecting: false, isVisible: false });
    });
    expect(onLeave).toHaveBeenCalledWith({
      ...baseEvent,
      entry: { ...baseEvent.entry, isVisible: false },
    });
  });

  it('should throw intersection observer v2 warn', () => {
    console.warn = jest.fn();

    renderHelper({ trackVisibility: true });
    act(() => {
      triggerObserverCb();
      triggerObserverCb();
    });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(observerWarn);
  });

  it('should throw intersection observer error', () => {
    console.error = jest.fn();

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
