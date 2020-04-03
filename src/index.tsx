import { RefObject, useState, useRef, useEffect } from 'react';

// FIXME: Make sure URL is correct
export const observerErr =
  "💡react-cool-inview: this browser doesn't support IntersectionObserver, please install polyfill to enable lazy loading. More info: https://github.com/wellyshen/react-cool-inview#intersectionobserver-polyfill";

interface Callback {
  (entry?: IntersectionObserverEntry, observer?: IntersectionObserver): void;
}
interface Options {
  ssr?: boolean;
  root?: Element;
  rootMargin?: string;
  threshold?: number | number[];
  onChange?: Callback;
}
interface Return {
  readonly inView: boolean;
  readonly entry: IntersectionObserverEntry | null;
  readonly observer: IntersectionObserver | null;
}

const useInView = (
  ref: RefObject<HTMLElement>,
  { ssr = false, root, rootMargin, threshold, onChange }: Options = {}
): Return => {
  const [inView, setInView] = useState(ssr);
  const entryRef = useRef(null);
  const observerRef = useRef(null);
  const onChangeRef = useRef(null);

  useEffect(() => {
    if (!onChangeRef.current) onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!window.IntersectionObserver) {
      console.error(observerErr);
      return (): void => null;
    }

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry], observer) => {
        setInView(entry.isIntersecting);
        entryRef.current = entry;
        if (onChangeRef.current) onChangeRef.current(entry, observer);
      },
      {
        root,
        rootMargin,
        threshold,
      }
    );

    if (ref.current) observerRef.current.observe(ref.current);

    return (): void => {
      observerRef.current.disconnect();
    };
  }, [ref, root, rootMargin, threshold, onChange]);

  return { inView, entry: entryRef.current, observer: observerRef.current };
};

export default useInView;
