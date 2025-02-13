// Polyfill fn.bind() for PhantomJS
/* eslint-disable no-extend-native */
Function.prototype.bind = require('function-bind');
// Polyfill ES6
require('babel-polyfill');

// require all test files (files that ends with .spec.js)
const testsContext = require.context('./specs', true, /\.spec$/);
testsContext.keys().forEach(testsContext);

// require all src files except main.js for coverage.
// you can also change this to match only the subset of files that
// you want coverage for.
const srcContext = require.context('src', true, /^\.\/(?!main(\.js)?$)/);
srcContext.keys().forEach(srcContext);

const chai = require('chai');

const should = chai.should(),
  expect = chai.expect;

global.chai = chai;
global.should = should;
global.expect = expect;
