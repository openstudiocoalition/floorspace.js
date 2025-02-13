// This is a karma config file. For more details see
//   http://karma-runner.github.io/0.13/config/configuration-file.html
// we are also using it with karma-webpack
//   https://github.com/webpack/karma-webpack

process.env.CHROME_BIN = require('puppeteer').executablePath();

const { merge } = require('webpack-merge');
const baseConfig = require('../../build/webpack.base.conf');

const webpackConfig = merge(baseConfig, {
  devtool: 'cheap-module-source-map',
});

// no need for app entry during tests
delete webpackConfig.entry;

module.exports = function (config) {
  config.set({
    // to run in additional browsers:
    // 1. install corresponding karma launcher
    //    http://karma-runner.github.io/0.13/config/browsers.html
    // 2. add it to the `browsers` array below.
    browsers: ['ChromeHeadless'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec', 'html', 'coverage'],
    files: ['./index.js'],
    preprocessors: {
      './index.js': ['webpack', 'sourcemap', 'coverage'],
    },
    webpack: webpackConfig,
    webpackMiddleware: {
      noInfo: true,
      stats: {
        chunks: false,
      },
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        // reporters not supporting the `file` property
        { type: 'html', subdir: 'report-html' },
        { type: 'lcov', subdir: 'report-lcov' },
      ],
    },
  });
};
