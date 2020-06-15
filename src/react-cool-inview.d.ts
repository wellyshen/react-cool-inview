declare module "react-cool-inview" {
  import { RefObject } from "react";

  interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  interface ScrollDirection {
    vertical?: "up" | "down";
    horizontal?: "left" | "right";
  }

  export interface BaseEvent {
    entry: IntersectionObserverEntryV2;
    scrollDirection: ScrollDirection;
    observe: () => void;
    unobserve: () => void;
  }

  export interface ChangeEvent extends BaseEvent {
    inView: boolean;
  }

  export interface Callback<T = BaseEvent> {
    (event: T): void;
  }

  interface Options<T> {
    ref?: RefObject<T>;
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number | number[];
    trackVisibility?: boolean;
    delay?: number;
    unobserveOnEnter?: boolean;
    onChange?: Callback<ChangeEvent>;
    onEnter?: Callback;
    onLeave?: Callback;
  }

  interface Return<T> {
    ref: RefObject<T>;
    readonly inView: boolean;
    readonly scrollDirection: ScrollDirection;
    readonly entry?: IntersectionObserverEntryV2;
    readonly observe: () => void;
    readonly unobserve: () => void;
  }

  const useInView: <T>(options?: Options<T>) => Return<T>;

  export default useInView;
}
