# <em><b>REACT COOL INVIEW</b></em>

A React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that monitors an element enters or leaves the viewport (or another element) with highly-performant way, using [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). It's lightweight and super flexible, which can cover all the cases that you need, like [lazy-loading images](#lazy-loading-images) and videos, [infinite scroll](#infinite-scroll) web app, [triggering animations](#trigger-animations), [tracking impressions](#track-impressions), and more. Try it you will 👍🏻 it!

❤️ it? ⭐️ it on [GitHub](https://github.com/wellyshen/react-cool-inview/stargazers) or [Tweet](https://twitter.com/intent/tweet?text=With%20@react-cool-inview,%20I%20can%20build%20a%20performant%20web%20app.%20Thanks,%20@Welly%20Shen%20🤩) about it.

[![build status](https://img.shields.io/github/workflow/status/wellyshen/react-cool-inview/CI?style=flat-square)](https://github.com/wellyshen/react-cool-inview/actions?query=workflow%3ACI)
[![coverage status](https://img.shields.io/coveralls/github/wellyshen/react-cool-inview?style=flat-square)](https://coveralls.io/github/wellyshen/react-cool-inview?branch=master)
[![npm version](https://img.shields.io/npm/v/react-cool-inview?style=flat-square)](https://www.npmjs.com/package/react-cool-inview)
[![npm downloads](https://img.shields.io/npm/dm/react-cool-inview?style=flat-square)](https://www.npmtrends.com/react-cool-inview)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-inview?style=flat-square)](https://www.npmtrends.com/react-cool-inview)
[![gzip size](https://badgen.net/bundlephobia/minzip/react-cool-inview?label=gzip%20size&style=flat-square)](https://bundlephobia.com/result?p=react-cool-inview)
[![All Contributors](https://img.shields.io/badge/all_contributors-3-orange?style=flat-square)](#contributors-)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](CONTRIBUTING.md)
[![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fwellyshen%2Freact-cool-inview)](https://twitter.com/intent/tweet?text=With%20@react-cool-inview,%20I%20can%20build%20a%20performant%20web%20app.%20Thanks,%20@Welly%20Shen%20🤩)

![demo](https://user-images.githubusercontent.com/21308003/91034314-6af12600-e637-11ea-8a78-76c77ecaea51.gif)

⚡️ Try yourself: https://react-cool-inview.netlify.app

## Features

- 🚀 Monitors elements with highly-performant and non-main-thread blocking way, using [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API).
- 🎣 Easy to use, based on React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook).
- 🎛 Super flexible [API](#api) design which can cover [all the cases](#usage) that you need.
- 🖱️ Supports [scroll direction](#scrolling-direction), cool right?
- ✌🏻 Supports [Intersection Observer v2](#intersection-observer-v2).
- 📜 Supports [TypeScript](#working-in-typescript) type definition.
- 🗄️ Server-side rendering compatibility.
- 🦔 Tiny size ([~ 1.1kB gzipped](https://bundlephobia.com/result?p=react-cool-inview)). No external dependencies, aside for the `react`.

## Requirement

To use `react-cool-inview`, you must use `react@16.8.0` or greater which includes hooks.

## Installation

This package is distributed via [npm](https://www.npmjs.com/package/react-cool-inview).

```sh
$ yarn add react-cool-inview
# or
$ npm install --save react-cool-inview
```

## Usage

`react-cool-inview` has a flexible [API](#api) design, it can cover simple to complex use cases for you. Here are some ideas for how you can use it.

> ⚠️ [Most modern browsers support Intersection Observer natively](https://caniuse.com/#feat=intersectionobserver). You can also [add polyfill](#intersection-observer-polyfill) for full browser support.

### Basic Use Case

To monitor an element enters or leaves the viewport by the `inView` state and useful sugar events.

```js
import useInView from "react-cool-inview";

const App = () => {
  const { observe, unobserve, inView, scrollDirection, entry } = useInView({
    threshold: 0.25, // Default is 0
    onChange: ({ inView, scrollDirection, entry, observe, unobserve }) => {
      // Triggered whenever the target meets a threshold, e.g. [0.25, 0.5, ...]

      unobserve(); // To stop observing the current target element
      observe(); // To re-start observing the current target element
    },
    onEnter: ({ scrollDirection, entry, observe, unobserve }) => {
      // Triggered when the target enters the viewport
    },
    onLeave: ({ scrollDirection, entry, observe, unobserve }) => {
      // Triggered when the target leaves the viewport
    },
    // More useful options...
  });

  return <div ref={observe}>{inView ? "Hello, I am 🤗" : "Bye, I am 😴"}</div>;
};
```

> 💡 You don't have to call `unobserve` when the component is unmounted, this hook will handle it for you.

### Lazy-loading Images

It's super easy to build an image lazy-loading component with `react-cool-inview` to boost the performance of your web app.

```js
import useInView from "react-cool-inview";

const LazyImage = ({ width, height, ...rest }) => {
  const { observe, inView } = useInView({
    // Stop observe when the target enters the viewport, so the "inView" only triggered once
    unobserveOnEnter: true,
    // For better UX, we can grow the root margin so the image will be loaded before it comes to the viewport
    rootMargin: "50px",
  });

  return (
    <div className="placeholder" style={{ width, height }} ref={observe}>
      {inView && <img {...rest} />}
    </div>
  );
};
```

> 💡 Looking for a comprehensive image component? Try [react-cool-img](https://github.com/wellyshen/react-cool-img), it's my other component library.

### Infinite Scroll

Infinite scroll is a popular design technique like Facebook and Twitter feed etc., new content being loaded as you scroll down a page. The basic concept as below.

```js
import { useState } from "react";
import useInView from "react-cool-inview";
import axios from "axios";

const App = () => {
  const [todos, setTodos] = useState(["todo-1", "todo-2", "..."]);
  const { observe } = useInView({
    // For better UX, we can grow the root margin so the data will be loaded earlier
    rootMargin: "50px 0px",
    // When the last item comes to the viewport
    onEnter: ({ unobserve, observe }) => {
      // Pause observe when loading data
      unobserve();
      // Load more data
      axios.get("/todos").then((res) => {
        setTodos([...todos, ...res.todos]);
        // Resume observe after loading data
        observe();
      });
    },
  });

  return (
    <div>
      {todos.map((todo, idx) => (
        <div ref={idx === todos.length - 1 ? observe : null}>{todo}</div>
      ))}
    </div>
  );
};
```

> 💡 Compare to pagination, infinite scroll provides a seamless experience for users and it’s easy to see the appeal. But when it comes to render a large lists, performance will be a problem. But don't worry, [react-cool-virtual](https://github.com/wellyshen/react-cool-virtual) can help you out!

### Trigger Animations

Another great use case is to trigger CSS animations once they are visible to the users.

```js
import useInView from "react-cool-inview";

const App = () => {
  const { observe, inView } = useInView({
    // Stop observe when the target enters the viewport, so the "inView" only triggered once
    unobserveOnEnter: true,
    // Shrink the root margin, so the animation will be triggered once the target reach a fixed amount of visible
    rootMargin: "-100px 0px",
  });

  return (
    <div className="container" ref={observe}>
      <div className={inView ? "fade-in" : ""}>I'm a 🍟</div>
    </div>
  );
};
```

### Track Impressions

`react-cool-inview` can also play as an impression tracker, helps you fire an analytic event when a user sees an element or advertisement.

```js
import useInView from "react-cool-inview";

const App = () => {
  const { observe } = useInView({
    // For an element to be considered "seen", we'll say it must be 100% in the viewport
    threshold: 1,
    onEnter: ({ unobserve }) => {
      // Stop observe when the target enters the viewport, so the callback only triggered once
      unobserve();
      // Fire an analytic event to your tracking service
      someTrackingService.send("🍋 is seen");
    },
  });

  return <div ref={observe}>I'm a 🍋</div>;
};
```

## Scrolling Direction

`react-cool-inview` not only monitors an element enters or leaves the viewport but also tells you its scroll direction by the `scrollDirection` object. The object contains vertical (y-axios) and horizontal (x-axios) properties, they're calculated whenever the target element meets a `threshold`. If there's no enough condition for calculating, the value of the properties will be `undefined`. In addition, the value of the properties will sync with the scrolling direction of the viewport.

```js
import useInView from "react-cool-inview";

const App = () => {
  const {
    observe,
    inView,
    // vertical will be "up" or "down", horizontal will be "left" or "right"
    scrollDirection: { vertical, horizontal },
  } = useInView({
    // Scroll direction is calculated whenever the target meets a threshold
    // more trigger points the calculation will be more instant and accurate
    threshold: [0.2, 0.4, 0.6, 0.8, 1],
    onChange: ({ scrollDirection }) => {
      // We can also access the scroll direction from the event object
      console.log("Scroll direction: ", scrollDirection.vertical);
    },
  });

  return (
    <div ref={observe}>
      <div>{inView ? "Hello, I am 🤗" : "Bye, I am 😴"}</div>
      <div>{`You're scrolling ${vertical === "up" ? "⬆️" : "⬇️"}`}</div>
    </div>
  );
};
```

If you jump to a section by the [Element.scrollTop](https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTop) and encounter the wrong value of the `scrollDirection`. You can use `updatePosition` method to correct the behavior.

```js
import { useEffect } from "react";
import useInView from "react-cool-inview";

const App = () => {
  const { observe, scrollDirection, updatePosition } = useInView({
    threshold: [0.2, 0.4, 0.6, 0.8, 1],
  });

  useEffect(() => {
    window.scrollTo(0, 500);
    updatePosition(); // Ensure the target element's position has been updated after the "window.scrollTo"
  }, []);

  return (
    <div ref={observe}>
      <div>{`You're scrolling ${
        scrollDirection.vertical === "up" ? "⬆️" : "⬇️"
      }`}</div>
    </div>
  );
};
```

## Intersection Observer v2

The Intersection Observer v1 can perfectly tell you when an element is scrolled into the viewport, but it doesn't tell you whether the element is covered by something else on the page or whether the element has any visual effects applied to it (like `transform`, `opacity`, `filter` etc.) that can make it invisible. The main concern that has surfaced is how this kind of knowledge could be helpful in preventing [clickjacking](https://en.wikipedia.org/wiki/Clickjacking) and UI redress attacks (read this [article](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2) to learn more).

If you want to track the click-through rate (CTR) or impression of an element, which is actually visible to a user, [Intersection Observer v2](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2) can be the savior. Which introduces a new boolean field named [isVisible](https://w3c.github.io/IntersectionObserver/v2/#dom-intersectionobserverentry-isvisible). A `true` value guarantees that an element is visible on the page and has no visual effects applied on it. A `false` value is just the opposite. The characteristic of the `isVisible` is integrated with the `inView` state and related events (like onEnter, onLeave etc.) to provide a better DX for you.

When using the v2, there're somethings we need to know:

- Check [browser compatibility](https://caniuse.com/#feat=intersectionobserver-v2). If a browser doesn't support the v2, we will fallback to the v1 behavior.
- Understand [how visibility is calculated](https://w3c.github.io/IntersectionObserver/v2/#calculate-visibility-algo).
- Visibility is much more expensive to compute than intersection, only use it when needed.

To use Intersection Observer v2, we must set the `trackVisibility` and `delay` options.

```js
import useInView from "react-cool-inview";

const App = () => {
  // With Intersection Observer v2, the "inView" not only tells you the target
  // is intersecting with the root, but also guarantees it's visible on the page
  const { observe, inView } = useInView({
    // Track the actual visibility of the target
    trackVisibility: true,
    // Set a minimum delay between notifications, it must be set to 100 (ms) or greater
    // For performance perspective, use the largest tolerable value as much as possible
    delay: 100,
    onEnter: () => {
      // Triggered when the target is visible and enters the viewport
    },
    onLeave: () => {
      // Triggered when the target is visible and leaves the viewport
    },
  });

  return <div ref={observe}>{inView ? "Hello, I am 🤗" : "Bye, I am 😴"}</div>;
};
```

## How to Share A `ref`?

You can share a `ref` as follows:

```js
import { useRef } from "react";
import useInView from "react-cool-inview";

const App = () => {
  const ref = useRef();
  const { observe } = useInView();

  return (
    <div
      ref={(el) => {
        observe(el); // Set the target element for monitoring
        ref.current = el; // Share the element for other purposes
      }}
    />
  );
};
```

## Working in TypeScript

This hook supports [TypeScript](https://www.typescriptlang.org), you can tell the hook what type of element you are going to observe through the [generic type](https://www.typescriptlang.org/docs/handbook/generics.html):

```ts
const App = () => {
  const { observe } = useInView<HTMLDivElement>();

  return <div ref={observe} />;
};
```

> 💡 For more available types, please [check it out](src/react-cool-inview.d.ts).

## API

```js
const returnObj = useInView(options?: object);
```

### Return object

It's returned with the following properties.

| Key               | Type     | Default | Description                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------- | -------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `observe`         | function |         | To set a target element for monitoring or re-start observing the current target element.                                                                                                                                                                                                                                                                                                          |
| `unobserve`       | function |         | To stop observing the current target element.                                                                                                                                                                                                                                                                                                                                                     |
| `inView`          | boolean  |         | The visible state of the target element. If it's `true`, the target element has become at least as visible as the threshold that was passed. If it's `false`, the target element is no longer as visible as the given threshold. Supports [Intersection Observer v2](#intersection-observer-v2).                                                                                                  |
| `scrollDirection` | object   |         | The scroll direction of the target element. Which contains `vertical` and `horizontal` properties. See [scroll direction](#scrolling-direction) for more information.                                                                                                                                                                                                                             |
| `entry`           | object   |         | The [IntersectionObserverEntry](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry) of the target element. Which may contain the [isVisible](https://w3c.github.io/IntersectionObserver/v2/#dom-intersectionobserverentry-isvisible) property of the Intersection Observer v2, depends on the [browser compatibility](https://caniuse.com/#feat=intersectionobserver-v2). |
| `updatePosition`  | function |         | To update the current position of the target element for [some cases](#scrolling-direction).                                                                                                                                                                                                                                                                                                      |

### Parameter

The `options` provides the following configurations and event callbacks for you.

| Key                | Type               | Default  | Description                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ------------------ | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `root`             | HTMLElement        | `window` | The element that is used as the viewport for checking visibility of the target. Must be the ancestor of the target. Defaults to the browser viewport if not specified or if `null`.                                                                                                                                                                      |
| `rootMargin`       | string             | `0px`    | Margin around the root. Can have values similar to the CSS [margin](https://developer.mozilla.org/en-US/docs/Web/CSS/margin`) property, e.g. `"10px 20px 30px 40px"` (top, right, bottom, left). The values can be percentages. This set of values serves to grow or shrink each side of the root element's bounding box before computing intersections. |
| `threshold`        | number \| number[] | `0`      | Indicates at what percentage of the target's visibility the observer's callback should be executed. If you only want to detect when visibility passes the 50% mark, you can use a value of 0.5. If you want the callback to run every time visibility passes another 25%, you would specify the array [0, 0.25, 0.5, 0.75, 1].                           |
| `trackVisibility`  | boolean            | `false`  | Indicates whether the intersection observer will track changes in a target’s [visibility](https://w3c.github.io/IntersectionObserver/v2/#visibility). It's required when [using Intersection Observer v2](#intersection-observer-v2).                                                                                                                    |
| `delay`            | number             |          | Indicates the minimum delay in milliseconds between notifications from the intersection observer for a given target. It's required when [using Intersection Observer v2](#intersection-observer-v2).                                                                                                                                                     |
| `unobserveOnEnter` | boolean            | `false`  | Stops observe once the target element intersects with the intersection observer's root. It's useful when you only want to trigger the hook once, e.g. [scrolling to run animations](#trigger-animations).                                                                                                                                                |
| `onChange`         | function           |          | It's invoked whenever the target element meets a threshold specified for the intersection observer. The callback receives an event object which the same with the [return object](#return-object) of the hook.                                                                                                                                           |
| `onEnter`          | function           |          | It's invoked when the target element enters the viewport. The callback receives an event object which the same with the [return object](#return-object) of the hook except for `inView`. Supports [Intersection Observer v2](#intersection-observer-v2).                                                                                                 |
| `onLeave`          | function           |          | It's invoked when the target element leaves the viewport. The callback receives an event object which the same with the [return object](#return-object) of the hook except for `inView`. Supports [Intersection Observer v2](#intersection-observer-v2).                                                                                                 |

## `rootMargin` Not Working As Expected?

If your web app is running in an `<iframe>` or you have a custom `root`, the viewport won't be the current `document`. Read the [doc](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API#The_intersection_root_and_root_margin) to understand how do **root and root margin** work.

## Intersection Observer Polyfill

[Intersection Observer has good support amongst browsers](https://caniuse.com/#feat=intersectionobserver), but it's not universal. You'll need to polyfill browsers that don't support it. Polyfills is something you should do consciously at the application level. Therefore `react-cool-inview` doesn't include it.

You can use W3C's [polyfill](https://www.npmjs.com/package/intersection-observer):

```sh
$ yarn add intersection-observer
# or
$ npm install --save intersection-observer
```

Then import it at your app's entry point:

```js
import "intersection-observer";
```

Or use dynamic imports to only load the file when the polyfill is required:

```js
(async () => {
  if (!("IntersectionObserver" in window))
    await import("intersection-observer");
})();
```

[Polyfill.io](https://polyfill.io/v3) is an alternative way to add the polyfill when needed.

## Performance Issues

Be aware that the callback of the `onChange` event is executed on the main thread, it should operate as quickly as possible. If any time-consuming needs to be done, use [requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback) or [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout).

```js
onChange = (event) => requestIdleCallback(() => this.handleChange(event));
```

## Articles / Blog Posts

> 💡 If you have written any blog post or article about `react-cool-inview`, please open a PR to add it here.

- Featured on [React Status #187](https://react.statuscode.com/issues/187).

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://wellyshen.com"><img src="https://avatars1.githubusercontent.com/u/21308003?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Welly</b></sub></a><br /><a href="https://github.com/wellyshen/react-cool-inview/commits?author=wellyshen" title="Code">💻</a> <a href="https://github.com/wellyshen/react-cool-inview/commits?author=wellyshen" title="Documentation">📖</a> <a href="#maintenance-wellyshen" title="Maintenance">🚧</a></td>
    <td align="center"><a href="https://github.com/xregitx"><img src="https://avatars0.githubusercontent.com/u/5581875?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Nhan Nguyen</b></sub></a><br /><a href="https://github.com/wellyshen/react-cool-inview/commits?author=xregitx" title="Code">💻</a></td>
    <td align="center"><a href="https://lumenstudio.dev/"><img src="https://avatars.githubusercontent.com/u/5436545?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Yann Pringault</b></sub></a><br /><a href="https://github.com/wellyshen/react-cool-inview/issues?q=author%3AKerumen" title="Bug reports">🐛</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
