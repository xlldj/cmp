import {obj2arr} from './types'

test('check o 2 array', () => {
  expect(obj2arr({a: 1})).toBe([{key: 'a', value: 1}])
})