import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import replace from "@rollup/plugin-replace";
import url from "@rollup/plugin-url";
import postcss from "rollup-plugin-postcss";
import html from "@rollup/plugin-html";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";
import { sizeSnapshot } from "rollup-plugin-size-snapshot";
import { terser } from "rollup-plugin-terser";
import copy from "rollup-plugin-copy";

import pkg from "../package.json";
import template from "./template";

const { BUILD } = process.env;
const isDev = BUILD === "dev";
const isDemo = BUILD === "demo";
const isDist = BUILD === "dist";

const cjs = {
  file: isDist ? pkg.main : "demo/.dev/bundle.js",
  format: "cjs",
  sourcemap: isDev,
  exports: "named",
  plugins: !isDev && [terser()],
};

const esm = {
  file: pkg.module,
  format: "esm",
  exports: "named",
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
  !isDist && url(),
  !isDist && postcss({ extract: true, sourceMap: isDev, minimize: !isDev }),
  !isDist && html({ template }),
  !isDist &&
    copy({
      targets: [
        { src: "demo/static/site_assets", dest: "demo/.dev", rename: "assets" },
      ],
    }),
  isDev && serve("demo/.dev"),
  isDev && livereload(),
  !isDev && sizeSnapshot(),
  isDemo &&
    copy({
      targets: [{ src: "demo/.dev", dest: ".", rename: "public" }],
      hook: "writeBundle",
    }),
  isDist &&
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
  input: isDist ? "src" : "demo",
  output: isDist ? [cjs, esm] : [cjs],
  plugins,
  external: isDist ? Object.keys(pkg.peerDependencies) : [],
};
