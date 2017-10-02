// 3rd party modules
// - N/A
import Connector from "../../rtc/connector"
import uuid from "uuid/v4"

// Chat modules
/**
 * TODO:
 * 1. Review all the actions for conversion of objects
 *    to/from immutableJS
 * 2. Move all field references to a constants file to allow
 *    easier change in future
 */
import CasesActionTypes from "./actionTypes"
// import Connector from "../../rtc/connector"
// import {dispatchCasesError} from "../errors/actions"


export function setUserId(userId) {
    return {
        type: CasesActionTypes.SET_USER_ID,
        payload: {
            userId: userId
        }
    }
}

export function updateCaseActions() {
    return {
        request: (chatHash, change, tempId) => {
            return {
                type: CasesActionTypes.REQUEST_UPDATE_CASE,
                payload: {
                    chatHash: chatHash,
                    change: change,
                    tempId: tempId
                }
            }
        },
        receive: (chatHash, change, tempId) => {
            return {
                type: CasesActionTypes.RECEIVE_UPDATE_CASE,
                payload: {
                    chatHash: chatHash,
                    change: change,
                    tempId: tempId
                }
            }
        },
        fail: (chatHash, change, tempId) => {
            return {
                type: CasesActionTypes.FAIL_UPDATE_CASE,
                payload: {
                    chatHash: chatHash,
                    change: change,
                    tempId: tempId
                },
            }
        }
    }
}


/**
 * Add chat item thunk (redux middleware function).
 * Used to send chat item or messages.
 * @param {object} chat: A Chat object.
 * @param {object} chatItem: Chat item/message object.
 * @param {bool} reverseOrder: Flag to inform the
 *      position where the chat item would be added.
 * @returns {object} Returns a dispatch function.
 */
export function updateCase(chatHash, change) {
    // Make sure connection to socket server exists
    let connector = Connector.getInstance()
    let actions = updateCaseActions()
    return function(dispatch) {
        let tempId = uuid()
        // Optimistically update this data
        dispatch(actions.request(chatHash, change, tempId))

        if (connector) {
            // Send change to socketio
            connector.updateCase(chatHash, change, tempId)
        } else {
            // Send error message to client saying connection to socket failed,
            // please refresh page.
            // We could also store operations until the socket connection is
            // restored.
        }
    }
}



export function thisUserIsTypingActions() {
    // TODO: Change this to use chat hash instead of chat id.
    return {
        request: (userName, userId, caseHash) => {
            return {
                type: CasesActionTypes.REQUEST_USER_IS_TYPING,
                payload: {
                    userName: userName,
                    userId: userId,
                    caseHash: caseHash,
                }
            }
        },
        receive: (userName, userId, caseHash) => {
            return {
                type: CasesActionTypes.RECEIVE_USER_IS_TYPING,
                payload: {
                    userName: userName,
                    userId: userId,
                    caseHash: caseHash,
                    receivedAt: new Date()
                }
            }
        },
        stop: (userName, userId, caseHash) => {
            return {
                type: CasesActionTypes.STOP_USER_IS_TYPING,
                payload: {
                    userName: userName,
                    userId: userId,
                    caseHash: caseHash,
                }
            }
        },
        fail: (error) => {
            return {
                type: CasesActionTypes.FAIL_USER_IS_TYPING,
                payload: { error: error, receivedAt: new Date() }
            }
        }
    }
}

/**
 * User is typing thunk (redux middleware function).
 * Used to create list of users typing.
 * @param {string} userName: Name of user typing.
 * @param {number} userId: Id of user typing.
 * @param {string} caseHash: Chat object.
 * @returns {object} Returns a dispatch function.
 */
export function thisUserIsTyping(userName, userId, caseHash) {
    let connector = Connector.getInstance()
    let actions = thisUserIsTypingActions()
    return function(dispatch) {
        dispatch(actions.request(userName, userId, caseHash))
        connector.thisUserIsTyping({
            userName: userName,
            userId: userId,
            caseHash: caseHash,
        })
    }
}
