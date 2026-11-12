'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const cmp = require('../../functions/cmp')
const comparisons = require('../fixtures/comparisons.js')
const equality = require('../fixtures/equality.js')
const SemVer = require('../../classes/semver')

test('invalid cmp usage', () => {
  assert.throws(() => {
    cmp('1.2.3', 'a frog', '4.5.6')
  }, new TypeError('Invalid operator: a frog'))
})

describe('comparison tests', () => {
  comparisons.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(cmp(v0, '>', v1, loose), `cmp('${v0}' > '${v1}')`)
    assert.ok(cmp(v1, '<', v0, loose), `cmp('${v1}' < '${v0}')`)
    assert.ok(!cmp(v1, '>', v0, loose), `!cmp('${v1}' > '${v0}')`)
    assert.ok(!cmp(v0, '<', v1, loose), `!cmp('${v0}' < '${v1}')`)
    assert.ok(cmp(v1, '==', v1, loose), `cmp('${v1}' == '${v1}')`)
    assert.ok(cmp(v0, '>=', v1, loose), `cmp('${v0}' >= '${v1}')`)
    assert.ok(cmp(v1, '<=', v0, loose), `cmp('${v1}' <= '${v0}')`)
    assert.ok(cmp(v0, '!=', v1, loose), `cmp('${v0}' != '${v1}')`)
  }))
})

describe('equality tests', () => {
  equality.forEach(([v0, v1, loose]) => test(`${v0} ${v1} ${loose}`, () => {
    assert.ok(cmp(v0, '', v1, loose), `cmp(${v0} "" ${v1})`)
    assert.ok(cmp(v0, '=', v1, loose), `cmp(${v0}=${v1})`)
    assert.ok(cmp(v0, '==', v1, loose), `cmp(${v0}==${v1})`)
    assert.ok(!cmp(v0, '!=', v1, loose), `!cmp(${v0}!=${v1})`)
    assert.ok(!cmp(v0, '===', v1, loose), `!cmp(${v0}===${v1})`)

    // also test with an object. they are === because obj.version matches
    assert.ok(cmp(new SemVer(v0, { loose: loose }), '===',
      new SemVer(v1, { loose: loose })),
    `!cmp(${v0}===${v1}) object`)

    assert.ok(cmp(v0, '!==', v1, loose), `cmp(${v0}!==${v1})`)

    assert.ok(!cmp(new SemVer(v0, loose), '!==', new SemVer(v1, loose)),
      `cmp(${v0}!==${v1}) object`)
  }))
})
