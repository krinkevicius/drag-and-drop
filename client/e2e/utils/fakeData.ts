import { Chance } from 'chance'

// If we are running tests in CI server, we want to use the same seed
// every time to make the tests deterministic.
export const random = process.env.CI ? Chance(1) : Chance()

/**
 * Creates a new user with a random email, username and password. We want a random email
 * and username as our E2E tests can run against a real database, and we don't want to
 * our tests to fail because of a duplicate values.
 */
export const fakeUser = () => ({
  email: random.email(),
  username: random.string({ alpha: true, numeric: true, length: 5 }),
  password: 'password.123',
})
