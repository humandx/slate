import EVENT_HANDLERS from '../constants/event-handlers'
import findRange from './find-range'
import getWindow from 'get-window'

export const isSyntheticInternalSlate = event => event.synthetic === true

export const triggerSyntheticInternalSlateEvent = (editor, change) => (event) => {
  const { type } = event
  event.synthetic = true
  const typeMatch = new RegExp(`${type}$`, 'i')
  const handlerName = EVENT_HANDLERS.find(handler => typeMatch.test(handler))
  editor.stack.run(handlerName, event, change, editor)
  // const handler = editor[(handlerName)] !== undefined ? editor[(handlerName)] : () => {}
  // handler(event)
}

export const setCompositionState = (editor, compositionRange, compositionData, compositionDocument) => {
  editor.tmp._androidInputState.compositionRange = compositionRange
  editor.tmp._androidInputState.compositionDocument = compositionDocument
  editor.tmp._androidInputState.compositionData = compositionData
}

export const updateCompositionData = (event, change, editor, data) => {
  const window = getWindow(event.target)
  const compositionRange = findRange(window.getSelection(), change.value)
  const compositionDocument = change.value.document
  const compositionData = data === undefined ? event.data : data
  setCompositionState(editor, compositionRange, compositionData, compositionDocument)
}

export const isCompositionDataValid = (change, editor) =>
  editor.tmp._androidInputState.compositionDocument === change.value.document
