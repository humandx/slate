
import CorePlugin from '../../src/plugins/core'
import Simulator from 'slate-simulator'
import assert from 'assert'
import fs from 'fs'
import { basename, extname, resolve } from 'path'

/**
 * Tests.
 */


const dir = resolve(__dirname, 'core')
const events = fs.readdirSync(dir).filter(e => e[0] != '.' && e != 'index.js')

describe('plugins', () => {
  let testLists = []
  for (const event of events) {
    const testDir = resolve(dir, event)
    const tests = fs.readdirSync(testDir).filter(t => t[0] != '.' && !!~t.indexOf('.js')).map(t => basename(t, extname(t)))

    for (const test of tests) {
      const testInfo = {
        name: test,
        module: require(resolve(testDir, test))
      };
      testLists.push(testInfo)
    }
  }

  testLists.forEach((test) => {
    it(test.name, () => {
      const { input, output, props = {}} = test.module
      const fn = test.module.default
      const plugins = [CorePlugin(props)]
      const simulator = new Simulator({ plugins, state: input })
      fn(simulator)

      const actual = simulator.state.toJSON({ preserveSelection: true })
      const expected = output.toJSON({ preserveSelection: true })
      assert.deepEqual(actual, expected)
    })
  })
})