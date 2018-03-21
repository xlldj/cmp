import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Badge, Button } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import selectedImg from '../../assets/selected.png'

import PhaseLine from '../../component/phaseLine'
import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'
import OrderDetail from './orderInfo'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
import { checkObject } from '../../../util/checkSame'
const subModule = 'orderList'

const {
  PAGINATION: SIZE,
  DEVICETYPE,
  ORDER_LIST_PAGE_TABS,
  ORDER_DAY_SELECT,
  ORDERUSERTYPES,
  ORDERSTATUS
} = CONSTANTS

const BACKTITLE = {
  fromUser: '返回用户详情',
  fromDevice: '返回设备详情',
  fromTask: '返回工单'
}
/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class OrderTable extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      totalIncome: 0,
      totalChargeback: 0,
      searchingText: '',
      subStartTime: this.props.startTime,
      subEndTime: this.props.endTime
    }
  }
  fetchData = props => {
    this.setState({
      loading: true
    })
    props = props || this.props
    let { state } = props.history.location

    let {
      page,
      schoolId,
      deviceType,
      status,
      selectKey,
      startTime,
      endTime,
      userType,
      day
    } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    } else {
      body.day = parseInt(day, 10)
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (status !== 'all') {
      body.status = parseInt(status, 10)
    } else {
      body.statusList = [1, 2, 4]
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (userType && userType !== 'all') {
      body.userType = parseInt(userType, 10)
    }
    if (state) {
      if (state.path === 'fromDevice') {
        body.residenceId = state.id
        body.deviceType = state.deviceType
      } else if (state.path === 'fromUser') {
        body.userId = state.id
      } else if (state.path === 'fromTask') {
        if (state.userId) {
          body.userId = state.userId
        } else if (state.deviceType) {
          body.residenceId = state.residenceId
          body.deviceType = state.deviceType
        }
      }
      delete body.schoolId
    }

    let resource = '/api/order/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        this.setState(nextState)
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          json.data.orders &&
            json.data.orders.forEach((r, i) => {
              r.paymentType = r.paymentType && r.paymentType.toString()
            })
          nextState.dataSource = json.data.orders
          nextState.total = json.data.total
          nextState.totalIncome = json.data.totalIncome || 0
          nextState.totalChargeback = json.data.totalChargeback || 0
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)

    this.fetchData()
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'status',
        'selectKey',
        'page',
        'startTime',
        'endTime',
        'userType'
      ])
    ) {
      return
    }
    let { startTime, endTime } = nextProps

    if (startTime !== this.state.startTime) {
      this.setState({
        startTime,
        endTime
      })
    }
    this.fetchData(nextProps)
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
  changeDevice = value => {
    let { deviceType } = this.props
    if (value === deviceType) {
      return
    }
    this.props.changeOrder(subModule, { deviceType: value, page: 1 })
  }
  changeStatus = value => {
    let { status } = this.props
    if (value === status) {
      return
    }
    this.props.changeOrder(subModule, { status: value, page: 1 })
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let { selectKey } = this.props
    let searchingText = this.state.searchingText.trim()
    if (selectKey !== searchingText) {
      this.props.changeOrder(subModule, { selectKey: searchingText, page: 1 })
    }
  }
  back = () => {
    this.props.history.goBack()
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeOrder(subModule, { page: page })
  }
  changeUserType = v => {
    let { userType } = this.props
    if (userType === v) {
      return
    }
    this.props.changeOrder(subModule, { userType: v, page: 1 })
  }
  changeStartTime = time => {
    this.setState({
      startTime: time
    })
  }
  changeEndTime = time => {
    this.setState({
      endTime: time
    })
  }
  confirmTimeRange = () => {
    let { startTime, endTime } = this.state
    if (!startTime || !endTime) {
      return
    }
    this.props.changeOrder(subModule, {
      startTime: startTime,
      endTime: endTime,
      page: 1,
      day: 0
    })
  }
  selectRow = (record, index, event) => {
    let { dataSource } = this.state
    // let page = panel_page[main_phase]
    let id = dataSource[index] && dataSource[index].id
    this.props.changeOrder(subModule, {
      selectedRowIndex: index,
      showDetail: true,
      selectedDetailId: id
    })
  }

  setRowClass = (record, index) => {
    let { selectedRowIndex } = this.props
    if (index === selectedRowIndex) {
      return 'selectedRow'
    } else {
      return ''
    }
  }
  render() {
    const {
      page,
      schoolId,
      deviceType,
      status,
      userType,
      tabIndex,
      day,
      selectedRowIndex,
      showDetail,
      selectedDetailId
    } = this.props
    const {
      dataSource,
      total,
      totalIncome,
      totalChargeback,
      loading,
      startTime,
      endTime
    } = this.state
    const { state } = this.props.location

    const selector1 = (
      <SchoolSelector
        key="schoolSelector"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )

    const columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        width: '20%',
        className: 'firstCol selectedHintWraper',
        render: (text, record, index) => (
          <span className="">
            {index === selectedRowIndex ? (
              <img src={selectedImg} alt="" className="selectedImg" />
            ) : null}
            {text}
          </span>
        )
      },
      {
        title: '用户',
        dataIndex: 'username',
        width: '10%'
      },
      {
        title: '使用设备',
        dataIndex: 'deviceType',
        width: '7%',
        render: (text, record, index) => DEVICETYPE[record.deviceType]
      },
      {
        title: '所在学校',
        dataIndex: 'schoolName'
      },
      {
        title: '设备地址',
        dataIndex: 'location',
        width: '10%'
      },
      {
        title: '开始时间',
        dataIndex: 'createTime',
        width: '10%',
        render: (text, record, index) => {
          return Time.getTimeStr(record.createTime)
        }
      },
      {
        title: '结束时间',
        dataIndex: 'finishTime',
        width: '10%',
        render: (text, record, index) => {
          return record.finishTime ? Time.getTimeStr(record.finishTime) : ''
        }
      },
      {
        title: '使用状态',
        dataIndex: 'status',
        width: '10%',
        render: (text, record, index) => {
          switch (record.status) {
            case 1:
              return <Badge status="warning" text="使用中" />
            case 2:
              return <Badge status="success" text="使用结束" />
            case 4:
              return <Badge status="default" text="已退单" />
            case 3:
              return <Badge status="warning" text="异常" />
            default:
              return <Badge status="warning" text="异常" />
          }
        }
      },
      {
        title: '消费金额',
        dataIndex: 'paymentType',
        width: '8%',
        className: 'shalowRed',
        render: (text, record, index) => {
          if (record.status !== 1) {
            return `${record.consume}` || '暂无'
          } else if (record.prepay) {
            return `${record.prepay}`
          }
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/order/list/orderInfo/:${record.id}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={+tabIndex}
          staticPhase={ORDER_LIST_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changePhase}
        />

        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={ORDER_DAY_SELECT}
                value={+day}
                onClick={this.changeRange}
              />
              <RangeSelect
                className="seperator"
                startTime={startTime}
                endTime={endTime}
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>用户类型:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDERUSERTYPES}
                value={userType}
                onClick={this.changeUserType}
              />
            </div>
          </div>
          <div className="queryLine">
            <div className="block">
              <span>设备类型:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={DEVICETYPE}
                value={deviceType}
                onClick={this.changeDevice}
              />
            </div>
            <div className="block">
              <SearchInput
                placeholder="宿舍/订单号/手机号"
                searchingText={this.state.searchingText}
                pressEnter={this.pressEnter}
                changeSearch={this.changeSearch}
              />
            </div>
          </div>
          <div className="queryLine">
            <div className="block">
              <span>使用状态:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDERSTATUS}
                value={status}
                onClick={this.changeStatus}
              />
            </div>
            <div className="block">
              <span className="seperator">
                总收益(使用结束): {totalIncome}元
              </span>
              <span>已退单: {totalChargeback}元</span>
            </div>
          </div>
        </div>

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            pagination={{
              pageSize: SIZE,
              current: page,
              total: total
            }}
            dataSource={dataSource}
            rowKey={record => record.id}
            columns={columns}
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>

        {showDetail ? (
          <div ref="detailWrapper">
            <OrderDetail id={selectedDetailId} />
          </div>
        ) : null}
        {state ? (
          <div className="btnRight">
            <Button onClick={this.back}>{BACKTITLE[state.path]}</Button>
          </div>
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId,
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
    showDetail: state.orderModule[subModule].showDetail
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderTable)
)
