import tableHoc from '../../../../public/tableHoc'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDoorForbid, fetchDoorForbidList } from '../../../../actions'

import { checkObject } from '../../../../util/checkSame'
import BackDormTable from './ui'
import CONSTANTS from '../../../../constants'

const {
  DOORFORBID_PAGE_TAB_RECORD,
  DOORFORBID_PAGE_TAB_REPORT,
  DOORFORBID_PAGE_TAB_TIME,
  PAGINATION: SIZE,
  DOORFORBID_DAYTYPE
} = CONSTANTS

const subModule = 'backDormRecord'

const handleDoorForbidList = (newProps, oldProps, thisObj) => {
  let { schoolId, tabIndex, buildingId } = newProps
  const body = {}
  if (tabIndex === DOORFORBID_PAGE_TAB_RECORD) {
    if (
      checkObject(newProps, oldProps, [
        'schoolId',
        'buildingId',
        'tabIndex',
        'record_page',
        'record_timeType',
        'record_sexType',
        'record_backDormStatus',
        'record_startTime',
        'record_endTime',
        'record_searchKey',
        'detail_unbindCount'
      ])
    ) {
      return
    }
    //start backDorm_record request
    let {
      record_page,
      record_timeType,
      record_sexType,
      record_backDormStatus,
      record_startTime,
      record_endTime,
      record_searchKey
    } = newProps

    body.page = record_page

    if (record_timeType !== 1) {
      body.dayType = DOORFORBID_DAYTYPE[record_timeType]
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
  } else if (tabIndex === DOORFORBID_PAGE_TAB_REPORT) {
    if (
      checkObject(newProps, oldProps, [
        'schoolId',
        'buildingId',
        'tabIndex',
        'report_page',
        'report_timeType',
        'report_sexType',
        'report_searchKey',
        'report_orderBy',
        'report_order'
      ])
    ) {
      return
    }
    //start backDorm_report request
    let {
      report_page,
      report_timeType,
      report_sexType,
      report_searchKey,
      report_orderBy,
      report_order
    } = newProps

    body.page = report_page
    if (report_order !== 0 && report_orderBy !== '') {
      body.orderBy = report_orderBy
      body.order = report_order
    }

    body.dayType = report_timeType === 1 ? 3 : 5

    if (report_sexType !== 1) {
      body.sex = report_sexType - 1
    }

    if (report_searchKey !== '') {
      body.selectKey = report_searchKey
    }
  } else if (tabIndex === DOORFORBID_PAGE_TAB_TIME) {
    if (
      checkObject(newProps, oldProps, [
        'schoolId',
        'buildingId',
        'tabIndex',
        'timeSetting_page'
      ])
    ) {
      return
    }
    //start backDorm_timeSetting request
    let { timeSetting_page } = newProps
    body.page = timeSetting_page
  }

  if (buildingId !== 'all') {
    body.buildingId = buildingId
  }
  if (schoolId !== 'all') {
    body.schoolId = parseInt(schoolId, 10)
  }
  body.size = SIZE
  newProps.fetchDoorForbidList(tabIndex, body, subModule)
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

  report_page: state.doorForbidModule[subModule].report_page,
  report_searchKey: state.doorForbidModule[subModule].report_searchKey,
  report_timeType: state.doorForbidModule[subModule].report_timeType,
  report_sexType: state.doorForbidModule[subModule].report_sexType,
  report_orderBy: state.doorForbidModule[subModule].report_orderBy,
  report_order: state.doorForbidModule[subModule].report_order,
  timeSetting_page: state.doorForbidModule[subModule].timeSetting_page,

  detail_show: state.doorForbidModule[subModule].detail_show,
  detail_unbindCount: state.doorForbidModule[subModule].detail_unbindCount
})
export default withRouter(
  connect(mapStateToProps, {
    changeDoorForbid,
    fetchDoorForbidList
  })(tableHoc(BackDormTable, handleDoorForbidList))
)
