/*! protractor-testability-plugin - v1.0.1
 *  Release on: 2016-01-23
 *  Copyright (c) 2016 Alfonso Presa
 *  Licensed MIT */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module unless amdModuleId is set
    define([], function () {
      return (factory());
    });
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    factory();
  }
}(this, function () {

/* global browser */
'use strict';

var fs = require('fs');

return {
    name: 'protractor-testability-plugin',
    onPageLoad: function () {
        var testability = fs.readFileSync(require.resolve('testability.js')).toString();
        browser.executeScript('if(!window.testability) {' + testability + '}');
        browser.executeScript(function () {
            if (!window.angular) {
                // TODO: This is very very very (very^n) dirty...
                // but the only way right now to make protractor work without setting ignoreSynchronization.
                window.angular = {
                    resumeBootstrap: function () { },
                    module: function () {
                        return {
                            config: function () { return this; }
                        };
                    },
                    getTestability: function () {
                        return {
                            whenStable: function (cb) { cb(); }
                        };
                    }
                };
            }
            window.addEventListener('onload', function () {
                if (window.$) {
                    window.$.ajaxStart(window.testability.oneMore);
                    window.$.ajaxStart(window.testability.oneLess);
                }
            });
        });
    },
    waitForPromise: function () {
        return browser.executeAsyncScript(
            'return testability.when.ready.apply(null,arguments)')
            .then(function (browserErr) {
                if (browserErr) {
                    throw 'Error while waiting to sync with the page: ' + JSON.stringify(browserErr);
                }
            });
    }

};


}));
