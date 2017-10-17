// 3rd party modules
import Bluebird from "bluebird"
import Humps from "humps"
import io from "socket.io-client"
const $ = window.jQuery;

// Slate modules
// N/A

// Cases module
import EmitEvents from "./emitEventTypes"
import IncomingEvents from "./incomingEventTypes"

/**
 * Enum status to denote current state of the socket connection.
 */
const Status = {
    OPEN: true,
    CLOSED: false
}

// let log = (key, value) => {
//     if (Config.isDevEnv === true) {
//         //TODO: use appropriate logger
//         console.log(key, value)
//     }
// }

// This needs to be a singleton
let connectorInstance = null

/**
 * Instantiable class to make socket calls
 */
class connector {
    /**
     * Constructor for the instantiatable connector.
     * @param {string} userId: User Id of the logged in user.
     * @param {string} authToken: Authentication token of the logged in user.
     * @param {string} rtsUrl: URL pointing to the real time server.
     * @param {object} store: Redux store to be used to dispatch actions.
     */
    constructor(userId, authToken, rootUrl, rtsUrl, store) {
        if (!connectorInstance) {
            connectorInstance = this
        }
        this.userId = userId
        this.store = store
        this.rtsUrl = rtsUrl

        let userAgent = window.navigator.userAgent;
        let query = [
            "Auth-Token=", encodeURIComponent(authToken), "&",
            "User-Agent=", encodeURIComponent(userAgent)
        ].join("")

        /**
         * Options to be passed to the socket manager.
         * More options are available here:
         * https://github.com/socketio/engine.io-client#methods
         * @param {boolean} autoConnect : Determines if the socket manager
         *       should connect once it is instantiated.
         * @param {object} query: Extra data to be sent across to the
         *       socket server
         * @param {boolean} reconnection: Determines if the socket connection
         *       would attempt to reconnect when connection is lost.
         * @param {number} reconnectionAttempts: Number of times the socket
         *       connection should attempt reconnection.
         * @param {boolean} upgrade: Determines if the socket manager should
         *       try to upgrade the transport from long-polling to websocket.
         * @param {array} transports: An array of strings denoting the type
         *      of transports the socket manager should employ.
         */
        let options = {
            autoConnect: false,
            query: query,
            reconnection: true,
            reconnectionAttempts: 3,
            upgrade: true,
            transports: ["websocket", "polling"]
        }

        this.socket = io(rtsUrl, options)
        /**
         * The helps to return the emit calls as promises,
         * which would help separate the socket calls from the
         * action dispatchers.
         */
        this.socket.emitAsync = Bluebird.promisify(this.socket.emit)

        /**
         * Listen to connect emission before setting up receivers for
         * other events.
         */
        // this.socket.on("connected", (result) => {
        //     if (result.success === true) {
        //         this.setupSocketReceivers()
        //     }
        // })

        this.socket.open()

        this.socket.on("unauthorized", (result) => {
            log("unauthorized because: ", result)
        })

        this.setupSocketReceivers()
    }

    static getInstance() {
        return connectorInstance
    }

    /**
     * Returns the status of the connector.
     * @returns {boolean} True if connected, False if disconnected.
     */
    getStatus() {
        return this.socket.connected
    }

    /**
     * Util function to emit events to the rts server.
     * @param {string} eventName: Event name to be emitted.
     * @param {object} data: Data to be sent along with the emmission.
     * @returns {object} Emit promise.
     */
    emit(eventName, data) {
        return this.socket.emitAsync(event, data)
    }

    /**
     * Allows client to join a case using the case id.
     * @param {number} caseId: Identifier for the case to join.
     * @returns {object} Emit Promise.
     */
    join(caseId) {
        let data = {caseId: caseId, userId: this.userId}
        data = Humps.decamelizeKeys(data)
        return this.socket.emitAsync(EmitEvents.join, data)
    }

    /**
     * Updates case data to the rts
     * @param {object} data: Slate change object
     * @returns {object} Emit Promise
     */
    updateCase(caseHash, change, tempId) {
        let data = {
            caseHash: caseHash,
            operations: change.operations,
            tempId: tempId,
        }
        // This is commented out b/c it breaks the Immutable object
        // that is sent over for some reason.
        // data = Humps.decamelizeKeys(data)
        return this.socket.emitAsync(EmitEvents.updateCase, data)
    }

    /**
     * Sends the name of the user typing.
     * @param {object} data: user typing data.
     * @returns {object} Emit promise.
     */
    thisUserIsTyping(data) {
        // data = Humps.decamelizeKeys(data)
        return this.socket.emitAsync(EmitEvents.thisUserIsTyping, data)
    }

    /**
     * Removes the user using the specific socket
     * connection from a case
     * @param {int} caseId: Identifier of the case
     * @returns {object} Emit promise
     */
    leave(caseId) {
        let data = Humps.decamelizeKeys({caseId: caseId})
        return this.socket.emitAsync(EmitEvents.leave, data)
    }

    /**
     * Sets up listeners for the events the socket server would be emitting.
     * This is called in the connector constructor
     * @param {object} store: Store used to dispatch actions from connector
     * @returns {void}
     */
    setupSocketReceivers() {
        let incomingEvents = IncomingEvents(this.store)
        Object.keys(incomingEvents).forEach((key) => {
            this.socket.on(
                incomingEvents[key].code, incomingEvents[key].action
            )
        })
    }
}

export default connector
