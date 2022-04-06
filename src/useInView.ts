import { useState, useRef, useEffect, useCallback } from "react";

import useLatest from "./useLatest";

export const observerErr =
  "💡 react-cool-inview: the browser doesn't support Intersection Observer, please install polyfill: https://github.com/wellyshen/react-cool-inview#intersection-observer-polyfill";
export const observerWarn =
  "💡 react-cool-inview: the browser doesn't support Intersection Observer v2, fallback to v1 behavior";

interface IntersectionObserverInitV2 extends IntersectionObserverInit {
  readonly trackVisibility?: boolean;
  readonly delay?: number;
}

interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
  readonly isVisible?: boolean;
}

interface ScrollDirection {
  readonly vertical?: "up" | "down";
  readonly horizontal?: "left" | "right";
}

export interface Observe<T> {
  (element?: T | null): void;
}

interface Event<T> {
  readonly entry: IntersectionObserverEntryV2;
  readonly scrollDirection: ScrollDirection;
  observe: Observe<T>;
  unobserve: () => void;
}

export interface Options<T> {
  root?: HTMLElement | null;
  rootMargin?: string;
  threshold?: number | number[];
  trackVisibility?: boolean;
  delay?: number;
  unobserveOnEnter?: boolean;
  onChange?: (event: Event<T> & { inView: boolean }) => void;
  onEnter?: (event: Event<T>) => void;
  onLeave?: (event: Event<T>) => void;
}

export interface Return<T> extends Omit<Event<T>, "entry"> {
  inView: boolean;
  entry?: IntersectionObserverEntryV2;
  updatePosition: () => void;
}

interface State {
  inView: boolean;
  scrollDirection: ScrollDirection;
  entry?: IntersectionObserverEntryV2;
}

const useInView = <T extends HTMLElement | null>({
  root,
  rootMargin,
  threshold = 0,
  trackVisibility,
  delay,
  unobserveOnEnter,
  onChange,
  onEnter,
  onLeave,
}: Options<T> = {}): Return<T> => {
  const [state, setState] = useState<State>({
    inView: false,
    scrollDirection: {},
  });
  const prevInViewRef = useRef(false);
  const prevPosRef = useRef<{ x?: number; y?: number }>({});
  const observerRef = useRef<IntersectionObserver | null>();
  const warnedRef = useRef(false);
  const onChangeRef = useLatest(onChange);
  const onEnterRef = useLatest(onEnter);
  const onLeaveRef = useLatest(onLeave);
  const ref = useRef<T>();

  const unobserve = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      prevPosRef.current = {};
    }
  }, []);

  const observe = useCallback<Observe<T>>(
    (element) => {
      if (element && element !== ref.current) {
        unobserve();
        ref.current = element;
      }
      if (observerRef.current && ref.current)
        observerRef.current.observe(ref.current as HTMLElement);
    },
    [unobserve]
  );

  const updatePosition = useCallback(() => {
    if (!ref.current) return;

    const { x, y } = ref.current.getBoundingClientRect();
    prevPosRef.current = { x, y };
  }, [ref]);

  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      !("IntersectionObserverEntry" in window)
    ) {
      console.error(observerErr);
      return () => null;
    }

    let isActive = true;

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
        let inView =
          isIntersecting !== undefined ? isIntersecting : intersectionRatio > 0;
        inView = min > 0 ? intersectionRatio >= min : inView;

        // @ts-ignore
        if (x < prevPosRef.current.x) scrollDirection.horizontal = "left";
        // @ts-ignore
        if (x > prevPosRef.current.x) scrollDirection.horizontal = "right";
        prevPosRef.current.x = x;

        // @ts-ignore
        if (y < prevPosRef.current.y) scrollDirection.vertical = "up";
        // @ts-ignore
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

        if (isActive) setState({ inView, scrollDirection, entry });
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

    return () => {
      isActive = false;
      unobserve();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
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

  return { ...state, observe, unobserve, updatePosition };
};

export default useInView;
