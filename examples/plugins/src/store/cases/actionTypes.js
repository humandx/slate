/**
 * @file actionTypes.js
 * @desc Contains the action types for chats.
 */

// 3rd party modules
let KeyMirror = require("keymirror")

/**
 * Since the action types here are related to making network requests,
 * we have different action types to cater for the different
 * stages of the request.
 * REQUEST_<ACTION TYPE>: Dispatched before the API call is made.
 * RECEIVE_<ACTION TYPE>: Dispatched after response is received from the API.
 * FAIL_<ACTION TYPE>: Dispatched if an error is received from the API call
 */
export default KeyMirror({
    SET_USER_ID: null,
    UPDATE_CASE: null,
    REQUEST_UPDATE_CASE: null,
    RECEIVE_UPDATE_CASE: null,
    FAIL_UPDATE_CASE: null,
    FETCH_CASE: null,
    REQUEST_FETCH_CASE: null,
    RECEIVE_FETCH_CASE: null,
    FAIL_FETCH_CASE: null,
    REQUEST_USER_IS_TYPING: null,
    RECEIVE_USER_IS_TYPING: null,
    STOP_USER_IS_TYPING: null,
    FAIL_USER_IS_TYPING: null
})
