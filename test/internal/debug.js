'use strict'

const main = () => {
  const { test } = require('node:test')
  const assert = require('node:assert')
  const { spawn } = require('child_process')

  const runChild = (NODE_DEBUG) => new Promise((resolve, reject) => {
    const c = spawn(process.execPath, [__filename, 'child'], { env: {
      ...process.env,
      NODE_DEBUG,
    } })
    const err = []
    c.stderr.on('data', chunk => err.push(chunk))
    c.on('error', reject)
    c.on('close', (code, signal) => resolve({
      code,
      signal,
      stderr: Buffer.concat(err).toString('utf8'),
    }))
  })

  test('without env set', async () => {
    const { code, signal, stderr } = await runChild('')
    assert.strictEqual(code, 0, 'success exit status')
    assert.strictEqual(signal, null, 'no signal')
    assert.strictEqual(stderr, '', 'got no output')
  })

  test('with env set', async () => {
    const { code, signal, stderr } = await runChild('semver')
    assert.strictEqual(code, 0, 'success exit status')
    assert.strictEqual(signal, null, 'no signal')
    assert.strictEqual(stderr, 'SEMVER hello, world\n', 'got expected output')
  })
}

if (process.argv[2] === 'child') {
  require('../../internal/debug')('hello, world')
} else {
  main()
}
