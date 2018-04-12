import React from 'react'

import { Table, Button } from 'antd'
// import AjaxHandler from '../../../util/ajax'
import AjaxHandler from '../../../mock/ajax.js'
import CONSTANTS from '../../../constants'

import { checkObject } from '../../../util/checkSame'
const subModule = 'orderWarn'

const {
  DEVICETYPE,
  ORDER_STAT_DAY_UNLIMITED,
  ORDER_STAT_ORDERBYS,
  ORDER,
  PAGINATION: SIZE
} = CONSTANTS

class WarnSetView extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      listLoading: false,
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

  componentDidMount() {
    this.fetchList()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['schoolId', 'page'])) {
      return
    }

    this.fetchList(nextProps)
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
  buildWarnRule = () => {
    console.log('buildwarnrule', this.props)
    this.props.history.push('info')
  }
  render() {
    const { page } = this.props
    const { dataSource, total, loading } = this.state

    return (
      <div className="orderWarnSet">
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
            rowKey={record => record.schoolName}
            columns={this.columns}
            onChange={this.changeTable}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
        </div>

        <Button
          type="primary"
          className="buildRuleBtn"
          onClick={this.buildWarnRule}
        >
          创建预警
        </Button>
      </div>
    )
  }
}
export default WarnSetView
