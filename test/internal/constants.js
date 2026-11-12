'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const constants = require('../../internal/constants')

test('got appropriate data types exported', () => {
  assert.strictEqual(typeof constants.MAX_LENGTH, 'number')
  assert.strictEqual(typeof constants.MAX_SAFE_COMPONENT_LENGTH, 'number')
  assert.strictEqual(typeof constants.MAX_SAFE_INTEGER, 'number')
  assert.ok(Array.isArray(constants.WHITESPACE_CHARACTERS))
  assert.ok(Array.isArray(constants.RELEASE_TYPES))
  assert.strictEqual(typeof constants.SEMVER_SPEC_VERSION, 'string')
})

test('whitespace characters match JavaScript \\s', () => {
  const expected = []
  for (let code = 0; code <= 0xffff; code++) {
    const char = String.fromCharCode(code)
    if (/\s/.test(char)) {
      expected.push(char)
    }
  }
  assert.deepStrictEqual(constants.WHITESPACE_CHARACTERS, expected)
})
