import OrderAnalyzeView from './view.js'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../../actions'
const subModule = 'orderList'
const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].stat_day,
    deviceType: state.orderModule[subModule].stat_dt,
    page: state.orderModule[subModule].stat_page,
    orderBy: state.orderModule[subModule].stat_orderBy,
    order: state.orderModule[subModule].stat_order
  }
}

let OrderAnalyze = withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderAnalyzeView)
)

export default OrderAnalyze
