import * as ActionTypes from '../actions'
import { merge } from 'lodash'
import { combineReducers } from 'redux'
import { getLocal } from '../util/storage'
import Time from '../util/time'

import heaterModule from '../pages/heater/reducer'
import orderModule from '../pages/order/reducer'

import doorForbidModule from '../pages/doorForbid/reducer'
const recentSchools = getLocal('recentSchools')
var selectedSchool = 'all'
if (recentSchools) {
  let recent = recentSchools.split(',')
  let schoolId = recent[0]
  selectedSchool = schoolId
}

const initialUserInfo = {
  isCs: false, // is Custom Service?
  csOnline: false, // custom service is online?
  alertHasUnhandledTask: false, // for customer, alert not to offline
  name: '',
  id: -1,
  portrait: ''
}
const setUserInfo = (state = initialUserInfo, action) => {
  const { type } = action
  if (type === ActionTypes.SET_USERINFO) {
    const value = action.value
    return Object.assign({}, state, value)
  }
  return state
}

const initialAuthenData = {
  full: [],
  originalPrivileges: [],
  current: [],
  forbiddenUrls: [],
  forbiddenStatus: {},
  authenSet: false,
  mainNavs: [],
  subNavs: {}
}
const setAuthenData = (state = initialAuthenData, action) => {
  const { type } = action
  if (type === ActionTypes.SET_AUTHENDATA) {
    const value = action.value
    return Object.assign({}, state, value)
  }
  return state
}

// for set all the gifts globally.
const initialGifts = {
  gifts: [],
  giftSet: false
}
const setGifts = (state = initialGifts, action) => {
  const { type } = action
  if (type === ActionTypes.SET_GIFTS) {
    const value = action.value
    return Object.assign({}, state, value)
  }
  return state
}

const initialTagList = {}
const setTagList = (state = initialTagList, action) => {
  const { type } = action
  if (type === ActionTypes.SET_TAG_LIST) {
    const value = action.value
    // don't merge state, or else it will keep deleted tag.
    return Object.assign({}, value)
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
  const { type } = action
  if (type === ActionTypes.SET_ROLE_LIST) {
    // console.log(action.value);
    const value = action.value
    // console.log({...state, ...value})
    return Object.assign({}, state, value)
  }
  return state
}

// fetch School List, since most pages use this data
const initialSchools = {
  recent: [],
  schools: [],
  schoolSet: false
}
const setSchoolList = (state = initialSchools, action) => {
  const { type } = action
  if (type === ActionTypes.SET_SCHOOL_LIST) {
    if (selectedSchool === 'all' && action.value.schools.length > 0) {
      selectedSchool = action.value.schools[0].id.toString()
    }
    const value = action.value
    // console.log({...state, ...value})
    return { ...state, ...value }
  }
  return state
}

// state of 'school' Module
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
const schoolModule = (state = initialSchoolState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_SCHOOL) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

/*
const initialHeaterState = {
  heaterList: {
    page: 1,
    schoolId: selectedSchool,
    heaterStatus: 1, // 1 for unregisterd, 2 for registerd.
    loading: true,
    dataSource: [],
    total: ''
  },
  heaterStatus: {
    heaterStatus: 1, // 1 for '实时', 2 for  '设置',
    schoolId: selectedSchool
  }
}
const heaterModule = (state = initialHeaterState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_HEATER) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}
*/

const initialDeviceState = {
  deviceList: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    selectKey: '',
    loading: true,
    dataSource: [],
    total: ''
  },
  components: {
    page: 1,
    dataSource: [],
    total: 0,
    loading: false
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
const deviceModule = (state = initialDeviceState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_DEVICE) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
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
const fundModule = (state = initialFundState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_FUND) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
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
  },
  credits: {
    page: 1,
    schoolId: selectedSchool
  }
}
const giftModule = (state = initialGiftState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_GIFT) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
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
const lostModule = (state = initialLostState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_LOST) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

