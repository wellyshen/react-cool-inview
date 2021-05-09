import useInView from "../../src";
import { card, font } from "./styles";

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
    <div css={card} ref={observe}>
      <span css={font}>{string}</span>
    </div>
  );
};
