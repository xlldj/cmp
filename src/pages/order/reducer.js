import { merge } from 'lodash'
import CONSTANTS from '../../constants'
import getDefaultSchool from '../../util/defaultSchool'
import Time from '../../util/time'
import * as ActionTypes from '../../actions'
const { ORDER_USER_TYPE_STUDENT } = CONSTANTS
let selectedSchool = getDefaultSchool()

const initialOrderState = {
  orderList: {
    tabIndex: 1, // 1 for table, 2 for statistics
    page: 1,
    schoolId: selectedSchool,
    day: 1, // 1 for today, 2 for last 7 days , 3 for last 30 days, 0 for custom select
    userType: ORDER_USER_TYPE_STUDENT, // 'all' for unlimited, 1 for student
    deviceType: 'all',
    status: 'all',
    selectKey: '',
    startTime: '', // Time.get7DaysAgoStart(),
    endTime: '', // Time.getTodayEnd(),
    selectedRowIndex: '',
    selectedDetailId: '',
    showDetail: false,
    // below is stat related state
    stat_day: 3, // 3 for today, 4 for 7 days, 5 for 30 days,  'all' for '不限', note need to change 'all' to 6 when sending to server
    stat_dt: 1, // for devicetype of stat.
    stat_page: 1,
    stat_orderBy: -1, // for order of the stat table, default is -1, for none selected
    stat_order: -1 //  ORDER: { descend: 1, ascend: 2 }, -1 is for none selected.
  },
  orderWarn: {
    tabIndex: 2, // 1 for warn table, 2 for warn setting
    page: 1, // page of warntable
    schoolId: selectedSchool,
    warnset_page: 1
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
const orderModule = (state = initialOrderState, action) => {
  const { type } = action

  if (type === ActionTypes.CHANGE_ORDER) {
    const { subModule, keyValuePair } = action
    // return { ...state, ...{ [subModule]: keyValuePair } }
    return merge({}, state, { [subModule]: keyValuePair })
  }
  return state
}

export default orderModule
