'use strict';

const assert = require('assert');

const path = require('path');
const Def = require('@saasfe/kos-core');

const def = new Def({
  'home': path.resolve('../.kos'),
  'silent': true,
  'disableCheckUpdate': true,
  'store': {
    'storeDir': path.resolve('../node_modules'),
    'flatten': true
  }
});

describe('sample', function() {

});