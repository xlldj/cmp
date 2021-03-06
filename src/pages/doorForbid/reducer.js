import getDefaultSchool from '../../util/defaultSchool'
import * as ActionTypes from './action'
let selectedSchool = getDefaultSchool()
//数据初始化 存储
const initialState = {
  backDormRecord: {
    tabIndex: 1, // 1 for '记录', 2 for  '报表', 3时间设置
    schoolId: selectedSchool,
    buildingId: 'all', //default all 所有楼栋
    buildingMap: {},
    record_loading: false,
    record_total: 0,
    record_startTime: '',
    record_endTime: '',
    record_page: 1,
    record_dataSource: [],
    record_searchKey: '',
    record_backDormStatus: 1, //归寝状态
    record_timeType: 1,
    record_sexType: 1,
    record_selectedRowIndex: -1,

    report_loading: false,
    report_total: 0,
    report_page: 1,
    report_dataSource: [],
    report_searchKey: '',
    report_timeType: 1,
    report_sexType: 1,
    report_orderBy: '',
    report_order: 0, //1 asc 2 desc
    report_late: 0,
    report_normal: 0,
    report_notReturn: 0,

    timeSetting_loading: false,
    timeSetting_total: 0,
    timeSetting_page: 1,
    timeSetting_dataSource: [],

    detail_show: false,
    detail_recordInfo: {},
    detail_loading: false,
    detail_total: 0,
    detail_startTime: '',
    detail_endTime: '',
    detail_page: 1,
    detail_dataSource: [],
    detail_timeType: 1,
    detail_formType: 1,
    detail_unbindCount: 1,
    timeRange_dataSource: []
  }
}
const doorForbidModule = (state = initialState, action) => {
  const { type } = action
  if (type === ActionTypes.CHANGE_DOORFORBID) {
    const { subModule, keyValuePair } = action
    let newSubModule = { ...state[subModule], ...keyValuePair }
    var newState = { ...state, ...{ [subModule]: newSubModule } }
    return newState
  }
  return state
}

export default doorForbidModule
