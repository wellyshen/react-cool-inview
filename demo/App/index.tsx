import React, { SFC, useState } from 'react';
import { Global, css } from '@emotion/core';
import normalize from 'normalize.css';

import GitHubCorner from '../GitHubCorner';
import Slider from '../Slider';
import Card from '../Card';
import { root, container, title, subtitle, log, frame } from './styles';

interface State {
  str: string;
  dir: string;
}

const emojis = [
  '🍕',
  '🍎',
  '☕️',
  '🍖',
  '🍋',
  '🍺',
  '🍪',
  '🍒',
  '🥛',
  '🧀',
  '🍑',
  '🍵',
];

const App: SFC<{}> = () => {
  const [state, setState] = useState<State>({ str: emojis[0], dir: '' });

  const renderCards = (): JSX.Element[] =>
    emojis.map((emoji) => (
      <Card
        key={emoji}
        string={emoji}
        onEnter={(str: string, dir: string): void => {
          setState({ str, dir });
        }}
      />
    ));

  const { str, dir } = state;

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
        <div css={log}>
          Hello! <Slider string={str} direction={dir} /> comes in.
        </div>
        <div css={frame}>{renderCards()}</div>
      </div>
    </>
  );
};

export default App;
