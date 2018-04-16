import React from 'react'

import { Table } from 'antd'
import AjaxHandler from '../../../util/ajax'
// import AjaxHandler from '../../../mock/ajax.js'
import CONSTANTS from '../../../constants'

import QueryLine from '../../component/queryLine'
import CheckSelect from '../../component/checkSelect'
import OrderBarChart from './orderBarChart'

import { checkObject } from '../../../util/checkSame'
const subModule = 'orderList'

const {
  DEVICETYPE,
  ORDER_STAT_DAY_SELECT,
  ORDER_STAT_DAY_UNLIMITED,
  X_AXIS_NAME,
  ORDER_STAT_ORDERBYS,
  ORDER,
  PAGINATION: SIZE
} = CONSTANTS

class OrderStatView extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      BarChart: this.getBarData(),
      listLoading: false,
      histogramLoading: false,
      loading: false,
      total: 0
    }

    this.columns = [
      {
        title: '学校',
        dataIndex: 'schoolName'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
        width: '15%',
        render: (text, record, index) => DEVICETYPE[record.deviceType]
      },
      {
        title: '使用人数',
        dataIndex: 'userCount',
        width: '12%',
        sorter: true
      },
      {
        title: '人均消费(元)',
        dataIndex: 'userAverage',
        width: '15%',
        sorter: true
      },
      {
        title: '使用次数',
        dataIndex: 'orderCount',
        width: '15%',
        sorter: true
      },
      {
        title: '次均消费',
        dataIndex: 'orderAverage',
        width: '12%',
        sorter: true
      },
      {
        title: '总收益(元)',
        dataIndex: 'totalIncome',
        width: '15%',
        sorter: true
      }
    ]
  }
  fetchList = props => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
    }
    props = props || this.props

    let { page, schoolId, deviceType, day, order, orderBy } = props
    const body = {
      page: page,
      size: SIZE,
      day
    }
    if (day === 'all') {
      body.day = ORDER_STAT_DAY_UNLIMITED
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (order !== -1) {
      body.order = parseInt(order, 10)
    }
    if (orderBy !== -1) {
      body.orderBy = parseInt(orderBy, 10)
    }

    let resource = '/api/order/statistic/list'
    const cb = json => {
      let nextState = { listLoading: false }
      if (!this.state.histogramLoading) {
        nextState.loading = false
      }
      if (json.data) {
        nextState.dataSource = json.data.list
        nextState.total = json.data.total
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchHistogram = props => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
    }
    props = props || this.props

    let { page, schoolId, deviceType, day } = props
    const body = {
      page: page,
      size: SIZE,
      day
    }
    if (day === 'all') {
      body.day = ORDER_STAT_DAY_UNLIMITED
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }

    let resource = '/api/order/statistic/histogram'
    const cb = json => {
      let nextState = { histogramLoading: false }
      if (!this.state.listLoading) {
        nextState.loading = false
      }
      if (json.data) {
        let barData = this.getBarData()
        barData.forEach(d => {
          let user = json.data.userPoints.find(u => u.x === d.key.toString())
          if (user) {
            d.countUser = user.y
          }
          let order = json.data.orderPoints.find(o => o.x === d.key.toString())
          if (order) {
            d.countOrder = order.y
          }
        })
        nextState.barData = barData
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  getBarData = () => {
    let barData = []
    for (let i = 0; i < 8; ) {
      barData.push({
        key: i,
        x: X_AXIS_NAME[i++],
        countUser: 0,
        countOrder: 0
      })
    }
    return barData
  }

  componentDidMount() {
    this.fetchList()
    this.fetchHistogram()
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'page',
        'order',
        'orderBy'
      ])
    ) {
      return
    }

    this.fetchList(nextProps)
    // if these options are same, doesn't need to refetch histogram.
    if (checkObject(this.props, nextProps, ['day', 'schoolId', 'deviceType'])) {
      return
    }
    this.fetchHistogram(nextProps)
  }
  changeRange = key => {
    this.props.changeOrder(subModule, {
      stat_day: key === 'all' ? 'all' : +key
    })
  }
  changeDevice = value => {
    let { deviceType } = this.props
    if (value === deviceType) {
      return
    }
    this.props.changeOrder(subModule, { stat_dt: value, page: 1 })
  }
  back = () => {
    this.props.history.goBack()
  }
  changeTable = (pageObj, filter, sorter) => {
    // page and sorter will not change at the same time
    let page = pageObj.current
    if (page !== this.props.page) {
      return this.props.changeOrder(subModule, { stat_page: page })
    }

    let { order, field } = sorter
    if (!order) {
      // change to not order, set all to -1
      return this.props.changeOrder(subModule, {
        stat_page: 1,
        stat_order: -1,
        stat_orderBy: -1
      })
    }
    // must not be empty
    this.props.changeOrder(subModule, {
      stat_page: 1,
      stat_order: ORDER[order],
      stat_orderBy: ORDER_STAT_ORDERBYS[field]
    })
  }
  render() {
    const { page, deviceType, day } = this.props
    const { dataSource, total, loading, barData } = this.state

    return (
      <div className="orderStat">
        <div className="queryPanel">
          <QueryLine labelName="时间筛选">
            <CheckSelect
              allOptTitle="不限"
              allOptValue="all"
              options={ORDER_STAT_DAY_SELECT}
              value={day}
              onClick={this.changeRange}
            />
          </QueryLine>
          <QueryLine labelName="设备类型">
            <CheckSelect
              options={DEVICETYPE}
              value={deviceType}
              onClick={this.changeDevice}
            />
          </QueryLine>
        </div>

        <div className="statWrapper">
          <div className="tableList">
            <Table
              bordered
              loading={loading}
              pagination={{
                pageSize: SIZE,
                current: page,
                total: total,
                showQuickJumper: true
              }}
              dataSource={dataSource}
              rowKey={record => record.schoolName}
              columns={this.columns}
              onChange={this.changeTable}
              onRowClick={this.selectRow}
              rowClassName={this.setRowClass}
            />
          </div>

          <OrderBarChart data={barData} />
        </div>
      </div>
    )
  }
}
export default OrderStatView
