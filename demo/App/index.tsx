import React, { SFC, useRef } from 'react';
import { Global, css } from '@emotion/core';
import normalize from 'normalize.css';

import GitHubCorner from '../GitHubCorner';
import useInView from '../../src';
import { root, container, title, subtitle, el } from './styles';

const App: SFC<{}> = () => {
  const ref = useRef();
  const { inView, entry, isObserve, unobserve, observe } = useInView(ref, {
    // ssr: true,
    threshold: [0.2, 0.4],
    onChange: ({ inView: view }) => {
      // console.log('LOG ===> onChange');
      // console.log('LOG ===> ', view);
      // console.log('LOG ===> ', entry.intersectionRatio);
    },
    onEnter: ({ unobserve: un }) => {
      // un();
      // console.log('LOG ===> onEnter');
    },
    onLeave: ({ unobserve: un }) => {
      // un();
      // console.log('LOG ===> onLeave');
    },
  });

  // console.log('LOG ===> ', inView, entry);

  return (
    <>
      <Global
        styles={css`
          ${normalize}
          ${root}
        `}
      />
      <div css={container}>
        <GitHubCorner url="https://github.com/wellyshen/react-cool-inview" />
        <h1 css={title}>React Cool Inview</h1>
        <p css={subtitle}>
          React hook to monitor an element enters or leaves the viewport (or
          another element).
        </p>
        <button
          type="button"
          onClick={() => {
            unobserve();
          }}
        >
          Unobserve
        </button>
        <button
          type="button"
          onClick={() => {
            observe();
          }}
        >
          Observe
        </button>
        <div css={el} ref={ref}>
          {`I am ${inView ? 'visible' : 'hidden'}`}
        </div>
      </div>
    </>
  );
};

export default App;
