/* eslint-env node */

const path = require("path");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const root = __dirname;

module.exports = function(env, argv) {
  const isDev = argv.mode === "development";

  return {
    context: path.join(root, "src"),
    entry: [
      "./index.ts"
    ],
    output: {
      filename: "[name].js",
      path: path.resolve(root, "dist"),
      library: "NavMesh",
      libraryTarget: "umd",
      libraryExport: "default",
      globalObject: '(typeof self !== "undefined" ? self : this)'
    },
    resolve: {
      extensions: ['.js', '.ts']
    },
    optimization: {
      minimizer: [new UglifyJsPlugin({ include: /\.min\.js$/, sourceMap: true })]
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: { loader: "babel-loader", options: { root: "../../" } }
        },
        {
          test: /\.ts$/,
          exclude: /node_modules/,
          use: {
            loader: 'ts-loader'
          }
        }
      ]
    },
    devtool: isDev ? "eval-source-map" : "source-map"
  };
};
