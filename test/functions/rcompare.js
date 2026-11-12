'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const rcompare = require('../../functions/rcompare')

test('rcompare', () => {
  assert.strictEqual(rcompare('1.0.0', '1.0.1'), 1)
  assert.strictEqual(rcompare('1.0.0', '1.0.0'), 0)
  assert.strictEqual(rcompare('1.0.0+0', '1.0.0'), 0)
  assert.strictEqual(rcompare('1.0.1', '1.0.0'), -1)
})
