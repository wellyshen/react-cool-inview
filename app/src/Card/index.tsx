import { useInView } from "react-cool-inview";

import styles from "./styles.module.scss";

interface Props {
  string: string;
  onEnter: (str: string, dir: string) => void;
  root: HTMLDivElement|null;
}

export default ({ string, onEnter, root }: Props): JSX.Element => {
  const { observe } = useInView<HTMLDivElement>({
    root,
    rootMargin: "-20px", // update if you change card margin
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
