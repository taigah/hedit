#!/usr/bin/env node
const $editor = process.env['EDITOR']
const { exec, spawn } = require('child_process')
const { randomBytes } = require('crypto')
const { promisify } = require('util')
const path = require('path')
const os = require('os')
const fs = require('fs').promises
const { once } = require('events')

const srcfile = process.argv[2]
const tmpfile = path.join(os.tmpdir(), randomBytes(10).toString('hex'))

async function run () {
  // gets the hex dump of the file
  // then writes it in a temp file
  const { stdout: hexdumpStdout } = await promisify(exec)(`xxd "${srcfile}"`)
  await fs.writeFile(tmpfile, hexdumpStdout)
  
  // opens the temp file using the user's default editor
  const proc = spawn($editor, [tmpfile], {
    stdio: 'inherit'
  })
  
  // waits for the user to close his editor
  await once(proc, 'close')

  // when he closes the editor, converts back the hex dump to binary
  // then writes it back in the srcfile
  const { stdout: binStdout } = await promisify(exec)(`xxd -r "${tmpfile}"`)
  await fs.writeFile(srcfile, binStdout)
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
