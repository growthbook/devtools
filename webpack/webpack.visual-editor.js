const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    popup: path.join(srcDir, "popup", "index.tsx"),
    content_script: path.join(srcDir, "content_script/index.ts"),
    visual_editor: path.join(srcDir, "visual_editor", "index.tsx"),
    background: path.join(srcDir, "background.ts"),
  },
  output: {
    path: path.join(__dirname, "../dist/js"),
    filename: "[name].js",
    assetModuleFilename: "[name][ext]",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        // visual editor css loaded separately
        exclude: [path.join(srcDir, "visual_editor", "shadowDom.css")],
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
      {
        test: /\.svg$/,
        use: [
          {
            loader: "url-loader",
          },
        ],
      },
      {
        include: path.join(srcDir, "visual_editor", "shadowDom.css"),
        type: "asset/source",
        loader: "postcss-loader",
      },
      {
        test: /\.png$/i,
        type: "asset/resource",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
