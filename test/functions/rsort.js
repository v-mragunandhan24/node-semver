'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const rsort = require('../../functions/rsort')

test('sorting', () => {
  const list = [
    '1.2.3+1',
    '1.2.3+0',
    '1.2.3',
    '5.9.6',
    '0.1.2',
  ]
  const rsorted = [
    '5.9.6',
    '1.2.3+1',
    '1.2.3+0',
    '1.2.3',
    '0.1.2',
  ]
  assert.deepStrictEqual(rsort(list), rsorted)
})
