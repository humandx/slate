/** @jsx h */

import h from '../../../helpers/h'

import { Data } from '../../../..'


export default function (change) {
  const texts = document.getTexts()
  const first = texts.first()
  const range = selection.merge({
    anchorKey: first.key,
    anchorOffset: 0,
    focusKey: first.key,
    focusOffset: 0
  })

  change
    .select(range)
    .setBlock({
      type: 'code',
      data: Data.create({ thing: 'value' })
    })

  assert.deepEqual(
    next.selection.toJS(),
    range.toJS()
  )
}

export const input = (
  <state>
    <document>
      <paragraph>word</paragraph>
    </document>
  </state>
)

export const output = (
  <state>
    <document>
      <code>word</code>
    </document>
  </state>
)
