import { css } from '@emotion/core';

import mq from '../utils/mq';

const { sm, md, lg } = mq;

export const root = css`
  body {
    font-family: 'Open Sans', sans-serif;
  }
`;

export const container = css`
  padding: 5rem 5%;
  text-align: center;
  ${sm} {
    padding-left: 10%;
    padding-right: 10%;
  }
  ${md} {
    padding-left: 12.5%;
    padding-right: 12.5%;
  }
  ${lg} {
    padding-left: 15%;
    padding-right: 15%;
  }
`;

export const title = css`
  margin: 0 0 0.75rem;
`;

export const subtitle = css`
  margin: 0 0 2.5rem;
`;

export const log = css`
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  color: grey;
  ${md} {
    font-size: 1.5rem;
  }
`;

export const frame = css`
  margin: 0 auto;
  padding: 0 10px;
  width: 90%;
  max-width: 350px;
  height: 300px;
  border: 1px solid #777;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;
