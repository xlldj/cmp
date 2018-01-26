import { obj2arr } from './types'

test('check to be same', () => {
  expect(obj2arr({ a: 1, b: 2 })).toEqual([
    { key: 'a', value: 1 },
    { key: 'b', value: 2 }
  ])
})
