// 3rd party modules
import Connector from "./rtc/connector"
import Immutable from "immutable"
import React from "react"
import typeOf from "type-of"
import uuid from "uuid/v4"

// Cases modules
import {updateCaseActions, updateCase, thisUserIsTypingActions, thisUserIsTyping, setUserId} from "./store/cases/actions"
import {store} from "../../index"

/**
 * A Slate plugin to send and receive change messages from socket.io
 *
 * @param {Object} options
 * @return {Object}
 */

function SyncViaSocket(options = {}) {
  /**
   * options contains: userId, rtsUrl, userAuthToken, encryptedAuthToken
   * showIsTyping
   */
  let { userId, userAuthToken, encryptedAuthToken, rtsUrl, showIsTyping } = options
  new Connector(userId, userAuthToken, encryptedAuthToken, rtsUrl)

  /**
   * On change.
   *
   * @param {Change} change
   */
  function onChange(change) {
    if (shouldSendOperationToSocket(change.operations)) {
      store.dispatch(updateCase(null, change))

      // Throttle this to send only every X/2 seconds
      store.dispatch(thisUserIsTyping("Victor", userId, null))
    } else {
      let tempId = uuid()
      store.dispatch(updateCaseActions().request(null, change, tempId))
    }
  }


  /**
   * On render.
   *
   * @param {Object} props
   */
  function render(props) {
    let activeUsers = props.activeUsers || Immutable.Map()
    let names = Immutable.List()
    activeUsers.valueSeq().toArray().forEach((val) => {
        names = names.push(val["userName"])
      }
    )
    if (!showIsTyping || names.size == 0) {
      return props.children;
    }
    let text = `${names.join(",")} is typing...`
    return (
      <div>
        <div>
          {props.children}
        </div>
        <span className="word-counter">
          {text}
        </span>
      </div>
    )
  }

  /**
   * Return the plugin.
   *
   * @type {Object}
   */
  return {
    onChange,
    render,
  }
}


function shouldSendOperationToSocket(operations) {
    if (operations.length > 1) {
      return true
    } else if (operations[0]["type"] == "set_selection") {
        return false
    } else {
        return true
    }
}


/**
 * Export.
 *
 * @type {Function}
 */
export default SyncViaSocket
