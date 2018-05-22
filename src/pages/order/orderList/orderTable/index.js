import OrderTableView from './view'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../../actions'

const subModule = 'orderList'

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId,
    buildingIds: state.orderModule[subModule].buildingIds,
    day: state.orderModule[subModule].day,
    deviceType: state.orderModule[subModule].deviceType,
    status: state.orderModule[subModule].status,
    userType: state.orderModule[subModule].userType,
    selectKey: state.orderModule[subModule].selectKey,
    page: state.orderModule[subModule].page,
    startTime: state.orderModule[subModule].startTime,
    endTime: state.orderModule[subModule].endTime,
    selectedRowIndex: state.orderModule[subModule].selectedRowIndex,
    selectedDetailId: state.orderModule[subModule].selectedDetailId,
    showDetail: state.orderModule[subModule].showDetail,
    buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId,
    forbiddenStatus: state.setAuthenData.forbiddenStatus
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderTableView)
)
