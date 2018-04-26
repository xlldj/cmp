export const generateMonthDayEnums = () => {
  // {'-1': '最后一天', 1: '第一天', 2: '第二天'}
  const result = { '-3': '倒数第三天', '-2': '倒数第二天', '-1': '最后一天' }

  for (let i = 1; i < 29; i++) {
    result[i] = `第${i}天`
  }
  return result
}
