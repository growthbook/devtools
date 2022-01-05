module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      webpackConfig.plugins.forEach(plugin => {
        // Compile app in dev mode (so we can get GrowthBook debug messages)
        if(plugin.definitions && plugin.definitions['process.env']) {
          plugin.definitions['process.env']['NODE_ENV'] = JSON.stringify("dev");
        }
      })
      return {
        ...webpackConfig,
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          content: "./src/chromeServices/content.ts",
          page: "./src/chromeServices/page.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
      };
    },
  },
};
