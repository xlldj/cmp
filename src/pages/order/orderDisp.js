import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { asyncComponent } from '../component/asyncComponent'
//import OrderInfo from './orderInfo'
//import OrderTable from './orderTable'
import Bread from '../component/bread'
import { getLocal } from '../../util/storage'
import CONSTANTS from '../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../actions'
import Time from '../../util/time'
import './style/style.css'
const { ORDER_USER_TYPE_STUDENT } = CONSTANTS
const OrderList = asyncComponent(() =>
  import(/* webpackChunkName: "orderTable" */ './orderList')
)
const AbnormalOrder = asyncComponent(() =>
  import(/* webpackChunkName: "abnormalOder" */ './abnormal/abnormalContainer')
)

const breadcrumbNameMap = {
  '/list': '订单列表',
  '/list/orderInfo': '详情',
  '/abnormal': '异常订单',
  '/abnormal/detail': '详情',
  '/warning': '消费预警'
}

class OrderDisp extends React.Component {
  setStatusFororder = () => {
    this.clearStatus4orderIIlist()
  }
  clearStatus4orderIIlist = () => {
    this.getDefaultSchool()
    this.props.changeOrder('orderList', {
      tabIndex: 1,
      page: 1,
      deviceType: 'all',
      status: 'all',
      day: 1, // 1 for today
      selectKey: '',
      startTime: '',
      endTime: '',
      selectedRowIndex: '',
      selectedDetailId: '',
      showDetail: false,
      userType: ORDER_USER_TYPE_STUDENT
    })
  }
  clearStatus4orderIIabnormal = () => {
    this.getDefaultSchool()
    this.props.changeOrder('abnormal', {
      page: 1,
      deviceType: 'all',
      selectKey: '',
      startTime: Time.get7DaysAgoStart(),
      endTime: Time.getTodayEnd(),
      userType: 'all'
    })
  }
  getDefaultSchool = () => {
    const recentSchools = getLocal('recentSchools'),
      defaultSchool = getLocal('defaultSchool')
    var selectedSchool = 'all'
    if (recentSchools) {
      let recent = recentSchools.split(',')
      let schoolId = recent[0]
      selectedSchool = schoolId
    } else if (defaultSchool) {
      selectedSchool = defaultSchool
    }
    if (selectedSchool !== 'all') {
      this.props.changeOrder('orderList', { schoolId: selectedSchool })
      this.props.changeOrder('abnormal', { schoolId: selectedSchool })
    }
  }
  render() {
    const { forbiddenStatus } = this.props
    const {
      ORDER_LIST_GET,
      ABNORMAL_ORDER_GET,
      ORDER_CONSUME_WARN_GET,
      ORDER_CONSUME_ANALYZE_GET
    } = forbiddenStatus
    const hasRight2SeeOrderList = !(
      ORDER_LIST_GET &&
      ORDER_CONSUME_ANALYZE_GET &&
      ORDER_CONSUME_WARN_GET
    )
    return (
      <div>
        <div className="breadc">
          <Bread
            breadcrumbNameMap={breadcrumbNameMap}
            parent="order"
            parentName="订单管理"
            setStatusFororder={this.setStatusFororder}
            clearStatus4orderIIlist={this.clearStatus4orderIIlist}
            clearStatus4orderIIabnormal={this.clearStatus4orderIIabnormal}
          />
        </div>

        <div className="disp">
          {hasRight2SeeOrderList ? (
            <Route
              exact
              path="/order"
              render={props => <Redirect to="/order/list" />}
            />
          ) : null}
          {hasRight2SeeOrderList ? (
            <Route
              exact
              path="/order/list"
              render={props => <OrderList hide={this.props.hide} {...props} />}
            />
          ) : null}
          {ABNORMAL_ORDER_GET ? null : (
            <Route
              path="/order/abnormal"
              render={props => (
                <AbnormalOrder hide={this.props.hide} {...props} />
              )}
            />
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderDisp)
)
