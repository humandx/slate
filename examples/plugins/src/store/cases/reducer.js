// 3rd party modules
import Immutable from "immutable"
import patch from 'immutablepatch';
import diff from 'immutablediff';
import Plain from 'slate-plain-serializer'
import Automerge from 'automerge'
import { State } from 'slate'

// Chat modules
import casesActionTypes from "./actionTypes"
// import {addError} from "../errors/actions"

// RTC module
import Connector from "../../rtc/connector"

export default function(state=getInitialCase(), action) {
    switch (action.type) {
    case casesActionTypes.SET_USER_ID:
        return setUserId(state, action.payload)
    case casesActionTypes.REQUEST_UPDATE_CASE:
        return updateCase(state, action.payload)
    case casesActionTypes.RECEIVE_UPDATE_CASE:
        return updateCaseFromServer(state, action.payload)
    case casesActionTypes.FAIL_UPDATE_CASE:
        return updateCaseFailed(state, action.payload)
    case casesActionTypes.RECEIVE_FETCH_CASE:
        return updateCase(state, action.payload)
    case casesActionTypes.FAIL_FETCH_CASE:
        return reportError(state, action.payload)
    case casesActionTypes.RECEIVE_USER_IS_TYPING:
        return thisUserIsTyping(state, action.payload)
    case casesActionTypes.STOP_USER_IS_TYPING:
        return thisUserHasStoppedTyping(state, action.payload)
    case casesActionTypes.FAIL_USER_IS_TYPING:
        return reportError(state, action.payload)
    default:
        return state
    }
}

function getInitialCase() {

    let state = Immutable.Map();

    let slateState = Plain.deserialize(`This example shows how you can extend Slate with plugins! It uses four fairly simple plugins, but you can use any plugins you want, or write your own!

            The first is an "auto replacer". Try typing "(c)" and you'll see it turn into a copyright symbol automatically!

            The second is a simple plugin to collapse the selection whenever the escape key is pressed. Try selecting some text and pressing escape.

            The third is another simple plugin that inserts a "soft" break when enter is pressed instead of creating a new block. Try pressing enter!

            The fourth is an example of using the plugin.render property to create a higher-order-component.`)

    // let slateState = Plain.deserialize(`This example.`)

    let automergeState = Automerge.init()

    state = state.set("automerge", automergeState);

    state = state.set("state", slateState)

    state = state.set("alreadyApplied", Immutable.Set())
    state = state.set("unsyncedOperations", Immutable.List())
    state = state.set("activeUsers", Immutable.Map())
    state = state.set("userId", -1)

    return state
}

function setUserId(state, payload) {
    return state.set("userId", payload["userId"])
}

function getCaseFromStore(state, payload) {
    // let caseHash = payload["caseHash"]
    // let object = state.get(caseHash) || getInitialCase()
    // return object
    return state.get("state")
}

function updateCase(state, payload) {

    let caseHash = payload["caseHash"]
    let change = payload["change"]
    let tempId = payload["tempId"]

    let originalState = state

    let alreadyApplied = state.get("alreadyApplied")
    if (alreadyApplied.has(tempId)) {
        return state
    }
    state = state.set("state", change.state)
    state = state.set("alreadyApplied", state.get("alreadyApplied").add(tempId))

    // let slateState = state.get("state").toJSON()

    // state = state.set("automerge", Automerge.change(state.get("automerge"), "update document", (doc) => {
    //   doc.slateState = slateState
    // }));


    let automergeStateOriginal = state.get("automerge")["slateState"]
    let automergeStateImmutable = Immutable.fromJS(automergeStateOriginal)
    let slateState = state.get("state")
    let slateStateJson = slateState.toJSON({preserveKeys:true})
    let slateStateImmutable = Immutable.fromJS(slateStateJson)
    let ops = diff(automergeStateImmutable, slateStateImmutable)
    ops = ops.filter((op) => {return op.get("path").indexOf("_objectId") == -1})

    if (ops.size !== 0) {
        let newState = patch(automergeStateImmutable, ops)
        let opsCheck = diff(newState, slateStateImmutable)

        let automergeState = Automerge.change(state.get("automerge"), "update document", (doc) => {
          // doc.slateState = slateState.toJSON({preserveKeys:true})
          // let test = patch(automergeStateImmutable, ops)
          // let testJS = test.toJS()
          // doc.slateState = testJS
          // doc.slateState.document.nodes[0].nodes[0].ranges[0] = "thisa"


          // applyOperationToJson(doc.slateState, ops)
          doc.slateState = slateState
        })
        state = state.set("automerge", automergeState);
        state = state.set("state", State.fromJSON(automergeState.slateState))
    }
    return state
}

function applyOperationToJson(automergeState, operations) {
    let rootAutomergeState = automergeState
    operations.forEach((operation) => {
        let pathList = operation.get('path').split('/').splice(1)
        let automergeState = rootAutomergeState
        pathList.forEach((path, i) => {if (i != pathList.length-1) {automergeState = automergeState[path]}})
        if (operation.get("op") == "replace") {
            automergeState[pathList[pathList.length-1]] = operation.get("value")
        }
        // Add "add" and "remove" operations
    })
    return automergeState
}

function updateCaseFromServer(state, payload) {
    let caseHash = payload["caseHash"]
    let caseState = getCaseFromStore(state, payload)
    let operations = payload["change"]
    let tempId = payload["tempId"]

    let alreadyApplied = state.get("alreadyApplied")
    if (alreadyApplied.has(tempId)) {
        return state
    }
    let caseChange = caseState.change()
    operations.forEach((operation) => {
        if (shouldApplyOperation(operation)) {
            caseChange = caseChange.applyOperation(operation)
        }
    })
    return state.set("state", caseChange.state)
}


function updateCaseFailed(state, payload) {
    let caseHash = payload["caseHash"]
    let operations = payload["change"]
    let tempId = payload["tempId"]

    // TODO:
    // Report error
    // Save change for later
    // Highlight error'd or failed changes on editor
}


function shouldApplyOperation(operation) {
    if (operation["type"] == "set_selection") {
        return false
    } else {
        return true
    }
}


function thisUserIsTyping(state, payload) {
    let userId = payload["userId"]

    if (userId == state.get("userId")) {
        return state
    }

    let userName = payload["userName"]
    let receivedAt = payload["receivedAt"]
    let caseHash = payload["caseHash"]
    let activeUsers = state.get("activeUsers")

    activeUsers = activeUsers.set(userId, payload)
    state = state.set("activeUsers", activeUsers)
    return state
}


function thisUserHasStoppedTyping(state, payload) {
    let userId = payload["userId"]
    let userName = payload["userName"]
    let receivedAt = payload["receivedAt"]
    let caseHash = payload["caseHash"]
    let activeUsers = state.get("activeUsers")

    activeUsers = activeUsers.filter((val, key) => {
        return key !== userId
    })

    state = state.set("activeUsers", activeUsers)
    return state
}
