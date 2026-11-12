'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')
const { resolve, join, relative, extname, dirname, basename } = require('path')
const { statSync, readdirSync } = require('fs')
const map = require('../map.js')
const pkg = require('../package.json')

const ROOT = resolve(__dirname, '..')
const TEST = join(ROOT, 'test')
const IGNORE_DIRS = ['fixtures', 'integration']

const getFile = (f) => {
  try {
    if (statSync(f).isFile()) {
      return extname(f) === '.js' ? [f] : []
    }
  } catch {
    return []
  }
}

const walk = (item, res = []) => getFile(item) || readdirSync(item)
  .map(f => join(item, f))
  .reduce((acc, f) => acc.concat(statSync(f).isDirectory() ? walk(f, res) : getFile(f)), [])
  .filter(Boolean)

const walkAll = (items, relativeTo) => items
  .reduce((acc, f) => acc.concat(walk(join(ROOT, f))), [])
  .map((f) => relative(relativeTo, f))
  .sort()

describe('tests match system', () => {
  const sut = walkAll(['map.js', ...pkg.files], ROOT)
  const tests = walkAll([basename(TEST)], TEST)
    .filter(f => !IGNORE_DIRS.includes(dirname(f)))

  test('test files should match system files', () => {
    assert.deepStrictEqual(sut, tests)
  })

  for (const f of tests) {
    test(f, () => {
      assert.ok(sut.includes(map(f)), 'test covers a file')
    })
  }
})
