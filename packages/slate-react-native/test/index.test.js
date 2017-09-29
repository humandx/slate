
/**
 * Dependencies.
 */

import { resetKeyGenerator } from 'slate'

/**
 * Reset Slate's internal state before each text.
 */
beforeEach(() => {
  resetKeyGenerator()
})

/**
 * Tests.
 */

describe('slate-react-native', () => {
  require('./plugins')
  require('./rendering')
})


