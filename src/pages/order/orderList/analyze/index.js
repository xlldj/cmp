import OrderAnalyzeView from './view.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeOrder,
  setSchoolList,
  fetchBuildings,
  changeTask
} from '../../../../actions'
const subModule = 'orderList'
const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].analyze_day,
    deviceType: state.orderModule[subModule].analyze_deviceType,
    buildingIds: state.orderModule[subModule].analyze_buildingIds,
    roomType: state.orderModule[subModule].analyze_roomType,
    startTime: state.orderModule[subModule].analyze_startTime,
    endTime: state.orderModule[subModule].analyze_endTime,
    threshold: state.orderModule[subModule].analyze_threshold,
    thresholdType: state.orderModule[subModule].analyze_thresholdType,
    page: state.orderModule[subModule].analyze_page,
    order: state.orderModule[subModule].analyze_order,
    warnTaskStatus: state.orderModule[subModule].analyze_warnTaskStatus,
    schools: state.setSchoolList.schools,
    buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId
  }
}

let OrderAnalyze = withRouter(
  connect(mapStateToProps, {
    changeOrder,
    setSchoolList,
    fetchBuildings,
    changeTask
  })(OrderAnalyzeView)
)

export default OrderAnalyze
