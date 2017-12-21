
import Base64 from 'slate-base64-serializer'
import Debug from 'debug'
import React from 'react'
import SlateTypes from 'slate-prop-types'
import Types from 'prop-types'
import keycode from 'keycode'
import { Selection } from 'slate'

import TRANSFER_TYPES from '../constants/transfer-types'
import Node from './node'
import findClosestNode from '../utils/find-closest-node'
import getPoint from '../utils/get-point'
import getTransferData from '../utils/get-transfer-data'
import setTransferData from '../utils/set-transfer-data'

/**
 * Debug.
 *
 * @type {Function}
 */

const debug = Debug('slate:content')

/**
 * Content.
 *
 * @type {Component}
 */

class Content extends React.Component {

  /**
   * Property types.
   *
   * @type {Object}
   */

  static propTypes = {
    autoCorrect: Types.bool.isRequired,
    autoFocus: Types.bool.isRequired,
    children: Types.array.isRequired,
    className: Types.string,
    editor: Types.object.isRequired,
    onBeforeInput: Types.func.isRequired,
    onBlur: Types.func.isRequired,
    onCopy: Types.func.isRequired,
    onCut: Types.func.isRequired,
    onDrop: Types.func.isRequired,
    onFocus: Types.func.isRequired,
    onKeyDown: Types.func.isRequired,
    onKeyUp: Types.func.isRequired,
    onPaste: Types.func.isRequired,
    onSelect: Types.func.isRequired,
    readOnly: Types.bool.isRequired,
    role: Types.string,
    schema: SlateTypes.schema.isRequired,
    spellCheck: Types.bool.isRequired,
    state: SlateTypes.state.isRequired,
    style: Types.object,
    tabIndex: Types.number,
    tagName: Types.string,
  }

  /**
   * Default properties.
   *
   * @type {Object}
   */

  static defaultProps = {
    style: {},
    tagName: 'View',
  }

  /**
   * Constructor.
   *
   * @param {Object} props
   */

  constructor(props) {
    super(props)
    this.tmp = {}
    this.tmp.compositions = 0
    this.tmp.forces = 0
  }

  /**
   * When the editor first mounts in the DOM we need to:
   *
   *   - Update the selection, in case it starts focused.
   *   - Focus the editor if `autoFocus` is set.
   */

  componentDidMount = () => {
    if (this.props.autoFocus) {
      this.element.focus()
    }
  }

  /**
   * On update, update the selection.
   */

  componentDidUpdate = () => {
  }


  /**
   * The React ref method to set the root content element locally.
   *
   * @param {Element} element
   */

  ref = (element) => {
    this.element = element
  }

  /**
   * Check if an event `target` is fired from within the contenteditable
   * element. This should be false for edits happening in non-contenteditable
   * children, such as void nodes and other nested Slate editors.
   *
   * @param {Element} target
   * @return {Boolean}
   */

  isInEditor = (target) => {
    const { element } = this
    // COMPAT: Text nodes don't have `isContentEditable` property. So, when
    // `target` is a text node use its parent node for check.
    const el = target.nodeType === 3 ? target.parentNode : target
    return (
      (el.isContentEditable) &&
      (el === element || findClosestNode(el, '[data-slate-editor]') === element)
    )
  }

  /**
   * On before input, bubble up.
   *
   * @param {Event} event
   */

  onBeforeInput = (event) => {
    if (this.props.readOnly) return
    if (!this.isInEditor(event.target)) return

    const data = {}

    debug('onBeforeInput', { event, data })
    this.props.onBeforeInput(event, data)
  }

  /**
   * On blur, update the selection to be not focused.
   *
   * @param {Event} event
   */

  onBlur = (event) => {
    if (this.props.readOnly) return
    if (this.tmp.isCopying) return
    if (!this.isInEditor(event.target)) return

    const data = {}

    debug('onBlur', { event, data })
    this.props.onBlur(event, data)
  }

  /**
   * On focus, update the selection to be focused.
   *
   * @param {Event} event
   */

  onFocus = (event) => {
    if (this.props.readOnly) return
    if (this.tmp.isCopying) return
    if (!this.isInEditor(event.target)) return

    const data = {}

    debug('onFocus', { event, data })
    this.props.onFocus(event, data)
  }

  /**
   * On composition start, set the `isComposing` flag.
   *
   * @param {Event} event
   */

  onCompositionStart = (event) => {
    if (!this.isInEditor(event.target)) return

    this.tmp.isComposing = true
    this.tmp.compositions++

    debug('onCompositionStart', { event })
  }

  /**
   * On composition end, remove the `isComposing` flag on the next tick. Also
   * increment the `forces` key, which will force the contenteditable element
   * to completely re-render, since IME puts React in an unreconcilable state.
   *
   * @param {Event} event
   */

