'use strict'

const { describe, test } = require('node:test')
const assert = require('node:assert')

const thisVersion = require('../../package.json').version
const cleanSnapshot = str => str.split(thisVersion).join('@@VERSION@@')

const spawn = require('child_process').spawn
const bin = require.resolve('../../bin/semver')
const run = args => new Promise((resolve, reject) => {
  const c = spawn(process.execPath, [bin].concat(args))
  c.on('error', reject)
  const out = []
  const err = []
  c.stdout.setEncoding('utf-8')
  c.stdout.on('data', chunk => out.push(chunk))
  c.stderr.setEncoding('utf-8')
  c.stderr.on('data', chunk => err.push(chunk))
  c.on('close', (code, signal) => {
    resolve({
      out: out.join(''),
      err: err.join(''),
      code: code,
      signal: signal,
    })
  })
})

const snapshotTests = (cases, name = args => args.join(' ')) => {
  for (const args of cases) {
    test(name(args), async t => {
      // snapshots are unavailable on Node 20 and need a flag before 22.13
      if (typeof t.assert?.snapshot !== 'function') {
        t.skip('snapshot testing is not supported on this version of Node')
        return
      }
      const res = await run(args)
      t.assert.snapshot({ ...res, out: cleanSnapshot(res.out), err: cleanSnapshot(res.err) })
    })
  }
}

describe('inc tests', () => snapshotTests([
  ['-i', 'major', '1.0.0'],
  ['-i', 'major', '1.0.0', '1.0.1'],
  ['-i', 'premajor', '1.0.0', '--preid=beta'],
  ['-i', 'premajor', '1.0.0', '--preid=beta', '-n', '1'],
  ['-i', 'premajor', '1.0.0', '--preid=beta', '-n', 'false'],
  ['-i', '1.2.3'],
  ['-i', 'release', '1.0.0-pre'],
  ['-i', 'major', '-i', 'minor', '1.0.0'], // last -i "wins"
  ['-i', 'invalid', '1.0.0'], // invalid -i value, should warn
]))

describe('help output', () => snapshotTests([
  ['-h'],
  ['-?'],
  ['--help'],
  [],
], h => h[0] || '(no args)'))

describe('sorting and filtering', () => snapshotTests([
  ['1.2.3', '3.2.1', '2.3.4'],
  ['1.2.3', '3.2.1', '2.3.4', '2.3.4-beta'],
  ['1.2.3', '-v', '3.2.1', '--version', '2.3.4'],
  ['1.2.3', '-v', '3.2.1', '--version', '2.3.4', '-rv'],
  ['1.2.3foo', '1.2.3-bar'],
  ['1.2.3foo', '1.2.3-bar', '-l'],
  ['1.2.3beta', '-l'],
  ['1.2.3', '3.2.1', '-r', '2.x', '2.3.4'],
  ['1.2.3', '3.2.1', '2.3.4', '2.3.4-beta', '2.0.0asdf', '-r', '2.x'],
  ['1.2.3', '3.2.1', '2.3.4', '2.3.4-beta', '2.0.0asdf', '-r', '2.x', '-p'],
  ['3.2.1', '2.3.4', '2.3.4-beta', '2.0.0asdf', '-r', '2.x', '-p', '-l'],
  ['1.2.3', '3.2.1', '-r', '2.x'],
]))

describe('coercing', () => snapshotTests([
  ['1.2.3.4.5.6', '-c'],
  ['1.2.3.4.5.6', '-c', '--rtl'],
  ['1.2.3.4.5.6', '-c', '--rtl', '--ltr'],
  ['not a version', '1.2.3', '-c'],
  ['not a version', '-c'],
]))

test('args with equals', () => Promise.all([
  [['--version', '1.2.3'], '1.2.3'],
  [['--range', '1'], ['1.2.3'], ['2.3.4'], '1.2.3'],
  [['--increment', 'major'], ['1.0.0'], '2.0.0'],
  [['--increment', 'premajor'], ['--preid', 'beta'], ['1.0.0'], '2.0.0-beta.0'],
].map(async (args) => {
  const expected = args.pop()
  const equals = args.map((a) => a.join('='))
  const spaces = args.reduce((acc, a) => acc.concat(a), [])
  const res1 = await run(equals)
  const res2 = await run(spaces)
  assert.strictEqual(res1.signal, null)
  assert.strictEqual(res1.code, 0)
  assert.strictEqual(res1.err, '')
  assert.strictEqual(res1.out.trim(), expected)
  assert.deepStrictEqual(res1, res2, args.join(' '))
})))
