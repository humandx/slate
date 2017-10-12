/**
 * WrappedList
 * Wraps around an Immutable List and adds a key to it
 */

 import { List } from 'immutable'

/**
 * Default properties.
 *
 * @type {Object}
 */



class KeyedList extends List {
    constructor(key, value) {
        super(value)
        this.key = key
    }
}

/**
 * Attach a pseudo-symbol for type checking.
 */

// WrappedList.prototype[MODEL_TYPES.BLOCK] = true

/**
 * Mix in `List` methods.
 */

// Object.getOwnPropertyNames(List.prototype).forEach((method) => {
//   if (method == 'constructor') return
//   WrappedList.prototype[method] = (arguments) => {
//     return this.value.[`List.prototype[method]`](arguments)
//   }
// })

export default KeyedList
