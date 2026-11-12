'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const valid = require('../../functions/valid')
const SemVer = require('../../classes/semver')
const invalidVersions = require('../fixtures/invalid-versions')
const { MAX_SAFE_INTEGER } = require('../../internal/constants')

test('returns null instead of throwing when presented with garbage', () => {
  invalidVersions.forEach(([v, msg, opts]) =>
    assert.strictEqual(valid(v, opts), null, msg))
})

test('validate a version into a SemVer object', () => {
  assert.strictEqual(valid('1.2.3'), '1.2.3')
  const s = new SemVer('4.5.6')
  assert.strictEqual(valid(s), '4.5.6', 'return the version if a SemVer obj')
  assert.strictEqual(valid('4.2.0foo', true), '4.2.0-foo', 'looseness as a boolean')
  assert.strictEqual(valid('4.2.0foo', { loose: true }), '4.2.0-foo', 'looseness as an option')
})

test('long build id', () => {
  const longBuild = '-928490632884417731e7af463c92b034d6a78268fc993bcb88a57944'
  const shortVersion = '1.1.1'
  const longVersion = `${MAX_SAFE_INTEGER}.${MAX_SAFE_INTEGER}.${MAX_SAFE_INTEGER}`
  assert.strictEqual(valid(shortVersion + longBuild), shortVersion + longBuild)
  assert.strictEqual(valid(longVersion + longBuild), longVersion + longBuild)
})
