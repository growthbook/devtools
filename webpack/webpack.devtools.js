const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");
const srcDir = path.join(__dirname, "..", "src");

module.exports = {
  entry: {
    background: path.join(srcDir, "background/index.ts"),
    content_script: path.join(srcDir, "content_script/index.ts"),

    // popup
    popup: path.join(srcDir, "popup/index.tsx"),
    // bottom panel
    devtools_init: path.join(srcDir, "devtools/init.ts"),
    devtools_panel: path.join(srcDir, "devtools/index.tsx"),


    // embedded on page via content_script:
    devtools_embed_script: path.join(srcDir, "content_script/embed_script.ts"),
    visual_editor: path.join(srcDir, "visual_editor/index.tsx"),
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
        include: path.join(srcDir, "visual_editor", "shadowDom.css"),
        type: "asset/source",
        loader: "postcss-loader",
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
    alias: {
      "@": path.resolve(__dirname, "../src"), // Should match tsconfig.json
    },
    extensions: [".ts", ".tsx", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [{ from: ".", to: "../", context: "public" }],
      options: {},
    }),
  ],
};
