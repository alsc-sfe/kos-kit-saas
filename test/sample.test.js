'use strict';

const assert = require('assert');

const path = require('path');
const Def = require('@ali/def-core');

const def = new Def({
  'home': path.resolve('../.def'),
  'silent': true,
  'disableCheckUpdate': true,
  'store': {
    'storeDir': path.resolve('../node_modules'),
    'flatten': true
  }
});

describe('sample', function() {

});