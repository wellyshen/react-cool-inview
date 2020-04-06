import { RefObject, useState, useRef, useEffect, useCallback } from 'react';

import useLatest from './useLatest';

// FIXME: Make sure URL is correct
export const observerErr =
  "💡react-cool-inview: the browser doesn't support Intersection Observer, please install polyfill: https://github.com/wellyshen/react-cool-inview#intersection-observer-polyfill";
// FIXME: Make sure URL is correct
export const observerWarn =
  "💡react-cool-inview: the browser doesn't support Intersection Observer v2, please refer to: https://github.com/wellyshen/react-cool-inview#intersection-observer-v2";

interface IntersectionObserverInitV2 extends IntersectionObserverInit {
  readonly trackVisibility?: boolean;
  readonly delay?: number;
}
interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
  readonly isVisible?: boolean;
}
interface BaseEvent {
  entry?: IntersectionObserverEntryV2;
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
  readonly isVisible?: boolean;
  readonly entry?: IntersectionObserverEntryV2;
  readonly observe: () => void;
  readonly unobserve: () => void;
}
interface State {
  inView: boolean;
  isVisible?: boolean;
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
  const inViewRef = useRef<boolean>(false);
  const isObserveRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver>(null);
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

  useEffect(() => {
    if (!ref || !ref.current) return (): void => null;

    if (!window.IntersectionObserver) {
      console.error(observerErr);
      return (): void => null;
    }

    unobserve();

    observerRef.current = new IntersectionObserver(
      ([entry]: IntersectionObserverEntryV2[]) => {
        const { isIntersecting, isVisible } = entry;
        const e = { entry, unobserve };

        if (onEnterRef.current && isIntersecting && !inViewRef.current) {
          if (unobserveOnEnter) unobserve();
          onEnterRef.current(e);
        }

        if (onLeaveRef.current && !isIntersecting && inViewRef.current)
          onLeaveRef.current(e);

        if (onChangeRef.current)
          onChangeRef.current({ ...e, inView: isIntersecting });

        if (trackVisibility && isVisible === undefined)
          console.warn(observerWarn);

        setState({ inView: isIntersecting, isVisible, entry });
        inViewRef.current = isIntersecting;
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
