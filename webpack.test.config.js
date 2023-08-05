import { fileURLToPath } from "node:url";
import babelConfig from "./babel.config.js";

export default {
  entry: "./dist/main.js",
  output: {
    path: fileURLToPath(new URL("./test/dist", import.meta.url)),
    filename: "main.js",
    library: {
      type: "module",
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: {
          loader: "babel-loader",
          options: babelConfig,
        },
      },
    ],
  },
  experiments: {
    outputModule: true,
  },
};
