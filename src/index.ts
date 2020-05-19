import { RefObject, useState, useRef, useEffect, useCallback } from "react";

import useLatest from "./useLatest";

export const observerErr =
  "💡react-cool-inview: the browser doesn't support Intersection Observer, please install polyfill: https://github.com/wellyshen/react-cool-inview#intersection-observer-polyfill";
export const observerWarn =
  "💡react-cool-inview: the browser doesn't support Intersection Observer v2, fallback to v1 behavior";

interface IntersectionObserverInitV2 extends IntersectionObserverInit {
  readonly trackVisibility?: boolean;
  readonly delay?: number;
}
interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
  readonly isVisible?: boolean;
}
interface ScrollDirection {
  vertical?: "up" | "down";
  horizontal?: "left" | "right";
}
interface BaseEvent {
  entry: IntersectionObserverEntryV2;
  scrollDirection: ScrollDirection;
  observe: () => void;
  unobserve: () => void;
}
interface ChangeEvent extends BaseEvent {
  inView: boolean;
}
interface CallBack<T = BaseEvent> {
  (event: T): void;
}
type OnChange = CallBack<ChangeEvent>;
export interface Options {
  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number | number[];
  trackVisibility?: boolean;
  delay?: number;
  unobserveOnEnter?: boolean;
  onChange?: OnChange;
  onEnter?: CallBack;
  onLeave?: CallBack;
}
export interface Return {
  readonly inView: boolean;
  readonly scrollDirection: ScrollDirection;
  readonly entry?: IntersectionObserverEntryV2;
  readonly observe: () => void;
  readonly unobserve: () => void;
}
interface State {
  inView: boolean;
  scrollDirection: ScrollDirection;
  entry?: IntersectionObserverEntryV2;
}

const useInView = (
  ref: RefObject<HTMLElement>,
  {
    root,
    rootMargin,
    threshold,
    trackVisibility,
    delay,
    unobserveOnEnter = false,
    onChange,
    onEnter,
    onLeave,
  }: Options = {}
): Return => {
  const [state, setState] = useState<State>({
    inView: false,
    scrollDirection: {},
  });
  const prevInViewRef = useRef<boolean>(false);
  const prevPosRef = useRef<{ x?: number; y?: number }>({});
  const isObservingRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver>(null);
  const warnedRef = useRef<boolean>(false);
  const onChangeRef = useLatest<OnChange>(onChange);
  const onEnterRef = useLatest<CallBack>(onEnter);
  const onLeaveRef = useLatest<CallBack>(onLeave);

  const observe = useCallback((): void => {
    if (isObservingRef.current || !observerRef.current) return;

    observerRef.current.observe(ref.current);
    isObservingRef.current = true;
  }, [ref]);

  const unobserve = useCallback((): void => {
    if (!isObservingRef.current || !observerRef.current) return;

    observerRef.current.disconnect();
    isObservingRef.current = false;
  }, []);

  useEffect(() => {
    if (!ref || !ref.current) return (): void => null;

    if (
      !("IntersectionObserver" in window) ||
      !("IntersectionObserverEntry" in window) ||
      !("isIntersecting" in window.IntersectionObserverEntry.prototype)
    ) {
      console.error(observerErr);
      return (): void => null;
    }

    // eslint-disable-next-line compat/compat
    observerRef.current = new IntersectionObserver(
      ([entry]: IntersectionObserverEntryV2[]) => {
        const {
          intersectionRatio,
          isIntersecting,
          boundingClientRect: { x, y },
          isVisible,
        } = entry;
        const scrollDirection: ScrollDirection = {};
        const min = Array.isArray(threshold)
          ? Math.min(...threshold)
          : threshold;
        let inView = min > 0 ? intersectionRatio >= min : isIntersecting;

        if (x < prevPosRef.current.x) scrollDirection.horizontal = "left";
        if (x > prevPosRef.current.x) scrollDirection.horizontal = "right";
        prevPosRef.current.x = x;

        if (y < prevPosRef.current.y) scrollDirection.vertical = "up";
        if (y > prevPosRef.current.y) scrollDirection.vertical = "down";
        prevPosRef.current.y = y;

        const e = { entry, scrollDirection, observe, unobserve };

        if (trackVisibility) {
          if (isVisible === undefined && !warnedRef.current) {
            console.warn(observerWarn);
            warnedRef.current = true;
          }
          if (isVisible !== undefined) inView = isVisible;
        }

        if (inView && !prevInViewRef.current) {
          if (unobserveOnEnter) unobserve();
          if (onEnterRef.current) onEnterRef.current(e);
        }

        if (!inView && prevInViewRef.current && onLeaveRef.current)
          onLeaveRef.current(e);

        if (onChangeRef.current) onChangeRef.current({ ...e, inView });

        setState({ inView, scrollDirection, entry });
        prevInViewRef.current = inView;
      },
      {
        root,
        rootMargin,
        threshold,
        trackVisibility,
        delay,
      } as IntersectionObserverInitV2
    );

    observe();

    return (): void => {
      unobserve();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ref,
    unobserveOnEnter,
    root,
    rootMargin,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(threshold),
    trackVisibility,
    delay,
    observe,
    unobserve,
  ]);

  return { ...state, observe, unobserve };
};

export default useInView;
