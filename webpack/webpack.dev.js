const { merge } = require("webpack-merge");
const devtoolsConfig = require("./webpack.devtools.js");

module.exports = [devtoolsConfig].map((c) =>
  merge(c, {
    devtool: "inline-source-map",
    mode: "development",
  })
);
