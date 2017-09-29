import React from 'react'
import 'react-native'
import renderer from 'react-test-renderer'
import fs from 'fs-promise' // eslint-disable-line import/no-extraneous-dependencies
import { Editor } from '../../src'
import { basename, extname, resolve } from 'path'

/**
 * Tests.
 */

const fixturesDir = resolve(__dirname, './fixtures')
const outputsDir = resolve(__dirname, './outputs')
const tests = fs.readdirSync(fixturesDir).filter(t => t[0] != '.' && !!~t.indexOf('.js')).map(t => basename(t, extname(t)))
const expected = fs.readdirSync(outputsDir).filter(t => t[0] != '.' && !!~t.indexOf('.js')).map(t => basename(t, extname(t)))

describe('rendering', () => {

  let testLists = []
  tests.forEach((t, index) => {
    const testInfo = {
      name: t,
      input: require(resolve(fixturesDir, t)),
      expected: require(resolve(outputsDir, t))
    };
    testLists.push(testInfo)
  })

  testLists.forEach((test) => {
    it(test.name, async () => {
      const { state, schema } = test.input
      const { Output } = test.expected
      const props = {
        state,
        schema,
        onChange() {},
      }

      const actual = renderer.create(<Editor {...props} />).toJSON()
      const result = renderer.create(<Output />).toJSON()
      expect(result).toMatchSnapshot()
    })
  })
})
