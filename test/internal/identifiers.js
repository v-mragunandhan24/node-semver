'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { compareIdentifiers, rcompareIdentifiers } = require('../../internal/identifiers')

test('rcompareIdentifiers and compareIdentifiers', () => {
  const set = [
    ['1', '2'],
    ['alpha', 'beta'],
    ['0', 'beta'],
    [1, 2],
  ]
  set.forEach((ab) => {
    const a = ab[0]
    const b = ab[1]
    assert.strictEqual(compareIdentifiers(a, b), -1)
    assert.strictEqual(rcompareIdentifiers(a, b), 1)
  })
  assert.strictEqual(compareIdentifiers('0', '0'), 0)
  assert.strictEqual(rcompareIdentifiers('0', '0'), 0)
  assert.strictEqual(compareIdentifiers(1, 1), 0)
  assert.strictEqual(rcompareIdentifiers(1, 1), 0)
})
