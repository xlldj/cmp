import {obj2arr} from './checkSame'

test('check to be same', () => {
  expect(obj2arr({a: 1, b: 2})).toBe([{key: 'a', value: 1}, {key: 'b', value: 2}])
})