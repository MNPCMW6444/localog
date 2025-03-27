const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');

module.exports = {
  output: {
    path: join(__dirname, 'dist'),
  },
  devServer: {
    port: 4200,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },

  // 🔽 Add this block to suppress source-map warnings
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js\.map$/,
        use: ['source-map-loader'],
        exclude: /node_modules/, // ✅ ignores node_modules like urql
      },
    ],
  },

  plugins: [
    new NxAppWebpackPlugin({
      tsConfig: './tsconfig.app.json',
      compiler: 'babel',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      assets: ['./src/favicon.ico'],
      styles: [],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactWebpackPlugin({
      // svgr: false
    }),
  ],
  ignoreWarnings: [
    {
      module: /node_modules\/urql/,
      message: /Failed to parse source map/,
    },
  ],
};
