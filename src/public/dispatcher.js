export const combineControllers = controllers => {
  return (state, props, event) => {
    for (let i = 0, l = controllers.length; i < l; i++) {
      const result = controllers[i](state, props, event)
      if (result) {
        return result
      }
    }
  }
}
/**
 * 组件中redux状态的处理函数. 如果检测的状态值没有发生变化，返回null；否则根据event的type返回传给redux的action的value
 * @param {*} state : 组件的state
 * @param {*} props : 组件的props
 * @param {*} event : 传入的event
 */
export const dayController = (
  state,
  props,
  event,
  { dayName } = { dayName: 'day' }
) => {
  const { type, value } = event
  if (type === 'day') {
    if (props[dayName] === value[dayName]) {
      return
    }
    return value
  }
}
export const methodController = (
  state,
  props,
  event,
  { methodName } = { methodName: 'method' }
) => {
  const { type, value } = event
  if (type === 'method') {
    if (props[methodName] === value[methodName]) {
      return
    }
    return value
  }
}
export const statusController = (
  state,
  props,
  event,
  { statusName } = { statusName: 'status' }
) => {
  const { type, value } = event
  if (type === 'status') {
    if (props[statusName] === value[statusName]) {
      return
    }
    return value
  }
}
export const pageController = (
  state,
  props,
  event,
  { pageName } = { pageName: 'page' }
) => {
  const { type, value } = event
  if (type === 'page') {
    if (props[pageName] === value[pageName]) {
      return
    }
    return value
  }
}

export const typeController = (
  state,
  props,
  event,
  { typeName } = { typeName: 'type' }
) => {
  const { type, value } = event
  if (type === 'type') {
    if (props[typeName] === value[typeName]) {
      return
    }
    return value
  }
}

export const schoolIdController = (
  state,
  props,
  event,
  { schoolIdName } = {
    schoolIdName: 'schoolId'
  }
) => {
  const { type, value } = event
  if (type === 'schoolId') {
    if (props[schoolIdName] === value[schoolIdName]) {
      return
    }
    return value
  }
}

export const tabIndexController = (
  state,
  props,
  event,
  { tabIndexName } = {
    tabIndexName: 'tabIndex'
  }
) => {
  const { type, value } = event
  if (type === 'tabIndex') {
    if (props[tabIndexName] === value[tabIndexName]) {
      return
    }
    return value
  }
}

export const closeDetailController = (
  state,
  props,
  event,
  { showDetailName } = {
    showDetailName: 'showDetail'
  }
) => {
  const { type, value } = event
  if (type === 'toggleDetail') {
    if (props[showDetailName] === value[showDetailName]) {
      return
    }
    const action = {}
    action[showDetailName] = false
    return action
  }
}

export const syncTimeController = (
  state,
  props,
  event,
  { startTimeName, endTimeName, dayName, pageName } = {
    startTimeName: 'startTime',
    endTimeName: 'endTime',
    dayName: 'day',
    pageName: 'page'
  }
) => {
  const { type } = event
  if (type === 'syncTime') {
    const { startTime, endTime } = state
    if (!startTime || !endTime) {
      return
    }
    const action = {}
    action[startTimeName] = startTime
    action[endTimeName] = endTime
    action[pageName] = 1
    action[dayName] = 0
    return action
  }
}

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
