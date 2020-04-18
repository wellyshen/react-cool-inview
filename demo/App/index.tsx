import React, { SFC, useRef } from 'react';
import { Global, css } from '@emotion/core';
import normalize from 'normalize.css';

import GitHubCorner from '../GitHubCorner';
import useInView from '../../src';
import { root, container, title, subtitle, el } from './styles';

const App: SFC<{}> = () => {
  const ref = useRef();
  const { inView, entry, unobserve, observe } = useInView(ref, {
    // unobserveOnEnter: true,
    threshold: 0.25,
    // trackVisibility: true,
    // delay: 100,
    onChange: ({ inView: view, entry: en, unobserve: un }) => {
      // console.log('LOG ===> onChange');
      // console.log('LOG ===> ', view);
      // console.log('LOG ===> ', en);
      // un();
    },
    onEnter: ({ unobserve: un }) => {
      console.log('LOG ===> onEnter');
      // un();
    },
    onLeave: ({ unobserve: un }) => {
      console.log('LOG ===> onLeave');
      // un();
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
