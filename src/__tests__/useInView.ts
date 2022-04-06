import { renderHook, act } from "@testing-library/react-hooks";

import type { Options } from "../useInView";
import useInView, { observerErr, observerWarn } from "../useInView";

describe("useInView", () => {
  const target = document.createElement("div");
  const renderHelper = (args: Options<HTMLDivElement> = {}) =>
    renderHook(() => useInView(args));

  interface Event {
    intersectionRatio?: number;
    isIntersecting?: boolean;
    boundingClientRect?: { x?: number; y?: number };
    isVisible?: boolean;
  }

  let callback: (e: Event[]) => void;
  const observe = jest.fn();
  const disconnect = jest.fn();
  const mockIntersectionObserver = jest.fn((cb, opts) => ({
    ...opts,
    observe: () => {
      callback = cb;
      observe();
    },
    disconnect,
  }));

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
  } = {}) => {
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

  beforeEach(() => jest.clearAllMocks());

  beforeAll(() => {
    global.IntersectionObserver = mockIntersectionObserver;
    global.IntersectionObserverEntry = jest.fn();
  });

  it("should not start observe if the target isn't set", () => {
    renderHelper();
    expect(observe).not.toHaveBeenCalled();
  });

  it("should set the options of intersection observer correctly", () => {
    const args = {
      root: target,
      rootMargin: "0",
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
      // @ts-expect-error
      // eslint-disable-next-line compat/compat
    } = IntersectionObserver.mock.results[0].value;
    expect(root).toBe(args.root);
    expect(rootMargin).toBe(args.rootMargin);
    expect(threshold).toBe(args.threshold);
    expect(trackVisibility).toBe(args.trackVisibility);
    expect(delay).toBe(args.delay);
  });

  it("should return workable observe method", () => {
    const { result } = renderHelper();
    result.current.observe(target);
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(1);

    result.current.observe();
    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(observe).toHaveBeenCalledTimes(2);
  });

  it("should not observe repeatedly", () => {
    const { result } = renderHelper();
    result.current.observe(target);
    expect(disconnect).toHaveBeenCalledTimes(1);

    result.current.observe(target);
    expect(disconnect).toHaveBeenCalledTimes(1);

    result.current.observe(document.createElement("div"));
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it("should return workable unobserve method", () => {
    const { result } = renderHelper();
    result.current.unobserve();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("should return inView correctly", () => {
    let { result } = renderHelper();
    result.current.observe(target);
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: 0.5 }).result;
    result.current.observe(target);
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0, 1] }).result;
    result.current.observe(target);
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ isIntersecting: true });
    });
    expect(result.current.inView).toBeTruthy();

    result = renderHelper({ threshold: [0.5, 1] }).result;
    result.current.observe(target);
    expect(result.current.inView).toBeFalsy();
    act(() => {
      triggerObserverCb({ intersectionRatio: 0.6 });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it("should return inView with intersection observer v2 correctly", () => {
    const { result } = renderHelper({ trackVisibility: true });
    result.current.observe(target);
    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: false });
    });
    expect(result.current.inView).toBeFalsy();

    act(() => {
      triggerObserverCb({ isIntersecting: true, isVisible: true });
    });
    expect(result.current.inView).toBeTruthy();
  });

  it("should return scrollDirection correctly", () => {
    const { result } = renderHelper();
    result.current.observe(target);
    expect(result.current.scrollDirection).toEqual({});

    act(() => {
      triggerObserverCb();
    });
    expect(result.current.scrollDirection.vertical).toBeUndefined();
    expect(result.current.scrollDirection.horizontal).toBeUndefined();

    act(() => {
      triggerObserverCb();
      triggerObserverCb({ boundingClientRect: { x: 10, y: 10 } });
    });
    expect(result.current.scrollDirection).toEqual({
      vertical: "down",
      horizontal: "right",
    });

    act(() => {
      triggerObserverCb();
      triggerObserverCb({ boundingClientRect: { x: -10, y: -10 } });
    });
    expect(result.current.scrollDirection).toEqual({
      vertical: "up",
      horizontal: "left",
    });

    result.current.unobserve();
    act(() => triggerObserverCb());
    expect(result.current.scrollDirection).toEqual({});

    act(() => {
      triggerObserverCb();
      // @ts-expect-error
      Element.prototype.getBoundingClientRect = () => ({ x: 20, y: 20 });
      result.current.updatePosition();
      triggerObserverCb({ boundingClientRect: { x: 10, y: 10 } });
    });
    expect(result.current.scrollDirection.vertical).toBe("up");
    expect(result.current.scrollDirection.horizontal).toBe("left");

    act(() => {
      triggerObserverCb();
      triggerObserverCb();
    });
    expect(result.current.scrollDirection.vertical).toBeUndefined();
    expect(result.current.scrollDirection.horizontal).toBeUndefined();
  });

  it("should return entry correctly", () => {
    const { result } = renderHelper();
    result.current.observe(target);
    expect(result.current.entry).toBeUndefined();

    const e = {
      intersectionRatio: 0.5,
      isIntersecting: true,
      boundingClientRect: { x: 10, y: 10 },
      isVisible: false,
    };
    act(() => {
      triggerObserverCb(e);
    });
    expect(result.current.entry).toEqual(e);
  });

  it("should stop observe on-enter when set the unobserveOnEnter to true", () => {
    const { result } = renderHelper({ unobserveOnEnter: true });
    result.current.observe(target);
    act(() => {
      triggerObserverCb({ isIntersecting: true });
    });
    expect(disconnect).toHaveBeenCalledTimes(2);
  });

  it("should stop observe when un-mount", () => {
    const { unmount } = renderHelper();
    unmount();
    expect(disconnect).toHaveBeenCalledTimes(1);
  });

  it("should trigger onChange", () => {
    const onChange = jest.fn();
    const { result } = renderHelper({ onChange });
    result.current.observe(target);
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
      scrollDirection: { vertical: "down" },
      entry: { ...changeEvent.entry, isIntersecting, boundingClientRect },
    });
  });

  it("should trigger onChange with intersection observer v2", () => {
    const onChange = jest.fn();
    const { result } = renderHelper({ trackVisibility: true, onChange });
    result.current.observe(target);
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

  it("should trigger onEnter", () => {
    const onEnter = jest.fn();
    const { result } = renderHelper({ onEnter });
    result.current.observe(target);
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
      scrollDirection: { vertical: "down" },
      entry: { ...baseEvent.entry, isIntersecting, boundingClientRect },
    });
  });

  it("should trigger onEnter with intersection observer v2", () => {
    const onEnter = jest.fn();
    const { result } = renderHelper({ trackVisibility: true, onEnter });
    result.current.observe(target);
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

  it("should trigger onLeave", () => {
    const onLeave = jest.fn();
    const { result } = renderHelper({ onLeave });
    result.current.observe(target);
    const boundingClientRect = { y: 10 };
    act(() => {
      triggerObserverCb({ isIntersecting: true });
      triggerObserverCb({ isIntersecting: false, boundingClientRect });
      triggerObserverCb({ isIntersecting: false });
    });
    expect(onLeave).toHaveBeenCalledTimes(1);
    expect(onLeave).toHaveBeenCalledWith({
      ...baseEvent,
      scrollDirection: { vertical: "down" },
      entry: { ...baseEvent.entry, isIntersecting: false, boundingClientRect },
    });
  });

  it("should trigger onLeave with intersection observer v2", () => {
    const onLeave = jest.fn();
    const { result } = renderHelper({ trackVisibility: true, onLeave });
    result.current.observe(target);
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

  it("should throw intersection observer v2 warn", () => {
    console.warn = jest.fn();

    const { result } = renderHelper({ trackVisibility: true });
    result.current.observe(target);
    act(() => {
      triggerObserverCb();
      triggerObserverCb();
    });
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(observerWarn);
  });

  it("should throw intersection observer error", () => {
    console.error = jest.fn();

    renderHelper();
    expect(console.error).not.toHaveBeenCalled();

    // @ts-ignore
    delete global.IntersectionObserver;
    renderHelper();
    global.IntersectionObserver = mockIntersectionObserver;
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith(observerErr);

    // @ts-ignore
    delete global.IntersectionObserverEntry;
    renderHelper();
    global.IntersectionObserverEntry = jest.fn();
    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it("should use intersectionRatio instead of isIntersecting", () => {
    const { result } = renderHelper();
    result.current.observe(target);
    expect(result.current.inView).toBeFalsy();
    act(() => {
      callback([
        { ...observerEvent, isIntersecting: undefined, intersectionRatio: 1 },
      ]);
    });
    expect(result.current.inView).toBeTruthy();
  });
});
