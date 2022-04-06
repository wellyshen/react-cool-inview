import type { ReactElement } from "react";
import { cloneElement } from "react";

import type { Options } from "./useInView";
import useInView from "./useInView";

interface Props extends Options<HTMLElement | null> {
  children: ReactElement;
}

const InView = ({ children, ...props }: Props) => {
  const { observe, ...rest } = useInView(props);
  return cloneElement(children, { observe, ...rest });
};

export default InView;
