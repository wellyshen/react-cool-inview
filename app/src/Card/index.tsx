import { useInView } from "react-cool-inview";

import styles from "./styles.module.scss";

interface Props {
  string: string;
  onEnter: (str: string, dir: string) => void;
}

export default ({ string, onEnter }: Props): JSX.Element => {
  const { observe } = useInView<HTMLDivElement>({
    threshold: 0.5,
    onEnter: ({ scrollDirection }) => {
      onEnter(string, scrollDirection.vertical || "");
    },
  });

  return (
    <div className={styles.card} ref={observe}>
      <span className={styles.font}>{string}</span>
    </div>
  );
};
