'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const parseOptions = require('../../internal/parse-options.js')

test('falsey values always empty options object', () => {
  assert.deepStrictEqual(parseOptions(null), {})
  assert.deepStrictEqual(parseOptions(false), {})
  assert.deepStrictEqual(parseOptions(undefined), {})
  assert.deepStrictEqual(parseOptions(), {})
  assert.deepStrictEqual(parseOptions(0), {})
  assert.deepStrictEqual(parseOptions(''), {})
})

test('truthy non-objects always loose mode, for backwards comp', () => {
  assert.deepStrictEqual(parseOptions('hello'), { loose: true })
  assert.deepStrictEqual(parseOptions(true), { loose: true })
  assert.deepStrictEqual(parseOptions(1), { loose: true })
})

test('any object passed is returned', () => {
  assert.deepStrictEqual(parseOptions(/asdf/), /asdf/)
  assert.deepStrictEqual(parseOptions(new Error('hello')), new Error('hello'))
  assert.deepStrictEqual(parseOptions({ loose: true, a: 1, rtl: false }),
    { loose: true, a: 1, rtl: false })
  assert.deepStrictEqual(parseOptions({ loose: 1, rtl: 2, includePrerelease: 10 }), {
    loose: 1,
    rtl: 2,
    includePrerelease: 10,
  })
  assert.deepStrictEqual(parseOptions({ loose: true }), { loose: true })
  assert.deepStrictEqual(parseOptions({ rtl: true }), { rtl: true })
  assert.deepStrictEqual(parseOptions({ includePrerelease: true }), { includePrerelease: true })
  assert.deepStrictEqual(parseOptions({ loose: true, rtl: true }), { loose: true, rtl: true })
  assert.deepStrictEqual(parseOptions({ loose: true, includePrerelease: true }), {
    loose: true,
    includePrerelease: true,
  })
  assert.deepStrictEqual(parseOptions({ rtl: true, includePrerelease: true }), {
    rtl: true,
    includePrerelease: true,
  })
})
