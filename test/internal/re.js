'use strict'

const { test } = require('node:test')
const assert = require('node:assert')
const { src, re, safeRe, safeSrc, t: tokens, comparatorTrimReplace } = require('../../internal/re')
const semver = require('../../')

test('Semver itself has a list of src, re, and tokens', () => {
  assert.ok(Array.isArray(semver.re), 're is an array')
  assert.ok(Array.isArray(semver.src), 'src is an array')
  assert.strictEqual(typeof semver.tokens, 'object', 'tokens is an object')
  re.forEach(r => assert.ok(r instanceof RegExp, 'regexps are regexps'))
  safeRe.forEach(r => assert.ok(r instanceof RegExp, 'safe regexps are regexps'))
  src.forEach(s => assert.strictEqual(typeof s, 'string', 'src are strings'))
  safeSrc.forEach(s => assert.strictEqual(typeof s, 'string', 'safe srcare strings'))
  assert.ok(Object.keys(semver.tokens).length, 'there are tokens')
  for (const i in semver.tokens) {
    assert.strictEqual(typeof semver.tokens[i], 'number', 'tokens are numbers')
  }

  // tap's notMatch with a string pattern is a substring check
  safeRe.forEach(r => {
    assert.ok(!r.source.includes('\\s+'), 'safe regex do not contain greedy whitespace')
    assert.ok(!r.source.includes('\\s*'), 'safe regex do not contain greedy whitespace')
  })
})

test('comparator trim regexes stay exported but are not used by range parsing', () => {
  const token = tokens.COMPARATORTRIM
  assert.strictEqual(semver.tokens.COMPARATORTRIM, token, 'retains the public token')
  assert.strictEqual(semver.re[token], re[token], 'retains the public regex')
  assert.strictEqual(semver.src[token], src[token], 'retains the public source')
  assert.strictEqual(comparatorTrimReplace, '$1$2$3', 'retains the replacement export')
  const regexes = [re[token], safeRe[token]]
  for (const regex of regexes) {
    assert.strictEqual('> 1.2.3'.replace(regex, comparatorTrimReplace), '>1.2.3', 'export remains usable')
    regex.exec = () => {
      throw new Error('Range parsing must not execute COMPARATORTRIM')
    }
  }
  try {
    for (const loose of [false, true]) {
      for (const includePrerelease of [false, true]) {
        const options = { loose, includePrerelease }
        assert.strictEqual(new semver.Range('>= 1.2.3 < 2.0.0', options).range,
          '>=1.2.3 <2.0.0', 'parses without either regex')
        assert.ok(semver.satisfies('1.5.0', '>= 1.2.3 < 2.0.0', options))
      }
    }
  } finally {
    for (const regex of regexes) {
      delete regex.exec
    }
  }
})
