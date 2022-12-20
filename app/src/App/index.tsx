import type { FC } from "react";
import { useState, useRef } from "react";

import GitHubCorner from "../GitHubCorner";
import Slider from "../Slider";
import Card from "../Card";
import styles from "./styles.module.scss";

interface State {
  str: string;
  dir: string;
}

const emojis = [
  "🍕",
  "🍎",
  "☕️",
  "🍖",
  "🍋",
  "🍺",
  "🍪",
  "🍒",
  "🥛",
  "🧀",
  "🍑",
  "🍵",
];

const App: FC = () => {
  const [state, setState] = useState<State>({ str: emojis[0], dir: "" });
  const sliderRef = useRef<HTMLDivElement>(null);

  const renderCards = (): JSX.Element[] =>
    emojis.map((emoji) => (
      <Card
        key={emoji}
        string={emoji}
        onEnter={(str: string, dir: string) => {
          setState({ str, dir });
        }}
        root={sliderRef.current}
      />
    ));

  const { str, dir } = state;

  return (
    <div className={styles.container}>
      <GitHubCorner url="https://github.com/wellyshen/react-cool-inview" />
      <h1 className={styles.title}>REACT COOL INVIEW</h1>
      <p className={styles.subtitle}>
        React hook to monitor an element enters or leaves the viewport (or
        another element).
      </p>
      <div className={styles.log}>
        Hello! <Slider string={str} direction={dir} /> comes in.
      </div>
      <div ref={sliderRef} className={styles.frame}>{renderCards()}</div>
    </div>
  );
};

export default App;
