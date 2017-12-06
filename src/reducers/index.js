import * as ActionTypes from '../actions'
import merge from 'lodash/merge'
import { combineReducers } from 'redux'
import {getLocal} from '../pages/util/storage'
import Time from '../pages/component/time'

const recentSchools = getLocal('recentSchools')
var selectedSchool = 'all'
if (recentSchools) {
  let recent = recentSchools.split(',')
  let schoolId = recent[0]
  selectedSchool = schoolId
} else {
  let defaultSchool = getLocal('defaultSchool')
  if (defaultSchool) {
    selectedSchool = defaultSchool
  }
}

const initialSchoolState = {
  schoolList: {
    page: 1,
    schoolId: 'all'
  }
}
const changeSchool = (state = initialSchoolState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_SCHOOL) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialDeviceState = {
  deviceList: {
    page: 1,
    schoolId: 'all',
    deviceType: 'all',
    selectKey: ''
  },
  components: {
    page: 1
  },
  prepay: {
    page: 1
  },
  timeset: {
    page: 1
  },
  suppliers: {
    page: 1
  },
  rateSet: {
    page: 1
  },
  repair: {
    page: 1,
    deviceType: 'all',
    schoolId: 'all',
    status: 'all'
  }
}
const changeDevice = (state = initialDeviceState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_DEVICE) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialOrderState = {
  order: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    status: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgo(),
    endTime: Time.getNow()
  }
}
const changeOrder = (state = initialOrderState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_ORDER) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

// 资金管理
const initialFundState = {
  fundList: {
    page: 1,
    schoolId: selectedSchool,
    type: 'all',
    status: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgo(),
    endTime: Time.getNow()
  },
  cashtime: {
    page: 1
  },
  charge: {
    page: 1
  },
  deposit: {
    page: 1,
    schoolId: 'all'
  }
}
const changeFund = (state = initialFundState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_FUND) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

// 红包管理
const initialGiftState = {
  giftList: {
    page: 1,
    deviceType: 'all'
  },
  act: {
    page: 1,
    schoolId: 'all'
  }
}
const changeGift = (state = initialGiftState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_GIFT) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialLostState = {
  lostList: {
    page: 1,
    schoolId: 'all',
    type: 'all'
  }
}
const changeLost = (state = initialLostState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_LOST) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialUserState = {
  userList: {
    page: 1,
    schoolId: selectedSchool,
    selectKey: ''
  }
}
const changeUser = (state = initialUserState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_USER) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialTaskState = {
  taskList: {
    page: 1,
    assigned: false,
    sourceType: 'all',
    pending: 'all',
    all: '1',
    schoolId: selectedSchool
  },
  log: {
    schoolId: selectedSchool,
    page: 1,
    all: '1'
  },
  abnormal: {
    schoolId: selectedSchool,
    page: 1,
    selectKey: ''
  },
  complaint: {
    schoolId: selectedSchool,
    page: 1,
    type: 'all',
    status: 'all',
    selectKey: ''
  },
  feedback: {
    page: 1,
    schoolId: selectedSchool
  }
}
const changeTask = (state = initialTaskState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_TASK) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialEmployeeState = {
  employeeList: {
    page: 1,
    selectKey: ''
  }
}
const changeEmployee = (state = initialEmployeeState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_EMPLOYEE) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const initialNotifyState = {
  notify: {
    page: 1,
    type: 'all'
  },
  censor: {
    page: 1
  }
}
const changeNotify = (state = initialNotifyState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_NOTIFY) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}
const initialVersionState = {
  version: {
    page: 1
  }
}
const changeVersion = (state = initialVersionState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_VERSION) {
    const {subModule, keyValuePair} = action
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

const rootReducer = combineReducers({
  changeSchool,
  changeDevice,
  changeOrder,
  changeFund,
  changeGift,
  changeLost,
  changeUser,
  changeTask,
  changeEmployee,
  changeNotify,
  changeVersion
})

export default rootReducer
