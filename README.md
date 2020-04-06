> 🚧 This package is in-progress, [API](#api) may be changed frequently. I don't recommend you to use it now. If you're willing to be an early user. Please note any changes via [release](https://github.com/wellyshen/react-cool-inview/releases). Here's the [milestone](#milestone).

# React Cool Inview

A React [hook](https://reactjs.org/docs/hooks-custom.html#using-a-custom-hook) that monitors an element enters or leaves the viewport (or another element) with performant and efficient way, using [Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API). It's lightweight and super flexible, which can help you do many things, like [lazy-loading images](#lazy-loading-images), scrolling to load content, triggering animations, tracking advertisement impressions etc. Try it you will 👍🏻 it!

[![build status](https://img.shields.io/travis/wellyshen/react-cool-inview/master?style=flat-square)](https://travis-ci.org/wellyshen/react-cool-inview)
[![coverage status](https://img.shields.io/coveralls/github/wellyshen/react-cool-inview?style=flat-square)](https://coveralls.io/github/wellyshen/react-cool-inview?branch=master)
[![npm version](https://img.shields.io/npm/v/react-cool-inview?style=flat-square)](https://www.npmjs.com/package/react-cool-inview)
[![npm downloads](https://img.shields.io/npm/dm/react-cool-inview?style=flat-square)](https://www.npmtrends.com/react-cool-inview)
[![npm downloads](https://img.shields.io/npm/dt/react-cool-inview?style=flat-square)](https://www.npmtrends.com/react-cool-inview)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/react-cool-inview?style=flat-square)](https://bundlephobia.com/result?p=react-cool-inview)
[![MIT licensed](https://img.shields.io/github/license/wellyshen/react-cool-inview?style=flat-square)](https://raw.githubusercontent.com/wellyshen/react-cool-inview/master/LICENSE)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange?style=flat-square)](#contributors-)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square)](https://github.com/wellyshen/react-cool-inview/blob/master/CONTRIBUTING.md)
[![Twitter URL](https://img.shields.io/twitter/url?style=social&url=https%3A%2F%2Fgithub.com%2Fwellyshen%2Freact-cool-inview)](https://twitter.com/intent/tweet?text=With%20@react-cool-inview,%20I%20can%20build%20a%20performant%20web%20app.%20Thanks,%20@Welly%20Shen%20🤩)

## Milestone

- [x] Detect an element is in-view or not
- [x] `onEnter`, `onLeave`, `onChange` events
- [x] Trigger once feature
- [x] Support server-side rendering
- [x] Support [Intersection Observer v2](https://developers.google.com/web/updates/2019/02/intersectionobserver-v2)
- [ ] Unit testing
- [ ] Demo app
- [ ] Demo code
- [ ] Typescript type definition
- [ ] Documentation

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

To monitor an element enters or leaves the browser viewport by the `inView` state and useful sugar events.

```js
import React, { useRef } from 'react';
import useInView from 'react-cool-inview';

const App = () => {
  const ref = useRef();
  const { inView, entry } = useInView(ref, {
    threshold: 0.25, // Default is 0
    onEnter: ({ entry, unobserve }) => {
      // Triggered when the target enters the browser viewport (start intersecting)
    },
    onLeave: ({ entry, unobserve }) => {
      // Triggered when the target leaves the browser viewport (end intersecting)
    },
  });

  return <div ref={ref}>{inView ? 'Hello, I am 🤗' : 'Bye, I am 😴'}</div>;
};
```

## Lazy-loading Images

Coming soon...

## API

Coming soon...

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
import 'intersection-observer';
```

Or load the polyfill only if needed:

```js
if (!window.IntersectionObserver) require('intersection-observer');
```

[Polyfill.io](https://polyfill.io/v3) is an alternative way to add the polyfill when needed.
