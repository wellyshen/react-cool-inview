import { renderHook } from '@testing-library/react-hooks';

import useInView from '..';

describe('useInView', () => {
  // @ts-ignore
  const mockIntersectionObserver = jest.fn((cb, options) => ({
    ...options,
  }));

  it('should ...', () => {
    // ...
  });
});
