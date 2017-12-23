
/**
 * Find the deepest descendant of a React Native `element`.
 *
 * @param {Element} node
 * @return {Element}
 */

import React from 'react'

function findDeepestNode(element) {
  const children = React.Children.toArray(element.props.children)
  if (children.length) {
    const firstChild = Array.isArray(element.props.children) ? element.props.children[0] : element.props.children
    return findDeepestNode(firstChild)
  } else {
    return element
  }
}

/**
 * Export.
 *
 * @type {Function}
 */

export default findDeepestNode
