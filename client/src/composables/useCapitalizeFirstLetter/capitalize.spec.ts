import capitalizeFirstLetter from './index'

it('should capitalize only first letter', () => {
  const capitalized = capitalizeFirstLetter('hello, world')
  expect(capitalized).toEqual('Hello, world')
})

it('should return the same string if the first character is not letter', () => {
  const text = '1. this will not be capitalized'
  const result = capitalizeFirstLetter(text)

  expect(result).toEqual(text)
})
