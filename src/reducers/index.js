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
}

const initialAuthenData = {
  full: [],
  originalPrivileges: [],
  current: [
  ],
  forbiddenUrls: [],
  forbiddenStatus: {
  },
  authenSet: false,
  mainNavs: [],
  subNavs: {}
}
const setAuthenData = (state = initialAuthenData, action) => {
  const {type} = action
  if (type === ActionTypes.SET_AUTHENDATA) {
    const value = action.value
    console.log(value)
    return Object.assign({}, state, value)
  }
  return state
}

const initialRoleList = {
  roles: [],
  rolesSet: false,
  rolePrivileges: [],
  rolePrivilegesSet: false
}
const setRoleList = (state = initialRoleList, action) => {
  const {type} = action
  if (type === ActionTypes.SET_ROLE_LIST) {
    console.log(action.value)
    const value = action.value
    // console.log({...state, ...value})
    return Object.assign({}, state, value)
  }
  return state
}

const initialSchools = {
  recent: [],
  schools: [],
  schoolSet: false
}
const setSchoolList = (state = initialSchools, action) => {
  const {type} = action
  if (type === ActionTypes.SET_SCHOOL_LIST) {
    if (selectedSchool === 'all' && action.value.schools.length > 0) {
      selectedSchool = action.value.schools[0].id.toString()
    }
    const value = action.value
    // console.log({...state, ...value})
    return {...state, ...value}
  }
  return state
}

const initialSchoolState = {
  schoolList: {
    page: 1,
    schoolId: selectedSchool
  },
  overview: {
    page: 1,
    schoolId: selectedSchool
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
    schoolId: selectedSchool,
    deviceType: 'all',
    selectKey: ''
  },
  components: {
    page: 1
  },
  prepay: {
    page: 1,
    schoolId: selectedSchool
  },
  timeset: {
    schoolId: selectedSchool,
    page: 1
  },
  suppliers: {
    page: 1
  },
  rateSet: {
    schoolId: selectedSchool,
    page: 1
  },
  repair: {
    page: 1,
    deviceType: 'all',
    schoolId: selectedSchool,
    status: 'all'
  },
  rateLimit: {
    schoolId: selectedSchool,
    page: 1
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
  orderList: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    status: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgoStart(),
    endTime: Time.getTodayEnd(),
    userType: 'all'
  },
  abnormal: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    selectKey: '',
    startTime: Time.get7DaysAgoStart(),
    endTime: Time.getTodayEnd(),
    userType: 'all'
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
    schoolId: selectedSchool
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

// 失物招领
const initialLostState = {
  lostList: {
    page: 1,
    schoolId: selectedSchool,
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

// 用户管理
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

// 客服工单
const initialTaskState = {
  taskBlock: {
    hintRoot: false, // if show the red point in root nav
    countOfUnviewed: 0, // count of all tasks status changed

    // state for main page
    main_phase: 1, // '待处理'
    main_schoolId: 'all',
    main_mine: false, // '我的工单'
    main_time: 1, // '时间'
    main_startTime: '',
    main_endTime: '',
    main_type: 1, // 类型
    main_selectKey: '',
    main_total: 0, // change these parameters will clear former dataSource and reload 
    main_page: 1, // change this will check if need to reload data
    main_dataSource: {}, // store data of different page, use page as key. Once 'main_' select parameter (other than 'main_page') changed, clear all data. 
    main_countOfUnviewed: 0, // count of data need to check again(status changed since last time check)

    // state for detail page
    details: {}, // like main_dataSource, user 'type+id' as key, only add when 'main_' select parameter has not changed. Clear when main_dataSource is cleard.
    detail_tabIndex: 1, // index for detail tab. Abstracted to be independent on data of detail.
  },
  taskList: {
    page: 1,
    assigned: false,
    sourceType: 'all',
    pending: 'all',
    all: '1',
    schoolId: 'all'
  },
  log: {
    schoolId: 'all',
    page: 1,
    all: '1'
  },
  complaint: {
    schoolId: 'all',
    page: 1,
    type: 'all',
    status: 'all',
    selectKey: ''
  },
  feedback: {
    page: 1,
    schoolId: 'all' 
  }
}
const changeTask = (state = initialTaskState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_TASK) {
    const {subModule, keyValuePair} = action
    console.log(keyValuePair)
    return merge({}, state, {[subModule]: keyValuePair})
  }
  return state
}

// 员工管理
const initialEmployeeState = {
  employeeList: {
    schoolId: selectedSchool,
    page: 1,
    selectKey: ''
  },
  authenList: {
    page: 1
  },
  roleList: {
    page: 1
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

// 公告管理
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

// 版本管理
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

/* 统计分析模块 */
const initialStatState = {
  overview: {
    schoolId: selectedSchool
  },
  charts: {
    schoolId: selectedSchool,
    timeSpan: 2,
    currentChart: 1,
    target: 1,
    compare: false,
    currentMonth: true,
    monthStr: Time.getMonthFormat(Date.parse(new Date()))
  },
  rank: {
    schoolId: selectedSchool,
    page: 1,
    currentRank: 1,
    timeSpan: 1,
    schoolName: ''
  }
}
const changeStat = (state = initialStatState, action) => {
  const {type} = action

  if (type === ActionTypes.CHANGE_STAT) {
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
  changeVersion,
  setSchoolList,
  changeStat,
  setAuthenData,
  setRoleList
})

export default rootReducer
