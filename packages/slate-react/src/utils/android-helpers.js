import EVENT_HANDLERS from '../constants/event-handlers'
import findRange from './find-range'
import { Range } from 'slate'
import getWindow from 'get-window'
import Debug from 'debug'

/**
 * Debug.
 *
 * @type {Function}
 */

const debug = Debug('slate:android-helpers')
debug.enabled = true


export const isSyntheticInternalSlate = event => event.synthetic === true

export const triggerSyntheticInternalSlateEvent = (editor, change) => (event) => {
  const { type } = event
  const updateEvent = {
    synthetic: true,
    preventDefault: event.preventDefault ? event.preventDefault : () => {}
  }
  const typeMatch = new RegExp(`${type}$`, 'i')
  const handlerName = EVENT_HANDLERS.find(handler => typeMatch.test(handler))
  editor.stack.run(handlerName, { ...event, ...updateEvent }, change, editor)
  // const handler = editor[(handlerName)] !== undefined ? editor[(handlerName)] : () => {}
  // handler(event)
}

export const setCompositionState = (editor, compositionRange, compositionData, compositionDocument) => {
  debug('setCompositionState', { compositionRange, compositionData, compositionDocument })
  editor.tmp._androidInputState.compositionRange = compositionRange
  editor.tmp._androidInputState.compositionDocument = compositionDocument
  editor.tmp._androidInputState.compositionData = compositionData
}

export const safelyComputeCompositionRange = (event, change) => {
  const compositionRange = findRange(window.getSelection(), change.value)
  if (compositionRange === null) {
    debug('safelyComputeCompositionRange: null compositionRange', {
      compositionRange,
      slateSelection: change.value.selection.toJS(),
      domSelection: window.getSelection(),
      slateDocument: change.value.document.toJS(),
    })
  }
  if (compositionRange !== null && compositionRange.focusKey !== compositionRange.anchorKey) {
    debug('safelyComputeCompositionRange: anchor and focus are in different nodes. Trusting the endKey over the startKey',
      {
        compositionRange,
        slateSelection: change.value.selection.toJS(),
        domSelection: window.getSelection(),
        slateDocument: change.value.document.toJS(),
      })
    // Typically, when this is the case, we were unable to compute the composition range correctly.
    // We'll try to guess it instead:
    if ((event.type === 'compositionupdate' || event.type === 'compositionend' || event.type === 'textInput')) {
      // In these cases, we are likely replacing the current word, so we compute the range of that word:
      if (change.value.selection.isCollapsed) {
        // Composition events on android tend to replace the whole word. Let's just select the current word:
        const { focusKey, focusOffset } = change.value.selection
        const focusText = change.value.document.getDescendant(focusKey).text
        const prefixText = focusText.slice(0, focusOffset)
        const suffixText = focusText.slice(focusOffset)
        const wordStartOffset = prefixText.search(/\w*$/)
        const wordEndOffset = suffixText.search(/\W|$/)
        return Range.create({
          anchorKey: focusKey,
          anchorOffset: wordStartOffset,
          focusKey,
          focusOffset: focusOffset + wordEndOffset,
        })
      } else {
        // No idea what's going on here. There is some selection, so let's use it.
        // This may cause unknown bugs... We're stepping blindly into the unknown.
        return change.value.selection
      }
    }
    // If we weren't one of the previous event types, lets' just try to guess the composition
    // range from what was given to us: we'll collapse it to the start of the currently edited node
    // (this is because these errors usually occur at the edge of nodes).
    const { anchorKey, anchorOffset, focusKey, focusOffset } = compositionRange
    if (!compositionRange.isBackward) {
      return Range.create({
        anchorKey: focusKey,
        anchorOffset: 0,
        focusKey,
        focusOffset,
      })
    } else {
      return Range.create({
        anchorKey,
        anchorOffset,
        focusKey: anchorKey,
        focusOffset: 0,
      })
    }
  }
  return compositionRange
}

export const updateCompositionData = (event, change, editor, data) => {
  const compositionRange = safelyComputeCompositionRange(event, change)
  const compositionDocument = change.value.document
  const compositionData = data === undefined ? event.data : data
  setCompositionState(editor, compositionRange, compositionData, compositionDocument)
}

export const isCompositionDataValid = (change, editor) =>
  editor.tmp._androidInputState.compositionDocument === change.value.document

