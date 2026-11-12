'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const LRUCache = require('../../internal/lrucache')

test('basic cache operation', () => {
  const c = new LRUCache()
  const max = 1000

  for (let i = 0; i < max; i++) {
    assert.strictEqual(c.set(i, i), c)
  }
  for (let i = 0; i < max; i++) {
    assert.strictEqual(c.get(i), i)
  }
  c.set(1001, 1001)
  // lru item should be gone
  assert.strictEqual(c.get(0), undefined)
  c.set(42, undefined)
})
