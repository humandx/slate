import React from 'react'
import { View, Text } from 'react-native'

export class Output extends React.Component {

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
            <View>
              <View data-slate-zero-width={ true }>{' '}</View>
            </View>
          </View>
          <View style={{ position: 'relative' }}>
            <View>
              <View>word</View>
            </View>
          </View>
          <View>
            <View>
              <View data-slate-zero-width={ true }>{' '}</View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}