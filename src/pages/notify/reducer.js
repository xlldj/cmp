import * as ActionTypes from '../../actions'
// import Time from '../../util/time'
import getDefaultSchool from '../../util/defaultSchool'
// 公告管理
const initialNotifyState = {
  notify: {
    page: 1,
    type: 'all'
  },
  censor: {
    page: 1
  },
  beings: {
    schoolId: getDefaultSchool(),
    type: 'all',
    status: 'all',
    method: 'all',
    page: 1
  }
}
export const notifyModule = (state = initialNotifyState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_NOTIFY) {
    const { subModule, keyValuePair } = action
    const newSubModule = { ...state[subModule], ...keyValuePair }
    var newState = { ...state, ...{ [subModule]: newSubModule } }
    return newState
  }
  return state
}

const initialBeingState = {
  list: [],
  total: 0,
  listLoading: false
}
export const beingsModal = (state = initialBeingState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_MODAL_BEING) {
    const { value } = action
    var newState = { ...state, ...value }
    return newState
  }
  return state
}
