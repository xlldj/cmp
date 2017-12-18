import {checkSame} from './checkSame'

test('check to be same', () => {
  expect(checkSame({a: 1}, {a: 1}, ['a'])).toBe(true)
})