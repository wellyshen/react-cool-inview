declare module "react-cool-inview" {
  import { RefObject } from "react";

  interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  interface ScrollDirection {
    readonly vertical?: "up" | "down";
    readonly horizontal?: "left" | "right";
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

  interface Return<T> extends Omit<BaseEvent, "entry"> {
    ref: RefObject<T>;
    inView: boolean;
    entry?: IntersectionObserverEntryV2;
    updatePosition?: () => void;
  }

  const useInView: <T extends HTMLElement>(options?: Options<T>) => Return<T>;

  export default useInView;
}
