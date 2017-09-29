/** @jsx h */

import React from 'react'
import { View, Text } from 'react-native'
import h from '../../helpers/h'

export const schema = {
  nodes: {
    code: (props) => {
      return (
        React.createElement(View, { ...props.attributes },
          React.createElement(Text, {}, props.children)
        )
      )
    }
  }
}

export const state = (
  <state>
    <document>
      <code>
        word
      </code>
      <code>
        word
      </code>
      <code>
        word
      </code>
    </document>
  </state>
)