  onCompositionEnd = (event) => {
    if (!this.isInEditor(event.target)) return

    this.tmp.forces++
    const count = this.tmp.compositions

    // The `count` check here ensures that if another composition starts
    // before the timeout has closed out this one, we will abort unsetting the
    // `isComposing` flag, since a composition in still in affect.
    setTimeout(() => {
      if (this.tmp.compositions > count) return
      this.tmp.isComposing = false
    })

    debug('onCompositionEnd', { event })
  }

  /**
   * On copy, defer to `onCutCopy`, then bubble up.
   *
   * @param {Event} event
   */

  onCopy = (event) => {
    if (!this.isInEditor(event.target)) return

    this.tmp.isCopying = true

    const { state } = this.props
    const data = {}
    data.type = 'fragment'
    data.fragment = state.fragment

    debug('onCopy', { event, data })
    this.props.onCopy(event, data)
  }

  /**
   * On cut, defer to `onCutCopy`, then bubble up.
   *
   * @param {Event} event
   */

  onCut = (event) => {
    if (this.props.readOnly) return
    if (!this.isInEditor(event.target)) return

    this.tmp.isCopying = true

    const { state } = this.props
    const data = {}
    data.type = 'fragment'
    data.fragment = state.fragment

    debug('onCut', { event, data })
    this.props.onCut(event, data)
  }

  /**
   * On drag end, unset the `isDragging` flag.
   *
   * @param {Event} event
   */

  onDragEnd = (event) => {
    if (!this.isInEditor(event.target)) return

    this.tmp.isDragging = false
    this.tmp.isInternalDrag = null

    debug('onDragEnd', { event })
  }

  /**
   * On drag over, set the `isDragging` flag and the `isInternalDrag` flag.
   *
   * @param {Event} event
   */

  onDragOver = (event) => {
    if (!this.isInEditor(event.target)) return
    if (this.tmp.isDragging) return
    this.tmp.isDragging = true
    this.tmp.isInternalDrag = false

    debug('onDragOver', { event })
  }

  /**
   * On drag start, set the `isDragging` flag and the `isInternalDrag` flag.
   *
   * @param {Event} event
   */

  onDragStart = (event) => {
    if (!this.isInEditor(event.target)) return

    this.tmp.isDragging = true
    this.tmp.isInternalDrag = true
    const { dataTransfer } = event.nativeEvent
    const data = getTransferData(dataTransfer)

    // If it's a node being dragged, the data type is already set.
    if (data.type == 'node') return

    const { state } = this.props
    const { fragment } = state
    const encoded = Base64.serializeNode(fragment)

    setTransferData(dataTransfer, TRANSFER_TYPES.FRAGMENT, encoded)

    debug('onDragStart', { event })
  }

  /**
   * On drop.
   *
   * @param {Event} event
   */

  onDrop = (event) => {
    event.preventDefault()

    if (this.props.readOnly) return
    if (!this.isInEditor(event.target)) return

    const { state, editor } = this.props
    const { nativeEvent } = event
    const { dataTransfer } = nativeEvent
    const data = getTransferData(dataTransfer)

    // Resolve the point where the drop occured.
    let range

    const { startContainer, startOffset } = range
    const point = getPoint(startContainer, startOffset, state, editor)
    if (!point) return

    const target = Selection.create({
      anchorKey: point.key,
      anchorOffset: point.offset,
      focusKey: point.key,
      focusOffset: point.offset,
      isFocused: true
    })

    // Add drop-specific information to the data.
    data.target = target

    // COMPAT: Edge throws "Permission denied" errors when
    // accessing `dropEffect` or `effectAllowed` (2017/7/12)
    try {
      data.effect = dataTransfer.dropEffect
    } catch (err) {
      data.effect = null
    }

    if (data.type == 'fragment' || data.type == 'node') {
      data.isInternal = this.tmp.isInternalDrag
    }

    debug('onDrop', { event, data })
    this.props.onDrop(event, data)
  }

  /**
   * On input, handle spellcheck and other similar edits that don't go trigger
   * the `onBeforeInput` and instead update the DOM directly.
   *
   * @param {Event} event
   */

  onInput = (event) => {
    if (this.tmp.isComposing) return
    if (this.props.state.isBlurred) return
    if (!this.isInEditor(event.target)) return
    debug('onInput', { event })

    const { state, editor } = this.props

    // Change the current state to have the text replaced.
    editor.change((change) => {
      change
        .delete()
        .select(after)
    })
  }

  /**
   * On key down, prevent the default behavior of certain commands that will
   * leave the editor in an out-of-sync state, then bubble up.
   *
   * @param {Event} event
   */

