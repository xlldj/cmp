import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from '../../actions'
let selectedSchool = getDefaultSchool()

// 失物招领
const initialLostState = {
  lostListContainer: {
    tabIndex: 1,
    schoolId: selectedSchool
  },
  lostFoundList: {
    day: 1, // 1 : 今天
    page: 1,
    startTime: '',
    endTime: '',
    type: 'all',
    status: 'all'
  }
}
export const lostModule = (state = initialLostState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_LOST) {
    const { subModule, keyValuePair } = action
    const newSubModule = { ...state[subModule], ...keyValuePair }
    var newState = { ...state, ...{ [subModule]: newSubModule } }
    return newState
  }
  return state
}

const initialLostModal = {
  list: [],
  total: 0,
  totalNormal: 0,
  totalHidden: 0,
  listLoading: false,
  detail: {},
  detailLoading: false
}
export const lostModal = (state = initialLostModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_LOST_MODAL) {
    const { value } = action
    return { ...state, value }
  }
  return state
}
