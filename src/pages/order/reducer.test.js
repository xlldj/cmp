import orderModule from './reducer.js'
let selectedSchool = 1
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
    stat_day: 3, // 3 for today, 4 for 7 days, 5 for 30 days,  'all' for '不限', note need to change 'all' to 6 when sending to server
    stat_dt: 1, // for devicetype of stat.
    stat_page: 1,
    stat_orderBy: -1, // for order of the stat table, default is -1, for none selected
    stat_order: -1 //  ORDER: { descend: 1, ascend: 2 }, -1 is for none selected.
  },
  abnormal: {
    page: 1,
    schoolId: selectedSchool,
    deviceType: 'all',
    selectKey: '',
    startTime: '',
    endTime: '',
    userType: 'all'
  }
}
test('initial state', () => {
  expect(orderModule(initialOrderState, {}).orderList.tabIndex).toBe(2)
})
test('change tabIndex', () => {
  expect(
    orderModule(initialOrderState, {
      type: 'CHANGE_ORDER',
      subModule: 'orderList',
      keyValuePair: { tabIndex: 1 }
    }).orderList.tabIndex
  ).toBe(1)
})
test('change selectedSchool', () => {
  expect(
    orderModule(initialOrderState, {
      type: 'CHANGE_ORDER',
      subModule: 'orderList',
      keyValuePair: { selectedSchool: 2 }
    }).orderList.selectedSchool
  ).toBe(2)
})
