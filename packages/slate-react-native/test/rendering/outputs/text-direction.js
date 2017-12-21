import React from 'react'
import { View, Text } from 'react-native'

export class Output extends React.Component {

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
            <Text>Hello, world!</Text>
          </View>
        </View>
        <View dir="rtl" style={{ position: 'relative' }}>
          <View>
            <Text>مرحبا بالعالم</Text>
          </View>
        </View>
        <View dir="rtl" style={{ position: 'relative' }}>
          <View>
            <Text>שלום עולם</Text>
          </View>
        </View>
      </View>
    )
  }
}