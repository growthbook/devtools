const webpack = require("webpack");
const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const { DefinePlugin } = require("webpack");
const srcDir = path.join(__dirname, "..", "src");

module.exports = [
  {
    entry: {
      devtools_init: path.join(srcDir, "devtools", "init.ts"),
      devtools_embed_script: path.join(srcDir, "devtools", "embed_script.ts"),
      devtools_panel: path.join(srcDir, "devtools", "ui", "index.tsx"),
    },
    output: {
      path: path.join(__dirname, "../dist/js"),
      filename: "[name].js",
      assetModuleFilename: "[name][ext]",
    },
    optimization: {
      splitChunks: {
        name: "vendor",
        chunks(chunk) {
          return chunk.name !== "background" && chunk.name !== "visual_editor";
        },
      },
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
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
      new DefinePlugin({
        "process.env.NODE_ENV": JSON.stringify("development"),
      }),
    ],
  },
  {
    entry: {
      options: path.join(srcDir, "options", "index.tsx"),
      content_script: path.join(srcDir, "content_script.ts"),
      devtools_init: path.join(srcDir, "devtools", "init.ts"),
      devtools_embed_script: path.join(srcDir, "devtools", "embed_script.ts"),
      devtools_panel: path.join(srcDir, "devtools", "ui", "index.tsx"),
      visual_editor: path.join(srcDir, "visual_editor", "index.tsx"),
    },
    output: {
      path: path.join(__dirname, "../dist/js"),
      filename: "[name].js",
      assetModuleFilename: "[name][ext]",
    },
    optimization: {
      splitChunks: {
        name: "vendor",
        chunks(chunk) {
          return chunk.name !== "background" && chunk.name !== "visual_editor";
        },
      },
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
          exclude: [path.join(srcDir, "visual_editor", "index.css")],
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
          include: path.join(srcDir, "visual_editor", "index.css"),
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
  },
];
