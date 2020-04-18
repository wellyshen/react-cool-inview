declare module 'react-cool-inview' {
  import { RefObject } from 'react';

  interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  export interface BaseEvent {
    entry?: IntersectionObserverEntryV2;
    observe?: () => void;
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
    readonly entry?: IntersectionObserverEntryV2;
    readonly observe: () => void;
    readonly unobserve: () => void;
  }

  const useInView: (ref: RefObject<HTMLElement>, options?: Options) => Return;

  export default useInView;
}
