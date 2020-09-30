import { RefObject, useRef, useEffect } from "react";

export default <T>(val: T): RefObject<T> => {
  const ref = useRef(val);

  useEffect(() => {
    ref.current = val;
  });

  return ref;
};
