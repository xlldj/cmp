/**
 * 调用组件的action更改对应的reducer中的时间段值
 * @param {Object} props :组件的props
 * @param {string} subModule: 对应的reducer中的状态节点
 * @param {string} actionName: 对应module的action name
 * @param {string} v     :传入的时间段枚举值
 */
export const changeRange = (
  props,
  subModule,
  actionName,
  v,
  { dayName, pageName, clearTime, startTimeStateName, endTimeStateName } = {
    dayName: 'day',
    pageName: 'page',
    clearTime: true, // 清除掉startTime和endTime
    startTimeStateName: 'startTime',
    endTimeStateName: 'endTime'
  }
) => {
  const day = props[dayName]
  if (day !== v) {
    const value = {}
    value[dayName] = v
    value[pageName] = 1
    if (clearTime) {
      value[startTimeStateName] = ''
      value[endTimeStateName] = ''
    }
    props[actionName](subModule, value)
  }
}

/**
 * 调用组件的action更改对应的reducer中的startTime和endTime，同时将page和对应的时间变量置为0
 * @param {object} context: 组件的this值
 * @param {string} subModule: 要更改的reducer中的状态节点
 * @param {string} actionName: 对应module的action name
 * @param {object} options: 其他参数，如要改变的page和day变量名
 */
export const confirmTimeRange = (
  context,
  subModule,
  actionName,
  { pageName, dayName } = { pageName: 'page', dayName: 'day' }
) => {
  let { startTime, endTime } = context.state
  if (!startTime || !endTime) {
    return
  }
  const value = { startTime, endTime }
  value[pageName] = 1
  value[dayName] = 0
  context.props[actionName](subModule, value)
}
