const { NormalModule } = require("webpack");

const esbuildAdapter = (plugins) => {
  return {
    /**
     *
     * @param {import('webpack').Compiler} compiler
     */
    apply(compiler) {
      compiler.hooks.compilation.tap("compilation", (compilation) => {
        const hooks = NormalModule.getCompilationHooks(compilation);
        hooks.readResource
          .for(undefined)
          .tapPromise("onLoad", async (loaderContext) => {
            for (const plugin of plugins) {
              if (plugin.onLoadFilter.test(loaderContext.resourcePath)) {
                const result = plugin.onLoadHook(loaderContext);
                console.log(result);
                return result.contents;
              }
            }
          });
      });
    },
  };
};
/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: "none",
  entry: {
    main: "./src/index.js",
  },
  target: ["node"],
  plugins: [
    esbuildAdapter([
      {
        onLoadFilter: /\.txt/,
        onLoadHook(id) {
          console.log("id:", id);
          return {
            contents: "module.exports = 42",
          };
        },
      },
    ]),
  ],
};
