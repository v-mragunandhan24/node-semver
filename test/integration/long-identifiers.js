'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const {
  Range,
  SemVer,
  valid,
  validRange,
  satisfies,
  minVersion,
  minSatisfying,
  maxSatisfying,
} = require('../../')
const {
  MAX_LENGTH,
  MAX_SAFE_COMPONENT_LENGTH,
  MAX_SAFE_BUILD_LENGTH,
  MAX_SAFE_INTEGER,
} = require('../../internal/constants')

const longId = '928490632884417731e7af463c92b034d6a78268fc993bcb88a57944'
const options = [
  {},
  { loose: true },
  { includePrerelease: true },
  { loose: true, includePrerelease: true },
]

const checkRange = (input, expected, version, opts) => {
  const range = new Range(input, opts)
  const versions = ['0.0.0-0', version, '1.2.4']
  assert.strictEqual(range.range, expected, 'Range preserves the identifier')
  assert.strictEqual(validRange(input, opts), expected, 'validRange preserves the identifier')
  assert.ok(range.test(version), 'Range.test accepts the matching version')
  assert.ok(satisfies(version, input, opts), 'satisfies accepts the matching version')
  assert.ok(!satisfies('0.0.0-0', input, opts), 'excludes a different prerelease')
  assert.ok(!satisfies('1.2.4', input, opts), 'excludes a different release')
  assert.strictEqual(minVersion(input, opts).version, version, 'minVersion preserves the identifier')
  assert.strictEqual(minSatisfying(versions, input, opts), version, 'minSatisfying selects the version')
  assert.strictEqual(maxSatisfying(versions, input, opts), version, 'maxSatisfying selects the version')
}

test('long numeric-prefix prereleases from #580 and #583', () => {
  const versions = [
    `0.0.0-${longId}`,
    `1.1.1-${longId}`,
    `${MAX_SAFE_INTEGER}.${MAX_SAFE_INTEGER}.${MAX_SAFE_INTEGER}-${longId}`,
  ]
  for (const length of [
    MAX_SAFE_COMPONENT_LENGTH - 1,
    MAX_SAFE_COMPONENT_LENGTH,
    MAX_SAFE_COMPONENT_LENGTH + 1,
    18,
    MAX_LENGTH - '1.2.3-a'.length,
  ]) {
    versions.push(`1.2.3-${'9'.repeat(length)}a`)
  }

  for (const opts of options) {
    for (const version of versions) {
      assert.strictEqual(valid(version, opts), version, 'valid accepts the long prerelease')
      assert.strictEqual(new SemVer(version, opts).version, version, 'SemVer preserves the prerelease')
      checkRange(`= \t ${version}`, version, version, opts)
      checkRange(`>= \t ${version} <= \n ${version}`,
        `>=${version} <=${version}`, version, opts)
      checkRange(`${version} - ${version}`, `>=${version} <=${version}`, version, opts)
    }
  }
})

test('build metadata respects version and range length limits', () => {
  const version = '1.2.3'
  const identifiers = [
    [longId, true],
    ['9'.repeat(MAX_SAFE_COMPONENT_LENGTH + 1), true],
    ['9'.repeat(MAX_SAFE_BUILD_LENGTH), true],
    ['9'.repeat(MAX_SAFE_BUILD_LENGTH + 1), true],
  ]

  for (const opts of options) {
    for (const [identifier, rangeValid] of identifiers) {
      const input = `${version}+${identifier}`
      if (input.length <= MAX_LENGTH) {
        assert.strictEqual(valid(input, opts), version, 'valid accepts metadata within the version limit')
        assert.deepStrictEqual(new SemVer(input, opts).build, [identifier], 'SemVer preserves metadata')
      } else {
        assert.strictEqual(valid(input, opts), null, 'valid retains the version length limit')
        assert.throws(() => new SemVer(input, opts), TypeError, 'SemVer retains the version length limit')
      }

      if (rangeValid) {
        checkRange(`= ${input}`, version, version, opts)
        checkRange(`>= ${input} <= ${input}`, `>=${version} <=${version}`, version, opts)
      } else {
        for (const range of [`= ${input}`, `>= ${input} <= ${input}`]) {
          assert.throws(() => new Range(range, opts), TypeError, 'Range retains the version length limit')
          assert.strictEqual(validRange(range, opts), null, 'validRange retains the version length limit')
          assert.ok(!satisfies(version, range, opts), 'satisfies rejects the overlong version')
          assert.throws(() => minVersion(range, opts), TypeError, 'minVersion rejects the overlong version')
          assert.strictEqual(minSatisfying([version], range, opts), null, 'minSatisfying rejects')
          assert.strictEqual(maxSatisfying([version], range, opts), null, 'maxSatisfying rejects')
        }
      }
    }
  }
})

test('invalid version limits remain enforced', () => {
  const versions = [
    `1.2.3-${'9'.repeat(MAX_LENGTH - '1.2.3-'.length)}a`,
    `${MAX_SAFE_INTEGER + 1}.1.1`,
    `1.${MAX_SAFE_INTEGER + 1}.1`,
    `1.1.${MAX_SAFE_INTEGER + 1}`,
  ]

  for (const opts of options) {
    for (const version of versions) {
      const input = `= ${version}`
      assert.strictEqual(valid(version, opts), null, 'valid rejects the invalid version')
      assert.throws(() => new SemVer(version, opts), TypeError, 'SemVer rejects the invalid version')
      assert.throws(() => new Range(input, opts), TypeError, 'Range rejects the invalid version')
      assert.strictEqual(validRange(input, opts), null, 'validRange rejects the invalid version')
      assert.ok(!satisfies('1.2.3', input, opts), 'satisfies rejects the invalid range')
      assert.throws(() => minVersion(input, opts), TypeError, 'minVersion rejects the invalid range')
      assert.strictEqual(minSatisfying(['1.2.3'], input, opts), null, 'minSatisfying rejects the invalid range')
      assert.strictEqual(maxSatisfying(['1.2.3'], input, opts), null, 'maxSatisfying rejects the invalid range')
    }
  }
})
