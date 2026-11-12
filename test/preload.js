'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const preload = require('../preload.js')
const index = require('../index.js')
test('preload and index match', () => {
  assert.strictEqual(preload, index)
})
