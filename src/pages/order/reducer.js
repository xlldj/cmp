import CONSTANTS from '../../constants'
import getDefaultSchool from '../../util/defaultSchool'
import Time from '../../util/time'
import * as ActionTypes from '../../actions'
const { ORDER_USER_TYPE_STUDENT } = CONSTANTS
let selectedSchool = getDefaultSchool()

const initialOrderState = {
  orderList: {
    tabIndex: 2, // 1 for table, 2 for statistics, 3 for analyze
    page: 1,
    schoolId: selectedSchool,
    day: 1, // 1 for today, 2 for last 7 days , 3 for last 30 days, 0 for custom select
    // userType: ORDER_USER_TYPE_STUDENT, // 'all' for unlimited, 1 for student
    userType: 'all', // 默认改为了所有
    deviceType: 'all',
    status: 'all',
    selectKey: '',
    startTime: '', // Time.get7DaysAgoStart(),
    endTime: '', // Time.getTodayEnd(),
    selectedRowIndex: '',
    selectedDetailId: '',
    showDetail: false,
    areaIds: 'all',
    buildingIds: 'all',
    floorIds: 'all',
    // below is stat related state
    stat_day: 3, // 3 for today, 4 for 7 days, 5 for 30 days,  'all' for '不限', note need to change 'all' to 6 when sending to server
    stat_dt: 1, // for devicetype of stat.
    stat_page: 1,
    stat_orderBy: -1, // for order of the stat table, default is -1, for none selected
    stat_order: -1, //  ORDER: { descend: 1, ascend: 2 }, -1 is for none selected.
    stat_buildingIds: 'all',
    stat_startTime: '',
    stat_endTime: '',
    stat_areaIds: 'all',
    stat_floorIds: 'all',
    // below is state for order analyze
    analyze_day: 1, // 1 for 'today', default setting.
    analyze_deviceType: 1,
    analyze_buildingIds: 'all',
    analyze_roomType: 'all',
    analyze_startTime: '',
    analyze_endTime: '',
    analyze_threshold: 50,
    analyze_thresholdType: 2, // 1 means minimun, 2 means maximum
    analyze_page: 1,
    analyze_order: -1,
    analyze_orderBy: '',
    analyze_warnTaskStatus: 'all', // if device has task of order warning type. 'all' for all devices
    dimension: 1
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
export const orderModule = (state = initialOrderState, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_ORDER) {
    const { subModule, keyValuePair } = action
    const newSubState = {}
    newSubState[subModule] = { ...state[subModule], ...keyValuePair }
    return { ...state, ...newSubState }
  }
  return state
}

export const initialOrderListModal = {
  loading: false,
  list: []
}
export const orderListModal = (state = initialOrderListModal, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_MODAL_ORDERLIST) {
    const { value } = action
    return { ...state, ...value }
  }
  return state
}
