import { Chance } from 'chance'
import { config } from '@server/config'

// If we are running tests in CI server, we want to use the same seed
// every time to make the tests deterministic.
export const random = config.isCi ? Chance(1) : Chance()
