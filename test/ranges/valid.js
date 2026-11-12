'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const validRange = require('../../ranges/valid')
const rangeParse = require('../fixtures/range-parse.js')

test('valid range test', () => {
  // validRange(range) -> result
  // translate ranges into their canonical form
  rangeParse.forEach(([pre, wanted, options]) =>
    assert.strictEqual(validRange(pre, options), wanted,
      `validRange(${pre}) === ${wanted} ${JSON.stringify(options)}`))
})
