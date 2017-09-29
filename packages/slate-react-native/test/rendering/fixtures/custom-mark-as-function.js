/** @jsx h */

import h from '../../helpers/h'
import React from 'react'
import { View, Text } from 'react-native'

export const schema = {
  marks: {
    bold: (props) => {
      return (
        React.createElement(View, { ...props.attributes },
          React.createElement(Text, {style: {fontWeight: 'bold'} }, props.children)
        )
      )
    }
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