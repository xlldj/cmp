const subModule = 'lostFoundList'
/**
 * 改变LostFoundListQuery组件的schoolId
 * @param {Object} props :LostListContainer组件的props
 * @param {string} v     :传入的学校id
 */
export const changeRange = (props, v) => {
  const { day } = props
  if (day !== v) {
    props.changeLost(subModule, { day: v, page: 1 })
  }
}
/**
 * 改变LostFoundListQuery组件的tab
 * @param {Object} props :LostListContainer组件的props
 * @param {string} v     :传入的tab页值
 */
export const changePhase = (props, v) => {
  const { tabIndex } = props
  if (tabIndex !== v) {
    props.changeLost(subModule, { tabIndex: v })
  }
}

export const stateController = (prevState, value) => {
  return { ...prevState, ...value }
}
export const propsController = (state, props, action) => {
  const { type, value } = action
  const { startTime, endTime } = state
  if (type === 'syncTime') {
    return { startTime, endTime }
  } else if (type === 'day') {
    return value
  } else if (type === 'type') {
    return value

    combineControllers([typeController])
  }
  const typeController = (props, action) => {
    const { type, value } = action
    if (type === 'type') {
      return value
    }
  }
}

const combineControllers = controllers => {
  return (state, props, action) => {
    for (let i = 0, l = controllers.length; i < l; i++) {}
  }
}
