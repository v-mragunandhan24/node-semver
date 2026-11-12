'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const compareBuild = require('../../functions/compare-build')

test('compareBuild', () => {
  const noBuild = '1.0.0'
  const build0 = '1.0.0+0'
  const build1 = '1.0.0+1'
  const build10 = '1.0.0+1.0'
  assert.strictEqual(compareBuild(noBuild, build0), -1)
  assert.strictEqual(compareBuild(build0, build0), 0)
  assert.strictEqual(compareBuild(build0, noBuild), 1)

  assert.strictEqual(compareBuild(build0, '1.0.0+0.0'), -1)
  assert.strictEqual(compareBuild(build0, build1), -1)
  assert.strictEqual(compareBuild(build1, build0), 1)
  assert.strictEqual(compareBuild(build10, build1), 1)
})
