'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const satisfies = require('../../functions/satisfies')
const rangeInclude = require('../fixtures/range-include.js')
const rangeExclude = require('../fixtures/range-exclude.js')
test('range tests', () => {
  rangeInclude.forEach(([range, ver, options]) =>
    assert.ok(satisfies(ver, range, options), `${range} satisfied by ${ver}`))
})

test('negative range tests', () => {
  rangeExclude.forEach(([range, ver, options]) =>
    assert.ok(!satisfies(ver, range, options), `${range} not satisfied by ${ver}`))
})

test('invalid ranges never satisfied (but do not throw)', () => {
  const cases = [
    ['blerg', '1.2.3'],
    ['git+https://user:password0123@github.com/foo', '123.0.0', true],
    ['^1.2.3', '2.0.0-pre'],
    ['0.x', undefined],
    ['*', undefined],
  ]
  cases.forEach(([range, ver]) =>
    assert.ok(!satisfies(ver, range), `${range} not satisfied because invalid`))
})
