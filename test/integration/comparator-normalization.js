'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const {
  Range,
  validRange,
  satisfies,
  minVersion,
  minSatisfying,
  maxSatisfying,
} = require('../../')

const options = [
  {},
  { loose: true },
  { includePrerelease: true },
  { loose: true, includePrerelease: true },
]

const checkRange = ({ input, expected, minimum, versions, matching, opts, raw }) => {
  const range = new Range(input, opts)
  assert.strictEqual(range.range, expected, 'Range preserves the comparator set')
  assert.strictEqual(validRange(input, opts), expected, 'validRange preserves the comparator set')
  if (raw !== undefined) {
    assert.strictEqual(range.raw, raw, 'raw retains metadata and normalizes whitespace')
  }
  for (const version of versions) {
    assert.strictEqual(range.test(version), matching.indexOf(version) !== -1, `Range.test(${version})`)
    assert.strictEqual(satisfies(version, input, opts), matching.indexOf(version) !== -1,
      `satisfies(${version})`)
  }
  const min = minVersion(input, opts)
  assert.strictEqual(min && min.version, minimum, 'minVersion preserves the lower bound')
  assert.strictEqual(minSatisfying(versions, input, opts), matching[0] || null, 'minSatisfying')
  assert.strictEqual(maxSatisfying(versions, input, opts), matching[matching.length - 1] || null, 'maxSatisfying')
}

describe('equality after releases and prereleases', () => {
  const names = ['', 'dev', 'v', 'vv', '1.dev', 'dev.1', 'beta.1', 'preview']
  const metadata = ['', '+build', '+build.1']
  const whitespace = [' ', '  ', '\t', '\n', '\u00a0', '\ufeff']
  let checked = 0

  for (const name of names) {
    for (const build of metadata) {
      for (const ws of whitespace) {
        for (const opts of options) {
          const version = `1.2.3${name ? `-${name}` : ''}`
          const input = `${version}${build}${ws}=${ws}${version}`
          const other = name ? '1.2.3' : '1.2.3-dev'
          test(`${JSON.stringify(input)} ${JSON.stringify(opts)}`, () => {
            checkRange({
              input,
              expected: version,
              minimum: version,
              versions: ['1.2.2', version, other, '1.2.4'],
              matching: [version],
              opts,
              raw: `${version}${build} = ${version}`,
            })
          })
          checked++
        }
      }
    }
  }
  assert.strictEqual(checked, 576, 'checks every declared combination')
})

describe('release comparator sets retain bounds and membership', () => {
  const versions = [
    '0.0.0', '0.2.3', '0.2.4', '0.3.0', '1.0.0', '1.2.2',
    '1.2.3-dev', '1.2.3', '1.2.4', '1.3.0', '1.5.0', '2.0.0',
  ]
  const cases = [
    ['>=\t1.2.3 <\n2.0.0', '>=1.2.3 <2.0.0', '1.2.3',
      ['1.2.3', '1.2.4', '1.3.0', '1.5.0']],
    ['>= 1.2 < 2', '>=1.2.0 <2.0.0-0', '1.2.0',
      ['1.2.2', '1.2.3', '1.2.4', '1.3.0', '1.5.0']],
    ['~ 1.2 >= 1.2.3', '>=1.2.0 <1.3.0-0 >=1.2.3', '1.2.3', ['1.2.3', '1.2.4']],
    ['^ 0.2.3 < 0.3.0', '>=0.2.3 <0.3.0-0 <0.3.0', '0.2.3', ['0.2.3', '0.2.4']],
    ['<= 0.x', '<1.0.0-0', '0.0.0', ['0.0.0', '0.2.3', '0.2.4', '0.3.0']],
    ['> *', '<0.0.0-0', null, []],
    ['>= 2 < 1', '>=2.0.0 <1.0.0-0', null, []],
    ['>= 1.x <= 2.X', '>=1.0.0 <3.0.0-0', '1.0.0',
      ['1.0.0', '1.2.2', '1.2.3', '1.2.4', '1.3.0', '1.5.0', '2.0.0']],
    ['1.2.3+build - 2.0.0+build', '>=1.2.3 <=2.0.0', '1.2.3',
      ['1.2.3', '1.2.4', '1.3.0', '1.5.0', '2.0.0']],
  ]

  for (const [input, expected, minimum, matching] of cases) {
    test(JSON.stringify(input), () => {
      checkRange({ input, expected, minimum, versions, matching })
    })
  }
})

describe('malformed comparator boundaries stay invalid', () => {
  const inputs = [
    '1.2.3-dev= 1',
    '1.2.3-v= x',
    '1.2.3-1.dev= 2.0.0',
    '1.2.3-dev+build= 1',
    '1.2.3= 1',
    '1.2.3-beta.1= 1',
  ]
  const versions = ['0.0.0', '1.2.3-dev', '1.2.3', '1.5.0', '2.0.0']
  for (const input of inputs) {
    for (const opts of options) {
      test(`${JSON.stringify(input)} ${JSON.stringify(opts)}`, () => {
        assert.throws(() => new Range(input, opts), TypeError, 'Range rejects')
        assert.strictEqual(validRange(input, opts), null, 'validRange rejects')
        for (const version of versions) {
          assert.ok(!satisfies(version, input, opts), `satisfies(${version}) rejects`)
        }
        assert.throws(() => minVersion(input, opts), TypeError, 'minVersion rejects')
        assert.strictEqual(minSatisfying(versions, input, opts), null, 'minSatisfying rejects')
        assert.strictEqual(maxSatisfying(versions, input, opts), null, 'maxSatisfying rejects')
      })
    }
  }
})

describe('invalid loose alternatives cannot widen the range', () => {
  const versions = ['0.0.0', '1.2.3-dev', '1.2.3', '1.5.0', '2.0.0']
  const cases = [
    ['1.2.3-dev || 1.2.3-dev= x', '1.2.3-dev'],
    ['1.2.3-dev= 1 || 2.0.0', '2.0.0'],
    ['1.2.3 || 1.2.3= x', '1.2.3'],
  ]
  for (const includePrerelease of [false, true]) {
    for (const [input, expected] of cases) {
      const opts = { loose: true, includePrerelease }
      test(`${JSON.stringify(input)} ${JSON.stringify(opts)}`, () => {
        checkRange({
          input, expected, minimum: expected, versions, matching: [expected], opts,
        })
      })
    }
  }
})

test('invalid comparator errors preserve the normalized input', () => {
  const input = '\t1.2.3-dev=\n1 '
  assert.throws(() => new Range(input), TypeError('Invalid comparator: 1.2.3-dev=1'))
  assert.throws(() => new Range(input, { loose: true }),
    TypeError('Invalid SemVer Range: 1.2.3-dev= 1'))
})
