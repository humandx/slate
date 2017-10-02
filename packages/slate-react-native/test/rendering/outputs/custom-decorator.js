
import React from 'react'
import { View, Text } from 'react-native'
import { Mark } from 'slate'

export class Output extends React.Component {

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
            <Text>o</Text>
            <Text style={{ fontWeight: 'bold' }}>n</Text>
            <Text>e</Text>
          </View>
        </View>
      </View>
    )
  }
}
