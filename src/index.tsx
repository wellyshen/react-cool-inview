import { RefObject, useState, useRef, useEffect, useCallback } from 'react';

// FIXME: Make sure URL is correct
export const observerErr =
  "💡react-cool-inview: this browser doesn't support IntersectionObserver, please install polyfill: https://github.com/wellyshen/react-cool-inview#intersectionobserver-polyfill";

interface Event {
  entry?: IntersectionObserverEntry;
  unobserve?: () => void;
}
interface ChangeEvent extends Event {
  inView?: boolean;
}
type OnChange = CallBack<ChangeEvent>;
interface CallBack<T = Event> {
  (event?: T): void;
}
interface Options {
  ssr?: boolean;
  root?: HTMLElement;
  rootMargin?: string;
  threshold?: number | number[];
  onChange?: OnChange;
  onEnter?: CallBack;
  onLeave?: CallBack;
}
interface Return {
  readonly inView: boolean;
  readonly entry: IntersectionObserverEntry | null;
  readonly isObserve: boolean;
  readonly observe: () => void;
  readonly unobserve: () => void;
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
  const [inView, setInView] = useState<boolean>(ssr);
  const inViewRef = useRef<boolean>(ssr);
  const isObserveRef = useRef<boolean>(false);
  const entryRef = useRef<IntersectionObserverEntry>(null);
  const observerRef = useRef<IntersectionObserver>(null);
  const onChangeRef = useRef<OnChange>(null);
  const onEnterRef = useRef<CallBack>(null);
  const onLeaveRef = useRef<CallBack>(null);

  useEffect(() => {
    if (!onChangeRef.current) onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!onEnterRef.current) onEnterRef.current = onEnter;
  }, [onEnter]);

  useEffect(() => {
    if (!onLeaveRef.current) onLeaveRef.current = onLeave;
  }, [onLeave]);

  const observe = useCallback((): void => {
    if (isObserveRef.current || !ref.current || !observerRef.current) return;

    observerRef.current.observe(ref.current);
    isObserveRef.current = true;
  }, [ref]);

  const unobserve = useCallback((): void => {
    if (!isObserveRef.current || !observerRef.current) return;

    observerRef.current.disconnect();
    isObserveRef.current = false;
  }, []);

  const callback = useCallback(
    ([entry]: IntersectionObserverEntry[]): void => {
      const { isIntersecting } = entry;
      const e = { entry, unobserve };

      if (isIntersecting && !inViewRef.current) {
        setInView(true);
        inViewRef.current = true;
        onEnterRef.current(e);
      }

      if (!isIntersecting && inViewRef.current) {
        setInView(false);
        inViewRef.current = false;
        onLeaveRef.current(e);
      }

      if (onChangeRef.current)
        onChangeRef.current({
          ...e,
          inView: isIntersecting,
        });

      entryRef.current = entry;
    },
    [unobserve]
  );

  useEffect(() => {
    if (!window.IntersectionObserver) {
      console.error(observerErr);
      return (): void => null;
    }

    unobserve();

    observerRef.current = new IntersectionObserver(callback, {
      root,
      rootMargin,
      threshold,
    });

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
    observe,
    unobserve,
    callback,
  ]);

  return {
    inView,
    entry: entryRef.current,
    isObserve: isObserveRef.current,
    observe,
    unobserve,
  };
};

export default useInView;
