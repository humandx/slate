/** @jsx h */

import h from '../../helpers/h'
import React from 'react'
import { Image } from 'react-native'

export const schema = {
  nodes: {
    emoji: (props) => {
      return React.createElement(Image, { source: {uri: props.node.data.get('src')}, ...props.attributes }, null)
    }
  }
}

export const state = (
  <state>
    <document>
      <paragraph>
        <emoji />
      </paragraph>
    </document>
  </state>
)