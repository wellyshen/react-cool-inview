import { RefObject, useState, useRef, useEffect, useCallback } from 'react';

import useLatest from './useLatest';

// FIXME: Make sure URL is correct
export const observerErr =
  "💡react-cool-inview: this browser doesn't support IntersectionObserver, please install polyfill: https://github.com/wellyshen/react-cool-inview#intersectionobserver-polyfill";

interface BaseEvent {
  entry?: IntersectionObserverEntry;
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
  ssr?: boolean;
  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number | number[];
  onChange?: OnChange;
  onEnter?: CallBack;
  onLeave?: CallBack;
}
type Entry = IntersectionObserverEntry | {};
interface Return {
  readonly inView: boolean;
  readonly entry: Entry;
  readonly observe: () => void;
  readonly unobserve: () => void;
}
interface State {
  inView: boolean;
  entry: Entry;
}

const useInView = (
  ref: RefObject<HTMLElement>,
  {
    ssr = false,
    root,
    rootMargin,
    threshold,
    onChange,
    onEnter,
    onLeave,
  }: Options = {}
): Return => {
  const [state, setState] = useState<State>({ inView: ssr, entry: {} });
  const inViewRef = useRef<boolean>(ssr);
  const isObserveRef = useRef<boolean>(false);
  const observerRef = useRef<IntersectionObserver>(null);
  const onChangeRef = useLatest<OnChange>(onChange);
  const onEnterRef = useLatest<CallBack>(onEnter);
  const onLeaveRef = useLatest<CallBack>(onLeave);

  const observe = useCallback((): void => {
    if (isObserveRef.current || !observerRef.current || !ref || !ref.current)
      return;

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
      ([entry]) => {
        const { isIntersecting } = entry;
        const e = { entry, unobserve };

        if (onEnterRef.current && isIntersecting && !inViewRef.current)
          onEnterRef.current(e);

        if (onLeaveRef.current && !isIntersecting && inViewRef.current)
          onLeaveRef.current(e);

        if (onChangeRef.current)
          onChangeRef.current({ ...e, inView: isIntersecting });

        setState({ inView: isIntersecting, entry });
        inViewRef.current = isIntersecting;
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    observe();

    return (): void => {
      unobserve();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    root,
    rootMargin,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    JSON.stringify(threshold),
  ]);

  return { ...state, observe, unobserve };
};

export default useInView;
