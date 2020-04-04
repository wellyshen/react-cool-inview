declare module 'react-cool-inview' {
  import { RefObject } from 'react';

  interface Event {
    entry?: IntersectionObserverEntry;
    unobserve?: () => void;
  }

  export interface ChangeEvent extends Event {
    inView?: boolean;
  }

  export interface CallBack<T = Event> {
    (event?: T): void;
  }

  interface Options {
    ssr?: boolean;
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number | number[];
    onChange?: CallBack<ChangeEvent>;
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

  const useInView: (
    ref: RefObject<HTMLElement>,
    { ssr, root, rootMargin, threshold, onChange, onEnter, onLeave }?: Options
  ) => Return;

  export default useInView;
}
