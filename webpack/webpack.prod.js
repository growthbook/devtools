const { merge } = require("webpack-merge");
const devtoolsConfig = require("./webpack.devtools.js");
const visualEditorConfig = require("./webpack.visual-editor.js");

module.exports = [devtoolsConfig, visualEditorConfig].map((c) =>
  merge(c, {
    mode: "production",
  })
);
