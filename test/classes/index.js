'use strict'

const { test } = require('node:test')
const assert = require('node:assert')

test('export all classes at semver/classes', () => {
  assert.deepStrictEqual(require('../../classes'), {
    SemVer: require('../../classes/semver'),
    Range: require('../../classes/range'),
    Comparator: require('../../classes/comparator'),
  })
})
