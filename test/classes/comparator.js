'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const Comparator = require('../../classes/comparator')
const comparatorIntersection = require('../fixtures/comparator-intersection.js')

test('comparator testing', () => {
  const c = new Comparator('>=1.2.3')
  assert.ok(c.test('1.2.4'))
  const c2 = new Comparator(c)
  assert.ok(c2.test('1.2.4'))
  const c3 = new Comparator(c, true)
  assert.ok(c3.test('1.2.4'))
  // test an invalid version, should not throw
  const c4 = new Comparator(c)
  assert.ok(!c4.test('not a version string'))
})

test('tostrings', () => {
  assert.strictEqual(new Comparator('>= v1.2.3').toString(), '>=1.2.3')
})

describe('intersect comparators', () => {
  comparatorIntersection.forEach(([c0, c1, expect, includePrerelease]) =>
    test(`${c0} ${c1} ${expect}`, () => {
      const comp0 = new Comparator(c0)
      const comp1 = new Comparator(c1)

      assert.strictEqual(comp0.intersects(comp1, { includePrerelease }), expect,
        `${c0} intersects ${c1}`)

      assert.strictEqual(comp1.intersects(comp0, { includePrerelease }), expect,
        `${c1} intersects ${c0}`)
    }))
})

test('intersect demands another comparator', () => {
  const c = new Comparator('>=1.2.3')
  assert.throws(() => c.intersects(), new TypeError('a Comparator is required'))
})

test('ANY matches anything', () => {
  const c = new Comparator('')
  assert.ok(c.test('1.2.3'), 'ANY matches anything')
  const c1 = new Comparator('>=1.2.3')
  const ANY = Comparator.ANY
  assert.ok(c1.test(ANY), 'anything matches ANY')
})

test('invalid comparator parse throws', () => {
  assert.throws(() => new Comparator('foo bar baz'),
    new TypeError('Invalid comparator: foo bar baz'))
})

test('= is ignored', () => {
  assert.deepStrictEqual(new Comparator('=1.2.3'), new Comparator('1.2.3'))
})
