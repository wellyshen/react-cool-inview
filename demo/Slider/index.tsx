import { useState, useEffect } from "react";

import { slider, wrapper, font } from "./styles";

interface Props {
  string: string;
  direction: string;
}

const defaultY = "-33.333333333333333%";

export default ({ string, direction }: Props): JSX.Element => {
  const [strs, setStrs] = useState<string[]>(["", "", ""]);
  const [y, setY] = useState<string>(defaultY);

  useEffect(() => {
    if (direction === "up") {
      setStrs((prevStrs) => [prevStrs[0], prevStrs[1], string]);
      setY("-66.666666666666666%");
    } else if (direction === "down") {
      setStrs((prevStrs) => [string, prevStrs[1], prevStrs[2]]);
      setY("0");
    } else {
      setStrs(["", string, ""]);
    }
  }, [string, direction]);

  const handleTransitionEnd = () => {
    setStrs(["", string, ""]);
    setY(defaultY);
  };

  return (
    <div css={slider}>
      <div
        css={y !== defaultY && wrapper}
        style={{ transform: `translate3d(0, ${y}, 0)` }}
        onTransitionEnd={handleTransitionEnd}
      >
        {strs.map((str, idx) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={str + idx} css={font}>
            {str}
          </div>
        ))}
      </div>
    </div>
  );
};
