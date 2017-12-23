import React from 'react'
import { View, Text, Linking } from 'react-native'

export class Output extends React.Component {

  openUrl = (url) => {
   return retuLinking.openURL(url);
  }

  render() {
    return (
      <View data-slate-editor={ true } contenteditable={ true } role={ "textbox" }>
        <View style={{ position: 'relative' }}>
          <View>
          <View>
            <Text data-slate-zero-width={ true }>{' '}</Text>
          </View>
          </View>
          <View onClick={ () => { openUrl('https://google.com') }}>
            <Text>word</Text>
          </View>
          <View>
            <View>
              <Text data-slate-zero-width={ true }>{' '}</Text>
            </View>
          </View>
          <View onClick={ () => { openUrl('https://google.com') }}>
            <Text>word</Text>
          </View>
          <View>
            <View>
              <Text data-slate-zero-width={ true }>{' '}</Text>
            </View>
          </View>
          <View onClick={ () => { openUrl('https://google.com') }}>
            <Text>word</Text>
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
