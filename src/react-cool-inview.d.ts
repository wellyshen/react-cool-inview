declare module "react-cool-inview" {
  export interface IntersectionObserverEntryV2
    extends IntersectionObserverEntry {
    readonly isVisible?: boolean;
  }

  export interface ScrollDirection {
    readonly vertical?: "up" | "down";
    readonly horizontal?: "left" | "right";
  }

  export interface Event<T extends HTMLElement | null = HTMLElement> {
    readonly entry: IntersectionObserverEntryV2;
    readonly scrollDirection: ScrollDirection;
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

  export interface Options<T extends HTMLElement | null> {
    root?: HTMLElement | null;
    rootMargin?: string;
    threshold?: number | number[];
    trackVisibility?: boolean;
    delay?: number;
    unobserveOnEnter?: boolean;
    onChange?: OnChange<T>;
    onEnter?: OnEnter<T>;
    onLeave?: OnLeave<T>;
  }

  export interface Return<T extends HTMLElement | null>
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
