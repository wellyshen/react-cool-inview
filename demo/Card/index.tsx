import React, { ReactElement, useRef } from 'react';

import useInView from '../../src';
import { card, font } from './styles';

interface Props {
  emoji: string;
  onEnter: (str: string) => void;
}

export default ({ emoji, onEnter }: Props): ReactElement => {
  const ref = useRef();
  useInView(ref, {
    threshold: 0.5,
    onEnter: () => {
      onEnter(emoji);
    },
  });

  return (
    <div css={card} ref={ref}>
      <span css={font}>{emoji}</span>
    </div>
  );
};
