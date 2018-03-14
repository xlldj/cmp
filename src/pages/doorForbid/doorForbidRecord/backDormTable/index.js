import tableHoc from '../../../../public/tableHoc'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid, fetchDoorForbidList } from '../../../../actions'

import { checkObject } from '../../../../util/checkSame'
import BackDormTable from './ui'
import CONSTANTS from '../../../../constants/doorForbid'

const subModule = 'backDormRecord'

const dayTypeMap = {
  1: 0,
  2: 1,
  3: 9,
  4: 3,
  5: 5
}

const handleDoorForbidList = (newProps, oldProps, thisObj) => {
  if (checkObject(newProps, oldProps, ['page', 'schoolId', 'tabIndex'])) {
    return
  }
  let { schoolId, page, tabIndex, buildingId } = newProps
  const body = {}
  if (tabIndex === CONSTANTS.DOORFORBID_PAGE_TAB_RECORD) {
    //start backDorm_record request
    let {
      record_timeType,
      record_sexType,
      record_backDormStatus,
      record_startTime,
      record_endTime,
      record_searchKey
    } = newProps
    if (record_timeType !== 1) {
      body.dayType = dayTypeMap[record_timeType]
    }
    if (record_sexType !== 1) {
      body.sex = record_sexType - 1
    }
    if (record_backDormStatus !== 1) {
      body.returnStatus = record_backDormStatus - 1
    }
    if (record_startTime !== '' && record_endTime !== '') {
      body.startTime = record_startTime
      body.endTime = record_endTime
    }

    if (record_searchKey !== '') {
      body.selectKey = record_searchKey
    }
  } else if (tabIndex === CONSTANTS.DOORFORBID_PAGE_TAB_REPORT) {
    //start backDorm_report request
    let {
      report_timeType,
      report_sexType,
      report_startTime,
      report_endTime,
      report_searchKey
    } = newProps
    if (report_timeType !== 1) {
      body.dayType = report_timeType === 1 ? 3 : 5
    }
    if (report_sexType !== 1) {
      body.sex = report_sexType - 1
    }

    if (report_startTime !== '' && report_endTime !== '') {
      body.startTime = report_startTime
      body.endTime = report_endTime
    }

    if (report_searchKey !== '') {
      body.selectKey = report_searchKey
    }
  } else if (tabIndex === CONSTANTS.DOORFORBID_PAGE_TAB_TIME) {
    //start backDorm_timeSetting request
  }

  if (buildingId !== 'all') {
    body.buildingId = buildingId
  }
  if (schoolId !== 'all') {
    body.schoolId = schoolId
  }
  body.tabIndex = tabIndex
  body.page = page
  body.size = CONSTANTS.PAGINATION
  newProps.fetchDoorForbidList(body, subModule)
}

const mapStateToProps = state => ({
  tabIndex: state.doorForbidModule[subModule].tabIndex,
  schoolId: state.doorForbidModule[subModule].schoolId,
  buildingId: state.doorForbidModule[subModule].buildingId,
  buildingMap: state.doorForbidModule[subModule].buildingMap,

  record_startTime: state.doorForbidModule[subModule].record_startTime,
  record_endTime: state.doorForbidModule[subModule].record_endTime,
  record_page: state.doorForbidModule[subModule].record_page,
  record_searchKey: state.doorForbidModule[subModule].record_searchKey,
  record_timeType: state.doorForbidModule[subModule].record_timeType,
  record_sexType: state.doorForbidModule[subModule].record_sexType,
  record_backDormStatus:
    state.doorForbidModule[subModule].record_backDormStatus,

  report_startTime: state.doorForbidModule[subModule].report_startTime,
  report_endTime: state.doorForbidModule[subModule].report_endTime,
  report_page: state.doorForbidModule[subModule].report_page,
  report_searchKey: state.doorForbidModule[subModule].report_searchKey,
  report_timeType: state.doorForbidModule[subModule].report_timeType,
  report_sexType: state.doorForbidModule[subModule].report_sexType,

  timeSetting_page: state.doorForbidModule[subModule].timeSetting_page,

  detail_show: state.doorForbidModule[subModule].detail_show
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid,
    fetchDoorForbidList
  })(tableHoc(BackDormTable, handleDoorForbidList))
)
