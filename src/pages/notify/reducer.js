import * as ActionTypes from '../../actions'
import moment from 'moment'
import CONTAIN from '../../constants/index'
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
    type: CONTAIN.PUSH_TYPE_AUTO,
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
  listLoading: false,
  detail: {
    schoolId: 'all',
    pushMethon: '',
    pushEqument: '',
    pushObj: '',
    pushTime: moment(),
    pushContent: '',
    pushStatus: 2
  },
  detailLoading: false
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
