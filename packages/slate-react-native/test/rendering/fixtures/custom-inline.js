/** @jsx h */

import h from '../../helpers/h'
import React from 'react'
import { View } from 'react-native'

export const schema = {
  nodes: {
    link: (props) => {
      return React.createElement(View, { onClick: () => { openUrl(props.node.data.get('href'))}, ...props.attributes }, [...props.children])
    }
  }
}

export const state = (
  <state>
    <document>
      <paragraph>
        <link href="https://google.com">
          word
        </link>
      </paragraph>
    </document>
  </state>
)
