import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Badge, Button } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import SearchLine from '../../component/searchLine'
import DeviceSelector from '../../component/deviceSelector'
import SchoolSelector from '../../component/schoolSelector'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
import { checkObject } from '../../../util/checkSame'
const subModule = 'abnormal'

const SIZE = CONSTANTS.PAGINATION

const typeName = CONSTANTS.DEVICETYPE
const BACKTITLE = {
  fromUser: '返回用户详情',
  fromDevice: '返回设备详情'
}
/* state explanation */
/* subStartTime: 传给字组件searchLine的起始时间，因为要区分propTypes.startTime和组件弹窗中的起始时间 */
/* subStartTime: 传给字组件searchLine的截止时间 */
class AbnormalTable extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    deviceType: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      searchingText: '',
      subStartTime: this.props.startTime,
      subEndTime: this.props.endTime
    }
    this.columns = [
      {
        title: '订单号',
        dataIndex: 'orderNo',
        width: '20%',
        className: 'firstCol'
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
        render: (text, record, index) => typeName[record.deviceType]
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
        render: (text, record, index) => (
          <Badge status="default" text="已退单" />
        )
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
              <Link to={`/order/abnormal/detail/:${record.id}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
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
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)

    let {
      page,
      schoolId,
      deviceType,
      selectKey,
      startTime,
      endTime
    } = this.props
    const body = {
      page: page,
      size: SIZE,
      status: 5 // fetch abnormal order only
    }
    if (startTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'schoolId',
        'deviceType',
        'selectKey',
        'page',
        'startTime',
        'endTime'
      ])
    ) {
      return
    }
    let {
      schoolId,
      deviceType,
      selectKey,
      page,
      startTime,
      endTime
    } = nextProps
    const body = {
      page: page,
      size: SIZE,
      status: 5
    }

    if (startTime) {
      body.startTime = startTime
      body.timeQueryType = 1 // 选择create_time
      body.endTime = endTime
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
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
  changeRange = (dates, dateStrings) => {
    let timeStamps = dates.map(r => r.valueOf())
    this.setState({
      subStartTime: timeStamps[0],
      subEndTime: timeStamps[1]
    })
  }
  confirmRange = time => {
    let timeStamps = time.map(r => r.valueOf())
    this.props.changeOrder(subModule, {
      startTime: timeStamps[0],
      endTime: timeStamps[1],
      page: 1
    })

    /* the flag to hint if confirm button is clicked */
    /* if use this.state.confirmed, the 'onOpenChange' handler will not get the right flag */
    this.confirmed = true
  }
  onOpenChange = open => {
    if (open) {
      // set default time
    } else {
      if (!this.confirmed) {
        // close range picker and did not confirm, set the time to props
        this.setState({
          subStartTime: this.props.startTime,
          subEndTime: this.props.endTime
        })
      }
      this.confirmed = false
    }
  }
  render() {
    const { schoolId, deviceType } = this.props
    const { dataSource, total, loading, subStartTime, subEndTime } = this.state
    const { state } = this.props.location

    return (
      <div className="contentArea">
        <SearchLine
          showTimeChoose={true}
          startTime={subStartTime}
          endTime={subEndTime}
          changeRange={this.changeRange}
          confirm={this.confirmRange}
          onOpenChange={this.onOpenChange}
          searchInputText="宿舍／订单号"
          searchingText={this.state.searchingText}
          pressEnter={this.pressEnter}
          changeSearch={this.changeSearch}
          selector1={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          selector2={
            <DeviceSelector
              selectedDevice={deviceType}
              changeDevice={this.changeDevice}
            />
          }
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{
              pageSize: SIZE,
              current: this.props.page,
              total: total
            }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
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
    schoolId: state.orderModule[subModule].schoolId,
    deviceType: state.orderModule[subModule].deviceType,
    selectKey: state.orderModule[subModule].selectKey,
    page: state.orderModule[subModule].page,
    startTime: state.orderModule[subModule].startTime,
    endTime: state.orderModule[subModule].endTime
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(AbnormalTable)
)
