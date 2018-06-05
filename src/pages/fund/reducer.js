import { merge } from 'lodash'
import getDefaultSchool from '../../util/defaultSchool'
import Time from '../../util/time'
import * as ActionTypes from '../../actions'
const selectedSchool = getDefaultSchool()
// 资金管理
const initialFundState = {
  fundList: {
    page: 1,
    schoolId: selectedSchool,
    type: 'all',
    status: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgoStart(),
    endTime: Time.getTodayEnd(),
    userType: 'all'
  },
  withdrawList: {
    page: 1,
    schoolId: selectedSchool,
    status: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgoStart(),
    endTime: Time.getTodayEnd(),
    userType: 'all'
  },
  cashtime: {
    page: 1,
    schoolId: selectedSchool
  },
  charge: {
    schoolId: selectedSchool,
    page: 1
  },
  deposit: {
    page: 1,
    schoolId: selectedSchool
  },
  abnormal: {
    schoolId: selectedSchool,
    page: 1,
    selectKey: '',
    userType: 'all'
  },
  freeGiving: {
    schoolId: selectedSchool,
    page: 1
  },
  fundCheck: {
    schoolId: selectedSchool,
    page: 1,
    type: 'all', // 异常类型
    status: 1, // 处理状态
    method: 'all', // 处理方式
    showDetail: false,
    showHandleModal: false,
    selectedRowIndex: -1,
    selectedDetailId: -1
  }
}
export const fundModule = (state = initialFundState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_FUND) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

export const initialFundListModal = {
  loading: false,
  list: []
}
export const fundListModal = (state = initialFundListModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_FUNDLIST) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
const initialFundCheckModal = {
  list: [],
  listLoading: false,
  total: 0,
  detail: {},
  detailLoading: false
}
export const fundCheckModal = (state = initialFundCheckModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_FUNDCHECK) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
