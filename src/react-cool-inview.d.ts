declare module 'react-cool-inview' {
  import { RefObject } from 'react';

  interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  export interface BaseEvent {
    entry?: IntersectionObserverEntryV2;
    unobserve?: () => void;
  }

  export interface ChangeEvent extends BaseEvent {
    inView?: boolean;
  }

  export interface CallBack<T = BaseEvent> {
    (event?: T): void;
  }

  interface Options {
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number | number[];
    trackVisibility?: boolean;
    delay?: number;
    unobserveOnEnter?: boolean;
    onChange?: CallBack<ChangeEvent>;
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

  const useInView: (
    ref: RefObject<HTMLElement>,
    {
      root,
      rootMargin,
      threshold,
      trackVisibility,
      delay,
      unobserveOnEnter,
      onChange,
      onEnter,
      onLeave,
    }?: Options
  ) => Return;

  export default useInView;
}
