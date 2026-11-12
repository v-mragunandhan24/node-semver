'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const parse = require('../../functions/parse')
const SemVer = require('../../classes/semver')
const invalidVersions = require('../fixtures/invalid-versions')

test('returns null instead of throwing when presented with garbage', () => {
  invalidVersions.forEach(([v, msg, opts]) =>
    assert.strictEqual(parse(v, opts), null, msg))
})

test('throw errors if asked to', () => {
  assert.throws(() => {
    parse('bad', null, true)
  }, {
    name: 'TypeError',
    message: 'Invalid Version: bad',
  })
  assert.throws(() => {
    parse([], null, true)
  }, {
    name: 'TypeError',
    message: 'Invalid version. Must be a string. Got type "object".',
  })
})

test('parse a version into a SemVer object', () => {
  assert.deepStrictEqual(parse('1.2.3'), new SemVer('1.2.3'))
  const s = new SemVer('4.5.6')
  assert.strictEqual(parse(s), s, 'just return it if its a SemVer obj')
  const loose = new SemVer('4.2.0', { loose: true })
  assert.deepStrictEqual(parse('4.2.0', true), loose, 'looseness as a boolean')
  assert.deepStrictEqual(parse('4.2.0', { loose: true }), loose, 'looseness as an option')
})
