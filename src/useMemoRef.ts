import { RefObject, useRef, useEffect } from 'react';

export default <T>(val: T): RefObject<any> => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) ref.current = val;
  }, [val]);

  return ref;
};
