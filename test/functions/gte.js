'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const gte = require('../../functions/gte')
const comparisons = require('../fixtures/comparisons.js')
const equality = require('../fixtures/equality.js')

describe('comparison tests', () => {
  comparisons.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(gte(v0, v1, loose), `gte('${v0}', '${v1}')`)
    assert.ok(!gte(v1, v0, loose), `!gte('${v1}', '${v0}')`)
    assert.ok(gte(v1, v1, loose), `gte('${v1}', '${v1}')`)
    assert.ok(gte(v0, v0, loose), `gte('${v0}', '${v0}')`)
  }))
})

describe('equality tests', () => {
  equality.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(gte(v0, v1, loose), `gte(${v0}, ${v1})`)
    assert.ok(gte(v1, v0, loose), `gte(${v1}, ${v0})`)
  }))
})
