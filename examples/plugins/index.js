// 3rd party modules
import Immutable from "immutable"
import PropTypes from "prop-types"
import { connect } from "react-redux"
import { bindActionCreators }  from "redux"

// Slate modules
import AutoReplaceText from "slate-auto-replace-text"
import CollapseOnEscape from "slate-collapse-on-escape"
import Plain from "slate-plain-serializer"
import React from "react"
import SoftBreak from "slate-soft-break"
import { Editor } from "slate-react"

// Cases modules
import { store } from "../index"
import { setUserId } from "./src/store/cases/actions"
import SyncViaSocket from "./src/index"
import { rootUrl, rtsUrl, userAuthToken } from "../constants"

// Global vars
const USER_ID = 152

/**
 * Word Count plugin
 *
 * Example of using plugin.render to create a HOC
 * https://docs.slatejs.org/reference/plugins/plugin.html#render
 */

function WordCount(options) {
  return {
    render(props) {
      return (
        <div>
          <div>
            {props.children}
          </div>
          <span className="word-counter">
            Word Count: {props.state.document.text.split(" ").length}
          </span>
        </div>
      )
    }
  }
}

/**
 * The plugins example.
 *
 * @type {Component}
 */
class Plugins extends React.Component {
  /**
   * Deserialize the initial editor state.
   *
   * @type {Object}
   */
  constructor(props) {
    super(props)

    let userId = this.props.userId || USER_ID

    /**
     * Plugins.
     */
    this.plugins = [
      AutoReplaceText("(c)", "©"),
      AutoReplaceText("(r)", "®"),
      AutoReplaceText("(tm)", "™"),
      CollapseOnEscape(),
      SoftBreak(),
      WordCount(),
      SyncViaSocket({
        userId: userId,
        useCookie: true,
        userAuthToken: userAuthToken,
        rootUrl: rootUrl,
        rtsUrl: rtsUrl,
        showIsTyping: true,
        store: store
      })
    ]

    this.props.setUserId(userId)
  }


  /**
   * Render the editor.
   *
   * @return {Component} component
   */
  render() {
      return (
        <Editor
          placeholder={"Enter some text..."}
          plugins={this.plugins}
          state={this.props.state}
          onChange={this.onChange}
          activeUsers={this.props.activeUsers}
        />
      )
  }

}

Plugins.propTypes = {
  userId: PropTypes.number,
  useCookie: PropTypes.bool,
  userAuthToken: PropTypes.string,
  encryptedAuthToken: PropTypes.string,
  rtsUrl: PropTypes.string,
  showIsTyping: PropTypes.bool,
  store: PropTypes.object
}



/**
 * Export.
 */


function mapStateToProps(state) {
    return {
        state: state.cases.get("state"),
        activeUsers: state.cases.get("activeUsers")
    }
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({
        setUserId: setUserId,
    }, dispatch);
};
export default connect(mapStateToProps, mapDispatchToProps)(Plugins)
