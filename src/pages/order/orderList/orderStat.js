import React from 'react'
import {
  BarChart,
  Bar,
  CartesianAxis,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
  ReferenceLine
} from 'recharts'

import { Table } from 'antd'
// import AjaxHandler from '../../../util/ajax'
import AjaxHandler from '../../../mock/ajax.js'
import CONSTANTS from '../../../constants'

import CheckSelect from '../../component/checkSelect'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
import { checkObject } from '../../../util/checkSame'
const subModule = 'orderList'

const {
  DEVICETYPE,
  ORDER_STAT_DAY_SELECT,
  ORDER_STAT_DAY_UNLIMITED,
  X_AXIS_NAME
} = CONSTANTS
const SIZE = 1

class OrderStat extends React.Component {
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
        width: '12%'
      },
      {
        title: '人均消费(元)',
        dataIndex: 'userAverage',
        width: '15%'
      },
      {
        title: '使用次数',
        dataIndex: 'orderCount',
        width: '15%'
      },
      {
        title: '次均消费',
        dataIndex: 'orderAverage',
        width: '12%'
      },
      {
        title: '总收益(元)',
        dataIndex: 'totalIncome',
        width: '15%'
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
          let user = json.data.userPoints.find(u => u.x === d.key)
          if (user) {
            d.countUser = user.y
          }
          let order = json.data.orderPoints.find(o => o.x === d.key)
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
    for (let i = 0; i < 7; ) {
      barData.push({
        key: ++i,
        x: X_AXIS_NAME[i],
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
        'page'
      ])
    ) {
      return
    }

    this.fetchList(nextProps)
    this.fetchHistogram(nextProps)
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
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeOrder(subModule, { stat_page: page })
  }
  render() {
    const { page, deviceType, day } = this.props
    const { dataSource, total, loading, barData } = this.state

    return (
      <div className="">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDER_STAT_DAY_SELECT}
                value={+day}
                onClick={this.changeRange}
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
          </div>
        </div>

        <div className="statWrapper">
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
              columns={this.columns}
              onChange={this.changePage}
              onRowClick={this.selectRow}
              rowClassName={this.setRowClass}
            />
          </div>

          <div className="barChartWrapper">
            <BarChart
              width={CONSTANTS.CHARTWIDTH}
              height={CONSTANTS.CHARTHEIGHT}
              data={barData}
              margin={{ top: 10, right: 20, bottom: 0, left: 0 }}
            >
              <XAxis
                padding={{ left: 20 }}
                axisLine={{ stroke: '#ddd' }}
                name=""
                dataKey="x"
                tickLine={false}
              />
              <YAxis
                axisLine={{ stroke: '#ddd' }}
                domain={[0, dataMax => dataMax * 1.2]}
                tickLine={false}
              />
              <Legend
                align="center"
                verticalAlign="top"
                wrapperStyle={{ top: 30 }}
              />
              <Bar
                dataKey="countUser"
                name="人数"
                isAnimationActive={true}
                legendType="rect"
                barSize={{ width: 10 }}
                fill="#6bb2f2"
              />
              <Bar dataKey="countOrder" fill="#b1dc37" />
            </BarChart>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId,
    day: state.orderModule[subModule].stat_day,
    deviceType: state.orderModule[subModule].stat_dt,
    page: state.orderModule[subModule].stat_page,
    orderBy: state.orderModule[subModule].stat_orderBy
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderStat)
)
