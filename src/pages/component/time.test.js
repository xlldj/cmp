import Time from './time'

test('Time.get7DaysAgoStart() to be 1512921600000', () => {
  expect(Time.get7DaysAgoStart()).toBe(1512921600000)
})

test('Time.getTodayEnd() to be 1513612799000', () => {
  expect(Time.getTodayEnd()).toBe(1513612799000)
})