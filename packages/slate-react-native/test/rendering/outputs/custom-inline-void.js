import React from 'react'
import { View, Text, Image } from 'react-native'

export class Output extends React.Component {

  render() {
    return  (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
            <View>
              <Text data-slate-zero-width={ true }>{' '}</Text>
            </View>
          </View>
          <View data-slate-void={ true }>
            <View style= {{ backgroundColor: 'transparent' }}>
              <View>
                <Text data-slate-zero-width="true">{' '}</Text>
              </View>
            </View>
            <View contenteditable={ false }>
              <Image source={{uri: ''}} />
            </View>
          </View>
          <View>
            <View>
              <Text data-slate-zero-width={ true }>{' '}</Text>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
