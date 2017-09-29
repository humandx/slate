/** @jsx h */

import h from '../../helpers/h'
import React from 'react'
import { View } from 'react-native'

export const schema = {
  nodes: {
    code: (props) => {
      return React.createElement(View, { ...props.attributes }, [...props.children])
    }
  }
}

export const state = (
  <state>
    <document>
      <code>
        word
      </code>
    </document>
  </state>
)
