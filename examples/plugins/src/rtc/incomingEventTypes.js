// 3rd party modules
import Humps from "humps"

// Slate modules
// N/A

// Cases modules
import * as CaseActions from "../store/cases/actions"


let userIsTypingTimeout

/**
 * Handler function for all emit/broadcasts from the socket.
 * @param {object} store: Store used to dispatch actions
 * @returns {object} Handler code and action.
 *     action takes data as a parameter - which is sent from the socket
 *     data contains:
 *          caseHash: Unique identifier of the chat
 *          data: Result (as is) from the API endpoint.
 */
export default function (store) {
    return {
        updateDataSuccess: {
            code: "cases/update_case_success",
            action: (data) => {
                // Do nothing
                // If anything, remove the tempId from alreadyApplied so that
                // set doesn't grow too large

                // store.dispatch(CaseActions.updateCaseActions().receive(
                //     data.data, true
                // ))
            }
        },
        updateDataFailed: {
            code: "cases/update_case_fail",
            action: (data) => {
                data = Humps.camelizeKeys(data)
                store.dispatch(CaseActions.updateCaseActions().fail(
                    data.caseHash, data.operations, data.tempId
                ))
                // store.dispatch(ErrorActions.updateDataFailed())
            }
        },
        updateDataFromServer: {
            code: "cases/update_case_from_server",
            action: (data) => {
                data = Humps.camelizeKeys(data)
                store.dispatch(CaseActions.updateCaseActions().receive(
                    data.caseHash, data.operations, data.tempId
                ))
            }
        },
        otherUsersAreTyping: {
            code: "cases/user_is_typing_from_server",
            action: (data) => {
                data = Humps.camelizeKeys(data)
                store.dispatch(CaseActions.thisUserIsTypingActions().receive(
                    data.userName, data.userId, data.chatId
                ))
                if (userIsTypingTimeout) {
                    clearTimeout(userIsTypingTimeout)
                }
                // Set a timer for X seconds to remove the user
                userIsTypingTimeout = setTimeout(() => {
                    store.dispatch(
                        CaseActions.thisUserIsTypingActions()
                            .stop(data.userName, data.userId, data.chatId)
                    )
                }, 2000)
            }
        },
        disconnect: {
            code: "cases/disconnect",
            action: () => {
                //TODO: notify the user of disconnect
            }
        },
        joinedChat: {
            code: "cases/joined_chat",
            action: (data) => {
                console.log("User Joined Chat", data)
            }
        }
    }
}
