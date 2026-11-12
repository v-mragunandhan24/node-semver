'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const compare = require('../../functions/compare.js')
const comparisons = require('../fixtures/comparisons.js')
const equality = require('../fixtures/equality.js')
const SemVer = require('../../classes/semver.js')

describe('comparison tests', () => {
  comparisons.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.strictEqual(compare(v0, v1, loose), 1, `compare('${v0}', '${v1}')`)
    assert.strictEqual(compare(v1, v0, loose), -1, `compare('${v1}', '${v0}')`)
    assert.strictEqual(compare(v0, v0, loose), 0, `compare('${v0}', '${v0}')`)
    assert.strictEqual(compare(v1, v1, loose), 0, `compare('${v1}', '${v1}')`)
  }))
})

describe('equality tests', () => {
  // [version1, version2]
  // version1 should be equivalent to version2
  equality.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.strictEqual(compare(v0, v1, loose), 0, `${v0} ${v1}`)
    assert.strictEqual(compare(v1, v0, loose), 0, `${v1} ${v0}`)
    assert.strictEqual(compare(v0, v0, loose), 0, `${v0} ${v0}`)
    assert.strictEqual(compare(v1, v1, loose), 0, `${v1} ${v1}`)

    // also test with an object. they are === because obj.version matches
    assert.strictEqual(compare(new SemVer(v0, { loose: loose }),
      new SemVer(v1, { loose: loose })), 0,
    `compare(${v0}, ${v1}) object`)
  }))
})
