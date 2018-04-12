import OrderAnalyzeView from './view.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../../actions'
const subModule = 'orderList'
const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].analyze_day,
    deviceType: state.orderModule[subModule].analyze_deviceType,
    buildingId: state.orderModule[subModule].analyze_buildingId,
    roomType: state.orderModule[subModule].analyze_roomType,
    startTime: state.orderModule[subModule].analyze_startTime,
    endTime: state.orderModule[subModule].analyze_endTime,
    threshold: state.orderModule[subModule].analyze_threshold,
    thresholdType: state.orderModule[subModule].analyze_thresholdType,
    page: state.orderModule[subModule].analyze_page
  }
}

let OrderAnalyze = withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderAnalyzeView)
)

export default OrderAnalyze
