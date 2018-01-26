import Time from './time'

test('Time.showDate(1516956105000) to be "2018-01-26 16:41"', () => {
  expect(Time.showDate(1516956105000)).toBe('2018-01-26 16:41')
})
