import React from 'react'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'

import OrderTable from './orderTable'
import OrderStatView from './orderStatView'
import OrderAnalyze from './analyze'

import PhaseLine from '../../component/phaseLine'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
const subModule = 'orderList'
const mapStateToProps1 = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].stat_day,
    deviceType: state.orderModule[subModule].stat_dt,
    page: state.orderModule[subModule].stat_page,
    orderBy: state.orderModule[subModule].stat_orderBy,
    order: state.orderModule[subModule].stat_order
  }
}

let OrderStat = withRouter(
  connect(mapStateToProps1, {
    changeOrder
  })(OrderStatView)
)
const {
  ORDER_LIST_TABLE,
  ORDER_LIST_STAT,
  ORDER_LIST_ANALYZE,
  ORDER_LIST_PAGE_TABS
} = CONSTANTS

/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class OrderList extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  changeSchool = value => {
    /*-----value is the school id, used to fetch the school data-----*/
    /*-----does not reset other option other than searchText---------*/
    let { schoolId, tabIndex } = this.props
    if (value === schoolId) {
      return
    }
    let nextProps = { schoolId: value }
    if (tabIndex === 1) {
      nextProps.page = 1
    } else {
      nextProps.stat_page = 1
    }
    this.props.changeOrder(subModule, nextProps)
  }
  changePhase = v => {
    console.log(v)
    let { tabIndex } = this.props
    if (tabIndex !== v) {
      this.props.changeOrder(subModule, { tabIndex: v })
    }
  }
  getContent = tabIndex => {
    switch (tabIndex) {
      case ORDER_LIST_TABLE:
        return <OrderTable />
      case ORDER_LIST_STAT:
        return <OrderStat />
      case ORDER_LIST_ANALYZE:
        return <OrderAnalyze />
      default:
        return <OrderTable />
    }
  }
  render() {
    const { tabIndex, schoolId } = this.props
    const selector1 = (
      <SchoolSelector
        key="schoolSelector"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const tabContent = this.getContent(tabIndex)

    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={+tabIndex}
          staticPhase={ORDER_LIST_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changePhase}
        />

        {tabContent}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderList)
)
