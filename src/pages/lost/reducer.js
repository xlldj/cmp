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
    day: 'all',
    page: 1,
    startTime: '',
    endTime: '',
    type: 'all',
    status: 'all',
    selectedRowIndex: -1,
    selectedDetailId: -1,
    showDetail: false,
    order: 0 // 默认无排序，
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
  detailLoading: false,
  comments: [],
  commentsLoading: false,
  commentsSize: 0
}
export const lostModal = (state = initialLostModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_LOST) {
    console.log(action)
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
const initialBlackModal = {
  list: [],
  total: 0,
  totalNormal: 0,
  listLoading: false,
  comments: [],
  commentsLoading: false,
  commentsSize: 0,
  page: 1
}
export const blackModal = (state = initialBlackModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_BLACK) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
