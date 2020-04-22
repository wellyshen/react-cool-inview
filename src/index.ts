import { RefObject, useState, useRef, useEffect, useCallback } from 'react';

import useLatest from './useLatest';

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
interface BaseEvent {
  entry?: IntersectionObserverEntryV2;
  observe?: () => void;
  unobserve?: () => void;
}
interface ChangeEvent extends BaseEvent {
  inView?: boolean;
}
interface CallBack<T = BaseEvent> {
  (event?: T): void;
}
type OnChange = CallBack<ChangeEvent>;
interface Options {
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
interface Return {
  readonly inView: boolean;
  readonly entry?: IntersectionObserverEntryV2;
  readonly observe: () => void;
  readonly unobserve: () => void;
}
interface State {
  inView: boolean;
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
  const [state, setState] = useState<State>({ inView: false });
  const prevInViewRef = useRef<boolean>(false);
  const isObserveRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver>(null);
  const warnedRef = useRef<boolean>(false);
  const onChangeRef = useLatest<OnChange>(onChange);
  const onEnterRef = useLatest<CallBack>(onEnter);
  const onLeaveRef = useLatest<CallBack>(onLeave);

  const observe = useCallback((): void => {
    if (isObserveRef.current || !observerRef.current) return;

    observerRef.current.observe(ref.current);
    isObserveRef.current = true;
  }, [ref]);

  const unobserve = useCallback((): void => {
    if (!isObserveRef.current || !observerRef.current) return;

    observerRef.current.disconnect();
    isObserveRef.current = false;
  }, []);

  const getIsIntersecting = useCallback(
    (
      val: number | number[] = 0,
      ratio: number,
      intersecting: boolean
    ): boolean => {
      const min = Array.isArray(val) ? Math.min(...val) : val;
      return min > 0 ? ratio >= min : intersecting;
    },
    []
  );

  useEffect(() => {
    if (!ref || !ref.current) return (): void => null;

    if (
      !window.IntersectionObserver ||
      (window.IntersectionObserverEntry &&
        !window.IntersectionObserverEntry.prototype.isIntersecting)
    ) {
      console.error(observerErr);
      return (): void => null;
    }

    unobserve();

    observerRef.current = new IntersectionObserver(
      ([entry]: IntersectionObserverEntryV2[]) => {
        const e = { entry, observe, unobserve };
        const { intersectionRatio, isIntersecting, isVisible } = entry;
        let inView = getIsIntersecting(
          threshold,
          intersectionRatio,
          isIntersecting
        );

        if (trackVisibility) {
          if (isVisible === undefined && !warnedRef.current) {
            console.warn(observerWarn);
            warnedRef.current = true;
          }
          if (isVisible !== undefined) inView = isVisible;
        }

        if (onEnterRef.current && inView && !prevInViewRef.current) {
          if (unobserveOnEnter) unobserve();
          onEnterRef.current(e);
        }

        if (onLeaveRef.current && !inView && prevInViewRef.current)
          onLeaveRef.current(e);

        if (onChangeRef.current) onChangeRef.current({ ...e, inView });

        setState({ inView, entry });
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