// 用户管理
const initialUserState = {
  userList: {
    page: 1,
    schoolId: selectedSchool,
    selectKey: '',
    userTransfer: 'all'
  }
}
const userModule = (state = initialUserState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_USER) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

// 客服工单
const initialTaskState = {
  taskList: {
    hintRoot: false, // if show the red point in root nav
    countOfUnviewed: 0, // count of all tasks status changed

    // state for main page
    main_phase: 0, // '待处理', the first three is for all panels
    main_schoolId: 'all',
    main_mine: '2', // 1: '我的工单', 2: '全部'
    selectedRowIndex: -1, // the row whose detail is being watching
    selectedDetailId: -1, // id of showing detail

    panel_rangeIndex: [3, 3, 3], // '时间', time select of each panel
    panel_startTime: ['', '', ''], // startTime of each panel
    panel_endTime: ['', '', ''], // endTime of each panel
    panel_type: [1, 1, 1], // 类型
    panel_selectKey: ['', '', ''],
    panel_total: [0, 0, 0], // change these parameters will clear former dataSource and reload
    panel_page: [1, 1, 1], // change this will check if need to reload data
    panel_dataSource: { 1: [], 2: [], 3: [] }, // store data of different type as element of array. For each type, use 'page' as key to save data.
    panel_countOfUnviewed: [0, 0, 0], // count of data need to check again(status changed since last time check)

    // state for detail page
    details: {}, // like panel_dataSource, use 'id' as key, only add or update info. No need to delete.
    detail_tabIndex: [1, 1, 1], // index for detail tab. Abstracted to be independent on data of detail.
    showDetail: false,
    detailLoading: false
  },
  report: {
    mainCate: 0, // 0: '工作情况', 1: '投诉分析', 2: '绩效考核'
    schoolId: 'all',

    panel_rangeIndex: [1, 3, 3], // range for each category; 1: '今日', 2: '近3天', 3: '近7天', 5: '近30天'.
    panel_startTime: ['', '', ''], // startTime of each panel
    panel_endTime: ['', '', ''], // endTime of each panel
    panel_page: [1, 1, 1],
    order: [1, 1, 1], // 1 for 'descend', 2 for 'ascend'
    orderBy: [0, 0, 0], // the param to sort the data with. 0 will be empty.

    assess_dim: 1 // 考核维度，1: '学校', 2: '客服', 3: '维修员'
  }
}
const taskModule = (state = initialTaskState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_TASK) {
    const { subModule, keyValuePair } = action
    let newState = {}
    newState = Object.assign({}, state[subModule], keyValuePair)
    // console.log(keyValuePair);
    return Object.assign({}, state, { [subModule]: newState })
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
const employeeModule = (state = initialEmployeeState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_EMPLOYEE) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
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
const notifyModule = (state = initialNotifyState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_NOTIFY) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

// 版本管理
const initialVersionState = {
  version: {
    page: 1
  }
}
const versionModule = (state = initialVersionState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_VERSION) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

/* 统计分析模块 */
const initialStatState = {
  overview: {
    schoolId: selectedSchool
  },
  charts: {
    schoolId: selectedSchool || 'all',
    timeSpan: 2,
    currentChart: 1,
    target: 1,
    compare: false,
    currentMonth: true,
    monthStr: Time.getMonthFormat(Date.parse(new Date())),
    startTime: '',
    endTime: ''
  },
  rank: {
    schoolId: selectedSchool || 'all',
    page: 1,
    currentRank: 0,
    timeSpan: 1,
    schoolName: '',
    startTime: '',
    endTime: ''
  }
}
const statModule = (state = initialStatState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_STAT) {
    const { subModule, keyValuePair } = action
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

const rootReducer = combineReducers({
  schoolModule,
  heaterModule,
  deviceModule,
  orderModule,
  fundModule,
  giftModule,
  lostModule,
  userModule,
  taskModule,
  employeeModule,
  notifyModule,
  versionModule,
  doorForbidModule,
  setSchoolList,
  statModule,
  setAuthenData,
  setRoleList,
  setTagList,
  setUserInfo,
  setGifts
})

export default rootReducer
