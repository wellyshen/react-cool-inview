import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

import pkg from "./package.json";

const isDev = process.env.BUILD !== "production";

const cjs = {
  file: pkg.main,
  format: "cjs",
  exports: "named",
  sourcemap: true,
  plugins: !isDev && [terser()],
};

const esm = {
  file: pkg.module,
  format: "esm",
  exports: "named",
  sourcemap: true,
};

const extensions = [".js", ".ts", ".tsx", ".json"];
const plugins = [
  resolve({ extensions }),
  commonjs(),
  babel({ exclude: "node_modules/**", extensions }),
  replace({
    "process.env.NODE_ENV": JSON.stringify(
      isDev ? "development" : "production"
    ),
  }),
  !isDev && sizeSnapshot(),
  copy({
    targets: [
      {
        src: "src/react-cool-inview.d.ts",
        dest: pkg.types.split("/")[0],
        rename: "index.d.ts",
      },
    ],
  }),
].filter(Boolean);

export default {
  input: "src",
  output: isDev ? [esm] : [cjs, esm],
  plugins,
  external: Object.keys(pkg.peerDependencies),
};
