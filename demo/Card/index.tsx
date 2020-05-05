import React, { useRef } from "react";

import useInView from "../../src";
import { card, font } from "./styles";

interface Props {
  string: string;
  onEnter: (str: string, dir: string) => void;
}

export default ({ string, onEnter }: Props): JSX.Element => {
  const ref = useRef<HTMLDivElement>();
  useInView(ref, {
    threshold: 0.5,
    onEnter: ({ scrollDirection }) => {
      onEnter(string, scrollDirection.vertical || "");
    },
  });

  return (
    <div css={card} ref={ref}>
      <span css={font}>{string}</span>
    </div>
  );
};
