const { merge } = require("webpack-merge");
const common = require("./webpack.common.js");

module.exports = common.map((c) =>
  merge(c, {
    mode: "production",
  })
);
