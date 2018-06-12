import React from 'react'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import SchoolSelectorWithoutAll from '../../component/schoolSelectorWithoutAll'

import OrderTable from './orderTable/index.js'
import OrderStatView from './orderStatView'
import OrderAnalyze from './analyze'
import UserAnalyzeView from '../../user/userList/userAnalyze'

import PhaseLine from '../../component/phaseLine'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder, changeUser } from '../../../actions'
import isSchoolFsk from '../../../util/foxconnCheck'
const subModule = 'orderList'
const mapStateToProps1 = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].stat_day,
    deviceType: state.orderModule[subModule].stat_dt,
    page: state.orderModule[subModule].stat_page,
    orderBy: state.orderModule[subModule].stat_orderBy,
    order: state.orderModule[subModule].stat_order,
    buildingIds: state.orderModule[subModule].stat_buildingIds,
    schools: state.setSchoolList.schools,
    buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId,
    startTime: state.orderModule[subModule].stat_startTime,
    endTime: state.orderModule[subModule].stat_endTime,
    areaIds: state.orderModule[subModule].stat_areaIds,
    floorIds: state.orderModule[subModule].stat_floorIds,
    dimension: state.orderModule[subModule].dimension,
    selectKey: state.orderModule[subModule].stat_selectKey
  }
}

const OrderStat = withRouter(
  connect(mapStateToProps1, {
    changeOrder
  })(OrderStatView)
)

const mapStateToTableProps = (state, ownProps) => ({
  schoolId: state.orderModule[subModule].schoolId,

  analyze_day: state.userModule.userList.analyze_day,
  analyze_startTime: state.userModule.userList.analyze_startTime,
  analyze_endTime: state.userModule.userList.analyze_endTime,
  analyze_deviceType: state.userModule.userList.analyze_deviceType,
  analyze_selectKey: state.userModule.userList.analyze_selectKey,
  analyze_page: state.userModule.userList.analyze_page,
  buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId,
  buildingIds: state.userModule.userList.buildingIds,
  areaIds: state.userModule.userList.areaIds,
  floorIds: state.userModule.userList.floorIds,

  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  schools: state.setSchoolList.schools
})

const UserAnalyze = withRouter(
  connect(mapStateToTableProps, {
    changeUser,
    changeOrder
  })(UserAnalyzeView)
)

const {
  ORDER_LIST_TABLE,
  ORDER_LIST_STAT,
  ORDER_LIST_ANALYZE,
  ORDER_LIST_USERCONSUMPTION,
  ORDER_LIST_PAGE_ORDER_TABLE,
  ORDER_LIST_PAGE_DEVICE_CONSUMPTION_ANALYZE,
  ORDER_LIST_PAGE_DEVICE_CONSUMPTION_WARN,
  ORDER_LIST_PAGE_USER_CONSUMPTION
} = CONSTANTS

/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class OrderList extends React.Component {
  componentDidMount() {
    this.props.hide(false)
    this.resetTabIndexIfNeeded()
  }
  resetTabIndexIfNeeded = () => {
    const { forbiddenStatus } = this.props
    const {
      ORDER_LIST_GET,
      ORDER_CONSUME_ANALYZE_GET,
      ORDER_CONSUME_WARN_GET
    } = forbiddenStatus
    const hasRight2SeeOrderList = !(
      ORDER_LIST_GET &&
      ORDER_CONSUME_ANALYZE_GET &&
      ORDER_CONSUME_WARN_GET
    )
    if (hasRight2SeeOrderList) {
      // 有查看订单列表的权限，无需进一步操作
      if (!ORDER_LIST_GET) {
        return
      } else if (!ORDER_CONSUME_ANALYZE_GET) {
        this.props.changeOrder(subModule, {
          tabIndex: ORDER_LIST_STAT
        })
      } else if (!ORDER_CONSUME_WARN_GET) {
        this.props.changeOrder(subModule, {
          tabIndex: ORDER_LIST_ANALYZE
        })
      }
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    let { tabIndex, schoolId, schools } = nextProps
    let newSchoolId = schools && schools[0] && schools[0].id
    if (
      tabIndex !== this.props.tabIndex &&
      tabIndex === ORDER_LIST_ANALYZE &&
      schoolId === 'all'
    ) {
      this.props.changeOrder(subModule, {
        schoolId: newSchoolId
      })
    }
  }

  changeSchool = value => {
    /*-----value is the school id, used to fetch the school data-----*/
    /*-----does not reset other option other than searchText---------*/
    let { schoolId, tabIndex } = this.props
    if (value === schoolId) {
      return
    }
    let nextProps = { schoolId: value }
    if (tabIndex === ORDER_LIST_TABLE) {
      nextProps.page = 1
      nextProps.buildingIds = 'all'
    } else if (tabIndex === ORDER_LIST_STAT) {
      nextProps.stat_page = 1
    } else if (tabIndex === ORDER_LIST_ANALYZE) {
      nextProps.analyze_page = 1
      // also change buildings
      nextProps.analyze_buildingIds = 'all'
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
        return <OrderTable {...this.props} />
      case ORDER_LIST_STAT:
        return <OrderStat />
      case ORDER_LIST_ANALYZE:
        return <OrderAnalyze {...this.props} />
      case ORDER_LIST_USERCONSUMPTION:
        return <UserAnalyze {...this.props} />
      default:
        return <OrderTable {...this.props} />
    }
  }
  getTabs = () => {
    const { forbiddenStatus, schoolId, schools } = this.props
    const {
      ORDER_LIST_GET,
      ORDER_CONSUME_ANALYZE_GET,
      ORDER_CONSUME_WARN_GET
    } = forbiddenStatus
    const tabs = []
    if (!ORDER_LIST_GET) {
      tabs.push(ORDER_LIST_PAGE_ORDER_TABLE)
    }
    if (!ORDER_CONSUME_ANALYZE_GET) {
      tabs.push(ORDER_LIST_PAGE_DEVICE_CONSUMPTION_ANALYZE)
    }
    if (!ORDER_CONSUME_WARN_GET) {
      tabs.push(ORDER_LIST_PAGE_DEVICE_CONSUMPTION_WARN)
    }
    const isFoxconn = isSchoolFsk(schools, schoolId)
    if (isFoxconn) {
      tabs.push(ORDER_LIST_PAGE_USER_CONSUMPTION)
    }
    return tabs
  }
  render() {
    const { tabIndex, schoolId } = this.props
    const selector1 =
      tabIndex === ORDER_LIST_ANALYZE ? (
        <SchoolSelectorWithoutAll
          key="schoolSelectorWithoutAll"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      ) : (
        <SchoolSelector
          key="schoolSelector"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      )
    const tabContent = this.getContent(tabIndex)
    const tabs = this.getTabs()

    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={+tabIndex}
          staticPhase={tabs}
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
    schoolId: state.orderModule[subModule].schoolId,
    schools: state.setSchoolList.schools,
    forbiddenStatus: state.setAuthenData.forbiddenStatus
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderList)
)
