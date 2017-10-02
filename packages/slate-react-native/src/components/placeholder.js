
import React from 'react'
import { View } from 'react-native'
import SlateTypes from 'slate-prop-types'
import Types from 'prop-types'

/**
 * Placeholder.
 *
 * @type {Component}
 */

class Placeholder extends React.Component {

  /**
   * Property types.
   *
   * @type {Object}
   */

  static propTypes = {
    children: Types.any.isRequired,
    className: Types.string,
    firstOnly: Types.bool,
    node: SlateTypes.node.isRequired,
    parent: SlateTypes.node,
    state: SlateTypes.state.isRequired,
    style: Types.object,
  }

  /**
   * Default properties.
   *
   * @type {Object}
   */

  static defaultProps = {
    firstOnly: true,
  }

  /**
   * Should the placeholder update?
   *
   * @param {Object} props
   * @param {Object} state
   * @return {Boolean}
   */

  shouldComponentUpdate = (props, state) => {
    return (
      props.children != this.props.children ||
      props.className != this.props.className ||
      props.firstOnly != this.props.firstOnly ||
      props.parent != this.props.parent ||
      props.node != this.props.node ||
      props.style != this.props.style
    )
  }

  /**
   * Is the placeholder visible?
   *
   * @return {Boolean}
   */

  isVisible = () => {
    const { firstOnly, node, parent } = this.props
    if (node.text) return false

    if (firstOnly) {
      if (parent.nodes.size > 1) return false
      if (parent.nodes.first() === node) return true
      return false
    } else {
      return true
    }
  }

  /**
   * Render.
   *
   * If the placeholder is a string, and no `className` or `style` has been
   * passed, give it a default style of lowered opacity.
   *
   * @return {Element}
   */

  render() {
    const isVisible = this.isVisible()
    if (!isVisible) return null

    const { children, className } = this.props
    let { style } = this.props

    if (typeof children === 'string' && style == null) {
      style = { opacity: '0.333' }
    } else if (style == null) {
      style = {}
    }

    const styles = {
      position: 'absolute',
      marginTop: 0,
      marginRight: '0px',
      marginBottom: '0px',
      marginLeft: '0px',
      ...style
    }

    return (
      <View contentEditable={false} style={styles}>
        {children}
      </View>
    )
  }

}

/**
 * Export.
 *
 * @type {Component}
 */

export default Placeholder
