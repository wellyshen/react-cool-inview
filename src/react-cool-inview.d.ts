declare module 'react-cool-inview' {
  import { RefObject } from 'react';

  export interface BaseEvent {
    entry?: IntersectionObserverEntry;
    unobserve?: () => void;
  }

  export interface ChangeEvent extends BaseEvent {
    inView?: boolean;
  }

  export interface CallBack<T = BaseEvent> {
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
    readonly observe: () => void;
    readonly unobserve: () => void;
  }

  const useInView: (
    ref: RefObject<HTMLElement>,
    { ssr, root, rootMargin, threshold, onChange, onEnter, onLeave }?: Options
  ) => Return;

  export default useInView;
}
