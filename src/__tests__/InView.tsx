import { render, screen, act } from "@testing-library/react";

import type { Return } from "../useInView";
import InView from "../InView";

describe("InView", () => {
  interface Event {
    intersectionRatio?: number;
    isIntersecting?: boolean;
    boundingClientRect?: { x?: number; y?: number };
    isVisible?: boolean;
  }

  let callback: (e: Event[]) => void;
  const mockIntersectionObserver = jest.fn((cb, opts) => ({
    ...opts,
    observe: () => {
      callback = cb;
    },
    disconnect: () => null,
  }));

  const triggerObserverCb = (isIntersecting: boolean) => {
    callback([
      {
        isIntersecting,
        intersectionRatio: 0,
        isVisible: undefined,
        boundingClientRect: { x: 0, y: 0 },
      },
    ]);
  };

  const Comp = ({ inView, observe }: Partial<Return<HTMLDivElement>>) => (
    <div ref={observe}>{inView ? "Show" : "Hide"}</div>
  );

  beforeAll(() => {
    global.IntersectionObserver = mockIntersectionObserver;
    global.IntersectionObserverEntry = jest.fn();
  });

  it("should work correctly", () => {
    render(
      <InView>
        <Comp />
      </InView>
    );
    expect(screen.getByText("Hide")).toBeTruthy();
    act(() => {
      triggerObserverCb(true);
    });
    expect(screen.getByText("Show")).toBeTruthy();
    act(() => {
      triggerObserverCb(false);
    });
    expect(screen.getByText("Hide")).toBeTruthy();
  });
});