  onKeyDown = (event) => {
    if (this.props.readOnly) return
    if (!this.isInEditor(event.target)) return

    const { which } = event
    const key = keycode(which)
    const data = {}

    // Keep track of an `isShifting` flag, because it's often used to trigger
    // "Paste and Match Style" commands, but isn't available on the event in a
    // normal paste event.
    if (key == 'shift') {
      this.tmp.isShifting = true
    }

    // When composing, these characters commit the composition but also move the
    // selection before we're able to handle it, so prevent their default,
    // selection-moving behavior.
    if (
      this.tmp.isComposing &&
      (key == 'left' || key == 'right' || key == 'up' || key == 'down')
    ) {
      event.preventDefault()
      return
    }

    // These key commands have native behavior in contenteditable elements which
    // will cause our state to be out of sync, so prevent them.
    if (
      (key == 'enter') ||
      (key == 'backspace') ||
      (key == 'delete') ||
      (key == 'b') ||
      (key == 'i') ||
      (key == 'y') ||
      (key == 'z')
    ) {
      event.preventDefault()
    }

    debug('onKeyDown', { event, data })
    this.props.onKeyDown(event, data)
  }

  /**
   * On key up, unset the `isShifting` flag.
   *
   * @param {Event} event
   */

  onKeyUp = (event) => {
    const { which } = event
    const key = keycode(which)
    const data = {}

    if (key == 'shift') {
      this.tmp.isShifting = false
    }

    debug('onKeyUp', { event, data })
    this.props.onKeyUp(event, data)
  }

  /**
   * On paste, determine the type and bubble up.
   *
   * @param {Event} event
   */

  onPaste = (event) => {
    if (this.props.readOnly) return
    if (!this.isInEditor(event.target)) return

    const data = getTransferData(event.clipboardData)

    // Attach the `isShift` flag, so that people can use it to trigger "Paste
    // and Match Style" logic.
    data.isShift = !!this.tmp.isShifting
    debug('onPaste', { event, data })

    event.preventDefault()
    this.props.onPaste(event, data)
  }

  /**
   * On select, update the current state's selection.
   *
   * @param {Event} event
   */

  onSelect = (event) => {
    if (this.props.readOnly) return
    if (this.tmp.isCopying) return
    if (this.tmp.isComposing) return
    if (this.tmp.isSelecting) return
    if (!this.isInEditor(event.target)) return

    const { state, editor } = this.props
    const { document, selection } = state

    const data = {}

    debug('onSelect', { event, data })
    this.props.onSelect(event, data)
  }

  /**
   * Render the editor content.
   *
   * @return {Element}
   */

  render() {
    const { props } = this
    const { className, readOnly, state, tabIndex, role, tagName } = props
    const Container = tagName
    const { document, selection } = state
    const indexes = document.getSelectionIndexes(selection, selection.isFocused)
    const children = document.nodes.toArray().map((child, i) => {
      const isSelected = !!indexes && indexes.start <= i && i < indexes.end
      return this.renderNode(child, isSelected)
    })

    const style = {
      // Prevent the default outline styles.
      outline: 'none',
      // Preserve adjacent whitespace and new lines.
      whiteSpace: 'pre-wrap',
      // Allow words to break if they are too long.
      wordWrap: 'break-word',
      // Allow for passed-in styles to override anything.
      ...props.style,
    }

    const spellCheck = props.spellCheck

    debug('render', { props })

    return (
      <Container
        data-slate-editor
        key={this.tmp.forces}
        ref={this.ref}
        data-key={document.key}
        contentEditable={!readOnly}
        suppressContentEditableWarning
        className={className}
        onBeforeInput={this.onBeforeInput}
        onBlur={this.onBlur}
        onFocus={this.onFocus}
        onCompositionEnd={this.onCompositionEnd}
        onCompositionStart={this.onCompositionStart}
        onCopy={this.onCopy}
        onCut={this.onCut}
        onDragEnd={this.onDragEnd}
        onDragOver={this.onDragOver}
        onDragStart={this.onDragStart}
        onDrop={this.onDrop}
        onInput={this.onInput}
        onKeyDown={this.onKeyDown}
        onKeyUp={this.onKeyUp}
        onPaste={this.onPaste}
        onSelect={this.onSelect}
        autoCorrect={props.autoCorrect ? 'on' : 'off'}
        spellCheck={spellCheck}
        style={style}
        role={readOnly ? null : (role || 'textbox')}
        tabIndex={tabIndex}
      >
        {children}
        {this.props.children}
      </Container>
    )
  }

  /**
   * Render a `child` node of the document.
   *
   * @param {Node} child
   * @param {Boolean} isSelected
   * @return {Element}
   */

  renderNode = (child, isSelected) => {
    const { editor, readOnly, schema, state } = this.props
    const { document } = state
    return (
      <Node
        block={null}
        editor={editor}
        isSelected={isSelected}
        key={child.key}
        node={child}
        parent={document}
        readOnly={readOnly}
        schema={schema}
        state={state}
      />
    )
  }

}

/**
 * Export.
 *
 * @type {Component}
 */

export default Content
