'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const gt = require('../../functions/gt')
const comparisons = require('../fixtures/comparisons.js')
const equality = require('../fixtures/equality.js')

describe('comparison tests', () => {
  comparisons.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(gt(v0, v1, loose), `gt('${v0}', '${v1}')`)
    assert.ok(!gt(v1, v0, loose), `!gt('${v1}', '${v0}')`)
    assert.ok(!gt(v1, v1, loose), `!gt('${v1}', '${v1}')`)
    assert.ok(!gt(v0, v0, loose), `!gt('${v0}', '${v0}')`)
  }))
})

describe('equality tests', () => {
  equality.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(!gt(v0, v1, loose), `!gt(${v0}, ${v1})`)
    assert.ok(!gt(v1, v0, loose), `!gt(${v1}, ${v0})`)
  }))
})
