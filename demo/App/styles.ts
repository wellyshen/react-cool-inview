import { css } from "@emotion/react";

import mq from "../utils/mq";

const { sm, md, lg } = mq;

export const root = css`
  body {
    font-family: "Roboto", sans-serif;

    h1 {
      font-family: "Bungee Shade", cursive;
    }
  }
`;

export const container = css`
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin: 0 0 1rem;
  font-size: 8vw;
  ${md} {
    font-size: 4vw;
  }
`;

export const subtitle = css`
  margin: 0 0 5rem;
  font-size: 3vw;
  ${md} {
    font-size: 1.5vw;
  }
`;

export const log = css`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
`;

export const frame = css`
  padding: 0 10px;
  width: 90%;
  max-width: 350px;
  height: 300px;
  border: 5px dashed;
  overflow-y: scroll;
  -webkit-overflow-scrolling: touch;
`;
