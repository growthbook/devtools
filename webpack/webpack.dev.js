const devtoolsConfig = require("./webpack.devtools.js");

module.exports = {
  ...devtoolsConfig,
  devtool: "inline-source-map",
  mode: "development",
};
