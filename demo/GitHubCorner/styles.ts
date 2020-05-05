import { css, keyframes } from "@emotion/core";

import mq from "../utils/mq";

const octocatWave = keyframes`
  0%,
  100% {
    transform: rotate(0);
  }
  20%,
  60% {
    transform: rotate(-25deg);
  }
  40%,
  80% {
    transform: rotate(10deg);
  }
`;

export const octo = css`
  position: absolute;
  top: 0;
  right: 0;
  border: 0;
  fill: #151513;
  color: #fff;
`;

export const octoArm = css`
  transform-origin: 130px 106px;
  animation: ${octocatWave} 560ms ease-in-out;
  ${mq.sm} {
    animation: none;
  }
`;

export const github = css`
  position: absolute;
  top: 0;
  right: 0;
  &:hover {
    .css-${octoArm.name} {
      animation: none;
      ${mq.sm} {
        animation: ${octocatWave} 560ms ease-in-out;
      }
    }
  }
`;
