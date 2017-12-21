import React from 'react'
import { View, Text, Image } from 'react-native'

export class Output extends React.Component {

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View data-slate-void={ true }>
          <View style={{ flex : 1, width: 0, backgroundColor: 'transparent' }}>
            <View>
              <Text data-slate-zero-width="true">&#x200A;</Text>
            </View>
          </View>
          <View contenteditable={ false } style={{ flex : 1, width: '100%', }}>
            <Image source={{ uri: 'https://example.com/image.png' }} />
          </View>
        </View>
      </View>
    )
  }
}

