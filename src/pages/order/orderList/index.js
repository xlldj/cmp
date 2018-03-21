import React from 'react'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'

import OrderTable from './orderTable'
import OrderStat from './orderStat'

import PhaseLine from '../../component/phaseLine'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
const subModule = 'orderList'

const { ORDER_LIST_TABLE, ORDER_LIST_PAGE_TABS } = CONSTANTS

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
    let { schoolId } = this.props
    if (value === schoolId) {
      return
    }
    this.props.changeOrder(subModule, { schoolId: value, page: 1 })
  }
  changePhase = v => {
    let { tabIndex } = this.props
    if (tabIndex !== v) {
      this.props.changeOrder(subModule, { tabIndex: v })
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

    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={+tabIndex}
          staticPhase={ORDER_LIST_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changePhase}
        />

        {tabIndex === ORDER_LIST_TABLE ? <OrderTable /> : <OrderStat />}
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
