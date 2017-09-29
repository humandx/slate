import React from 'react'
import { View, Text } from 'react-native'

export class Output extends React.Component {

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
            <Text>one</Text>
            <Text style={{ fontWeight: 'bold' }}>two</Text>
            <Text>three</Text>
          </View>
        </View>
      </View>
    )
  }
}
