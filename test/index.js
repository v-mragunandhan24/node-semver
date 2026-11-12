'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const semver = require('../')
const { SEMVER_SPEC_VERSION } = require('../internal/constants')

test('SEMVER_SPEC_VERSION is a plain value property', () => {
  const desc = Object.getOwnPropertyDescriptor(semver, 'SEMVER_SPEC_VERSION')
  assert.strictEqual(desc.get, undefined)
  assert.strictEqual(desc.set, undefined)
  assert.strictEqual(desc.value, SEMVER_SPEC_VERSION)
  assert.strictEqual(desc.configurable, true)
  assert.strictEqual(desc.enumerable, true)
})
