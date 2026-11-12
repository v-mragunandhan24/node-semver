'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const Range = require('../../classes/range')
const SemVer = require('../../classes/semver')
const Comparator = require('../../classes/comparator')
const validRange = require('../../ranges/valid')
const minVersion = require('../../ranges/min-version')
const minSatisfying = require('../../ranges/min-satisfying')
const maxSatisfying = require('../../ranges/max-satisfying')
const satisfies = require('../../functions/satisfies')

const wsMedium = ' '.repeat(125)
const wsLarge = ' '.repeat(500000)
const zeroLarge = '0'.repeat(500000)
const versionPrefixLarge = 'v'.repeat(500000)

test('range with whitespace', () => {
  // a range with these extra characters would take a few minutes to process if
  // any redos susceptible regexes were used. there is a global tap timeout per
  // file set in the package.json that will error if this test takes too long.
  const r = `1.2.3 ${wsLarge} <1.3.0`
  assert.strictEqual(new Range(r).range, '1.2.3 <1.3.0')
  assert.strictEqual(validRange(r), '1.2.3 <1.3.0')
  assert.strictEqual(minVersion(r).version, '1.2.3')
  assert.strictEqual(minSatisfying(['1.2.3'], r), '1.2.3')
  assert.strictEqual(maxSatisfying(['1.2.3'], r), '1.2.3')
  assert.throws(() => new Range('> invalid'))
})

test('range with 0', () => {
  const r = `1.2.3 ${zeroLarge} <1.3.0`
  assert.throws(() => new Range(r).range)
  assert.strictEqual(validRange(r), null)
  assert.throws(() => minVersion(r).version)
  assert.strictEqual(minSatisfying(['1.2.3'], r), null)
  assert.strictEqual(maxSatisfying(['1.2.3'], r), null)
})

test('range with repeated version prefix', () => {
  assert.throws(() => new Range(versionPrefixLarge))
  assert.strictEqual(validRange(versionPrefixLarge), null)
  assert.strictEqual(satisfies('1.2.3', versionPrefixLarge), false)
  assert.throws(() => minVersion(versionPrefixLarge))
  assert.strictEqual(minSatisfying(['1.2.3'], versionPrefixLarge), null)
  assert.strictEqual(maxSatisfying(['1.2.3'], versionPrefixLarge), null)

  const r = `>= ${versionPrefixLarge}1`
  assert.strictEqual(new Range(r).range, '>=1.0.0')
  assert.strictEqual(validRange(r), '>=1.0.0')
  assert.strictEqual(satisfies('1.2.3', r), true)
  assert.strictEqual(minVersion(r).version, '1.0.0')
  assert.strictEqual(minSatisfying(['1.2.3'], r), '1.2.3')
  assert.strictEqual(maxSatisfying(['1.2.3'], r), '1.2.3')
})

test('semver version', () => {
  const v = `${wsMedium}1.2.3${wsMedium}`
  const tooLong = `${wsLarge}1.2.3${wsLarge}`
  assert.strictEqual(new SemVer(v).version, '1.2.3')
  assert.throws(() => new SemVer(tooLong))
})

test('comparator', () => {
  const comparator = `${wsLarge}<${wsLarge}1.2.3${wsLarge}`
  assert.strictEqual(new Comparator(comparator).value, '<1.2.3')
})
