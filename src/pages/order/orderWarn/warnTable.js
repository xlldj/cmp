import React from 'react'

import { Table, Badge, Button } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import selectedImg from '../../assets/selected.png'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
import { checkObject } from '../../../util/checkSame'
const subModule = 'orderWarn'

const { PAGINATION: SIZE, DEVICETYPE } = CONSTANTS

class WarnTable extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0
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
    this.fetchData()
  }

  componentWillReceiveProps(nextProps) {
    // handle close detail click event
    if (!nextProps.showDetail && this.props.showDetail) {
      // closed detail
      this.root.removeEventListener('click', this.closeDetail)
    } else if (!this.props.showDetail && nextProps.showDetail) {
      this.root.addEventListener('click', this.closeDetail, false)
    }
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
    let { startTime, endTime, selectKey } = nextProps
    const { showClearBtn } = this.state

    const nextState = {}
    if (startTime !== this.state.startTime) {
      nextState.startTime = startTime
      nextState.endTime = endTime
    }
    if (selectKey !== this.state.searchingText) {
      console.log(selectKey, showClearBtn)
      nextState.searchingText = selectKey
    }
    this.setState(nextState)
    this.fetchData(nextProps)
  }

  back = () => {
    this.props.history.goBack()
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeOrder(subModule, { page: page })
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
    const { page, selectedRowIndex } = this.props
    const { dataSource, total, loading } = this.state

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
        className: 'shalowRed',
        render: (text, record, index) => {
          if (record.status !== 1) {
            return `${record.consume}` || '暂无'
          } else if (record.prepay) {
            return `${record.prepay}`
          }
        }
      }
    ]
    return (
      <div className="">
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
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId,
    page: state.orderModule[subModule].page
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(WarnTable)
)
