'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const Range = require('../../classes/range')
const Comparator = require('../../classes/comparator')
const rangeIntersection = require('../fixtures/range-intersection.js')

const rangeInclude = require('../fixtures/range-include.js')
const rangeExclude = require('../fixtures/range-exclude.js')
const rangeParse = require('../fixtures/range-parse.js')

test('range tests', () => {
  rangeInclude.forEach(([range, ver, options]) => {
    const r = new Range(range, options)
    assert.ok(r.test(ver), `${range} satisfied by ${ver}`)
  })
})

test('range parsing', () => {
  rangeParse.forEach(([range, expect, options]) => {
    const description = `${range} ${JSON.stringify(options)}`
    if (expect === null) {
      assert.throws(() => new Range(range, options), TypeError, `invalid range: ${description}`)
    } else {
      const parsed = new Range(range, options)
      assert.strictEqual(parsed.range || '*', expect, `${description} => ${expect}`)
      assert.strictEqual(parsed.range,
        new Range(expect, { includePrerelease: parsed.includePrerelease }).range,
        `parsing both yields same result: ${description}`)
    }
  })
})

test('range parsing covers every option combination', () => {
  const inputsByOptions = new Map()
  for (const [range, , options] of rangeParse) {
    const loose = !!(options && options.loose)
    const includePrerelease = !!(options && options.includePrerelease)
    const key = `${loose}:${includePrerelease}`
    if (!inputsByOptions.has(key)) {
      inputsByOptions.set(key, [])
    }
    inputsByOptions.get(key).push(range)
  }

  const combinations = ['false:false', 'true:false', 'false:true', 'true:true']
  assert.deepStrictEqual([...inputsByOptions.keys()], combinations, 'all four modes are present')
  const defaultInputs = inputsByOptions.get('false:false')
  assert.strictEqual(defaultInputs.length, 348, 'retains every source fixture row')
  assert.strictEqual(new Set(defaultInputs).size, 335, 'retains every distinct source input')
  for (const key of combinations.slice(1)) {
    assert.deepStrictEqual(inputsByOptions.get(key), defaultInputs, `${key} covers the same inputs`)
  }
})

test('legacy range parsing options', () => {
  const cases = [
    ['>01.02.03', '>1.2.3', true],
    ['>01.02.03', null, false],
    ['>= 1.2.3', '>=1.2.3', null],
    ['1.2.3', '1.2.3', {}],
    ['1.2.3', '1.2.3', { loose: false }],
  ]
  for (const [range, expect, options] of cases) {
    if (expect === null) {
      assert.throws(() => new Range(range, options), TypeError, 'strict boolean rejects leading zeros')
    } else {
      assert.strictEqual(new Range(range, options).range, expect, JSON.stringify(options))
    }
  }
})

test('throw for empty comparator set, even in loose mode', () => {
  assert.throws(() => new Range('sadf||asdf', { loose: true }),
    TypeError('Invalid SemVer Range: sadf||asdf'))
})

test('convert comparator to range', () => {
  const c = new Comparator('>=1.2.3')
  const r = new Range(c)
  assert.strictEqual(r.raw, c.value, 'created range from comparator')
})

test('range as argument to range ctor', () => {
  const loose = new Range('1.2.3', { loose: true })
  assert.strictEqual(new Range(loose, { loose: true }), loose, 'loose option')
  assert.strictEqual(new Range(loose, true), loose, 'loose boolean')
  assert.notStrictEqual(new Range(loose), loose, 'created new range if not matched')

  const incPre = new Range('1.2.3', { includePrerelease: true })
  assert.strictEqual(new Range(incPre, { includePrerelease: true }), incPre,
    'include prerelease, option match returns argument')
  assert.notStrictEqual(new Range(incPre), incPre,
    'include prerelease, option mismatch does not return argument')
})

test('negative range tests', () => {
  rangeExclude.forEach(([range, ver, options]) => {
    const r = new Range(range, options)
    assert.ok(!r.test(ver), `${range} not satisfied by ${ver}`)
  })
})

test('strict vs loose ranges', () => {
  [
    ['>=01.02.03', '>=1.2.3'],
    ['~1.02.03beta', '>=1.2.3-beta <1.3.0-0'],
  ].forEach(([loose, comps]) => {
    assert.throws(() => new Range(loose))
    assert.strictEqual(new Range(loose, true).range, comps)
  })
})

test('tostrings', () => {
  assert.strictEqual(new Range('>= v1.2.3').toString(), '>=1.2.3')
})

test('formatted value is calculated lazily and cached', () => {
  const r = new Range('>= v1.2.3')
  assert.strictEqual(r.formatted, undefined)
  assert.strictEqual(r.format(), '>=1.2.3')
  assert.strictEqual(r.formatted, '>=1.2.3')
  assert.strictEqual(r.format(), '>=1.2.3')
})

describe('ranges intersect', () => {
  rangeIntersection.forEach(([r0, r1, expect]) => {
    test(`${r0} <~> ${r1}`, () => {
      const range0 = new Range(r0)
      const range1 = new Range(r1)

      assert.strictEqual(range0.intersects(range1), expect,
        `${r0} <~> ${r1} objects`)
      assert.strictEqual(range1.intersects(range0), expect,
        `${r1} <~> ${r0} objects`)
    })
  })
})

test('missing range parameter in range intersect', () => {
  assert.throws(() => {
    new Range('1.0.0').intersects()
  }, new TypeError('a Range is required'),
  'throws type error')
})

test('cache', () => {
  const cached = Symbol('cached')
  const r1 = new Range('1.0.0')
  r1.set[0][cached] = true
  const r2 = new Range('1.0.0')
  assert.strictEqual(r1.set[0][cached], true)
  assert.strictEqual(r2.set[0][cached], true) // Will be true, showing it's cached.
})
