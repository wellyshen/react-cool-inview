import { css } from '@emotion/core';

const width = '3rem';
const height = '2.25rem';

export const slider = css`
  display: inline-block;
  width: ${width};
  height: ${height};
  overflow-y: hidden;
`;

export const wrapper = css`
  transition: transform 0.15s ease-in-out;
`;

export const font = css`
  display: flex;
  justify-content: center;
  align-items: center;
  width: ${width};
  height: ${height};
  font-size: 1.75rem;
`;
