const { merge } = require("webpack-merge");
const devtoolsConfig = require("./webpack.devtools.js");
const visualEditorConfig = require("./webpack.visual-editor.js");

module.exports = [
  // devtools has 'mode' set to 'development' always
  devtoolsConfig,
  merge(visualEditorConfig, {
    mode: "production",
  }),
];
