import { merge } from 'lodash'
import getDefaultSchool from '../../util/defaultSchool'
import Time from '../../util/time'
import * as ActionTypes from '../../actions'
let selectedSchool = getDefaultSchool()

const initialOrderState = {
  orderList: {
    tabIndex: 2, // 1 for table, 2 for statistics
    page: 1,
    schoolId: selectedSchool,
    day: 1, // 1 for today, 2 for last 7 days , 3 for last 30 days, 0 for custom select
    userType: 'all',
    deviceType: 'all',
    status: 'all',
    selectKey: '',
    startTime: '', // Time.get7DaysAgoStart(),
    endTime: '', // Time.getTodayEnd(),
    selectedRowIndex: '',
    selectedDetailId: '',
    showDetail: false,
    // below is stat related state
    stat_day: 1, // 1 for today, 'all' for '不限',
    stat_dt: 1, // for devicetype of stat.
    stat_page: 1
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
