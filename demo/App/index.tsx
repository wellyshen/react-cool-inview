import React, { SFC, useRef } from 'react';
import { Global, css } from '@emotion/core';
import normalize from 'normalize.css';

import GitHubCorner from '../GitHubCorner';
import useInView from '../../src';
import { root, container, title, subtitle, el } from './styles';

const App: SFC<{}> = () => {
  const ref = useRef();
  const { inView, entry, observer } = useInView(ref, {
    ssr: true,
    threshold: [0.5, 0.75, 1],
  });

  console.log('LOG ===> entry: ', entry);
  console.log('LOG ===> observer: ', observer);

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
        <div css={el} ref={ref}>
          {`I am ${inView ? 'visible' : 'hidden'}`}
        </div>
      </div>
    </>
  );
};

export default App;
