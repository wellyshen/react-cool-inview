import React, { SFC, ReactElement, useState } from 'react';
import { Global, css } from '@emotion/core';
import normalize from 'normalize.css';

import GitHubCorner from '../GitHubCorner';
import Card from '../Card';
import { root, container, title, subtitle, log, frame } from './styles';

const emojis = ['🍎', '🍋', '🍒', '🍅', '🍆', '🌶', '🌽', '🧀', '🥚', '🍑'];

const App: SFC<{}> = () => {
  const [str, setStr] = useState('');

  const renderCards = (): ReactElement[] =>
    emojis.map((emoji) => (
      <Card
        key={emoji}
        emoji={emoji}
        onEnter={(emo: string): void => {
          setStr(emo);
        }}
      />
    ));

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
        <div css={log}>Halo! {str} enters the viewport.</div>
        <div css={frame}>{renderCards()}</div>
      </div>
    </>
  );
};

export default App;
