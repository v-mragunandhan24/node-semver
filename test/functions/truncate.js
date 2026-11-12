'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const truncate = require('../../functions/truncate')
const parse = require('../../functions/parse')
const truncations = require('../fixtures/truncations.js')
const validVersions = require('../fixtures/valid-versions.js')

// Freezing SemVer object inputs to truncate ensures that the truncate function
// does not mutate them
const parseAndFreezeSemVerObject = (version) => {
  const parsed = parse(version)
  Object.freeze(parsed)
  return parsed
}

test('truncate fixture versions test', () => {
  truncations.forEach(([pre, truncation, expected]) => {
    const actual = truncate(pre, truncation)
    const cmd = `truncate(${pre}, ${truncation})`
    assert.strictEqual(actual, expected, `${cmd} === ${expected}`)

    const parsed = parseAndFreezeSemVerObject(pre)
    const semverTruncated = truncate(parsed, truncation)
    assert.strictEqual(semverTruncated, expected, `${cmd} works on Semver object inputs`)
  })
})

test('truncate pre* only removes build info', () => {
  ['prerelease', 'prepatch', 'preminor', 'premajor'].forEach(what => {
    validVersions.forEach((v) => {
      const versionToTruncate = v[0]
      const parsed = parseAndFreezeSemVerObject(versionToTruncate)
      const expected = parsed.version
      const actual = truncate(versionToTruncate, what)

      const cmd = `truncate(${versionToTruncate}, ${what})`
      assert.strictEqual(actual, expected, `${cmd} === ${expected}`)
      assert.deepStrictEqual(parse(actual).build, [], `${cmd} build info should be removed`)
    })
  })
})
