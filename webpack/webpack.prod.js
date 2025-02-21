const devtoolsConfig = require("./webpack.devtools.js");

module.exports = {
  ...devtoolsConfig,
  mode: "production",
};
