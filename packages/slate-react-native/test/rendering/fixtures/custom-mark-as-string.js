/** @jsx h */

import h from '../../helpers/h'

export const schema = {
  marks: {
    bold: 'bold',
  }
}

export const state = (
  <state>
    <document>
      <paragraph>
        one<b>two</b>three
      </paragraph>
    </document>
  </state>
)
