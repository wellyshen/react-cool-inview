import {
  RefObject,
  MutableRefObject,
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";

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
interface Callback<T = BaseEvent> {
  (event: T): void;
}
type OnChange = Callback<ChangeEvent>;
export interface Options<T> {
  ref?: RefObject<T>;
  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number | number[];
  trackVisibility?: boolean;
  delay?: number;
  unobserveOnEnter?: boolean;
  onChange?: OnChange;
  onEnter?: Callback;
  onLeave?: Callback;
}
interface Return<T> extends Readonly<Omit<BaseEvent, "entry">> {
  ref: RefObject<T>;
  inView: boolean;
  entry?: IntersectionObserverEntryV2;
}
interface State {
  inView: boolean;
  scrollDirection: ScrollDirection;
  entry?: IntersectionObserverEntryV2;
}

const useInView = <T extends HTMLElement>({
  ref: refOpt,
  root,
  rootMargin,
  threshold = 0,
  trackVisibility,
  delay,
  unobserveOnEnter = false,
  onChange,
  onEnter,
  onLeave,
}: Options<T> = {}): Return<T> => {
  const [state, setState] = useState<State>({
    inView: false,
    scrollDirection: {},
  });
  const prevInViewRef = useRef<boolean>(false);
  const prevPosRef = useRef<{ x?: number; y?: number }>({});
  const isObservingRef = useRef<boolean>(false);
  const observerRef: MutableRefObject<IntersectionObserver | null> = useRef(
    null
  );
  const warnedRef = useRef<boolean>(false);
  const onChangeRef = useLatest<OnChange | undefined>(onChange);
  const onEnterRef = useLatest<Callback | undefined>(onEnter);
  const onLeaveRef = useLatest<Callback | undefined>(onLeave);
  const refVar = useRef<T>(null);
  const ref = refOpt || refVar;

  const observe = useCallback(() => {
    if (isObservingRef.current || !observerRef.current) return;

    observerRef.current.observe(ref.current as Element);
    isObservingRef.current = true;
  }, [ref]);

  const unobserve = useCallback(() => {
    if (!isObservingRef.current || !observerRef.current) return;

    observerRef.current.disconnect();
    isObservingRef.current = false;
  }, []);

  useEffect(() => {
    if (!ref.current) return () => null;

    if (
      !("IntersectionObserver" in window) ||
      !("IntersectionObserverEntry" in window)
    ) {
      console.error(observerErr);
      return () => null;
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
        let inView =
          isIntersecting !== undefined ? isIntersecting : intersectionRatio > 0;

        if (min > 0) inView = intersectionRatio >= min;

        // @ts-expect-error
        if (x < prevPosRef.current.x) scrollDirection.horizontal = "left";
        // @ts-expect-error
        if (x > prevPosRef.current.x) scrollDirection.horizontal = "right";
        prevPosRef.current.x = x;

        // @ts-expect-error
        if (y < prevPosRef.current.y) scrollDirection.vertical = "up";
        // @ts-expect-error
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

    return () => {
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

  return { ref, ...state, observe, unobserve };
};

export default useInView;
