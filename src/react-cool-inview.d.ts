declare module "react-cool-inview" {
  interface IntersectionObserverEntryV2 extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  interface ScrollDirection {
    readonly vertical?: "up" | "down";
    readonly horizontal?: "left" | "right";
  }

  export interface Event<T extends HTMLElement | null = HTMLElement> {
    entry: IntersectionObserverEntryV2;
    scrollDirection: ScrollDirection;
    observe: (element?: T | null) => void;
    unobserve: () => void;
  }

  export interface OnChange<T extends HTMLElement | null = HTMLElement> {
    (event: Event<T> & { inView: boolean }): void;
  }

  export interface OnEnter<T extends HTMLElement | null = HTMLElement> {
    (event: Event<T>): void;
  }

  export type OnLeave<T extends HTMLElement | null = HTMLElement> = OnEnter<T>;

  interface Options<T extends HTMLElement | null> {
    root?: HTMLElement;
    rootMargin?: string;
    threshold?: number | number[];
    trackVisibility?: boolean;
    delay?: number;
    unobserveOnEnter?: boolean;
    onChange?: OnChange<T>;
    onEnter?: OnEnter<T>;
    onLeave?: OnLeave<T>;
  }

  interface Return<T extends HTMLElement | null>
    extends Omit<Event<T>, "entry"> {
    inView: boolean;
    entry?: IntersectionObserverEntryV2;
    updatePosition?: () => void;
  }

  const useInView: <T extends HTMLElement | null = HTMLElement>(
    options?: Options<T>
  ) => Return<T>;

  export default useInView;
}
