import React from 'react'

import { Table, Button } from 'antd'
import AjaxHandler from '../../../util/ajax'
// import AjaxHandler from '../../../mock/ajax.js'
import CONSTANTS from '../../../constants'

import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import CheckSelect from '../../component/checkSelect'
import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
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
  PAGINATION: SIZE,
  DEVICE_TYPE_HEATER
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
      total: 0,
      isFushikang: false,
      showBuildingSelect: false
    }
  }
  fetchList = props => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
    }
    props = props || this.props

    let { page, schoolId, deviceType, day, order, orderBy, buildingIds } = props
    const body = {
      page: page,
      size: SIZE,
      day
    }
    if (day === 'all') {
      body.day = ORDER_STAT_DAY_UNLIMITED
    }
    if (buildingIds !== 'all') {
      body.buildingIds = buildingIds
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
    this.checkSchoolFsk()
  }
  //检查选择学校是否为富士康
  checkSchoolFsk = props => {
    const { schools, schoolId } = props || this.props
    const fox_index = schools.findIndex(s => s.id === parseInt(schoolId, 10))
    if (fox_index !== -1) {
      const school = schools[fox_index]
      if (school.name === '富士康' || school.name === '富士康工厂') {
        this.setState({
          isFushikang: true
        })
        let { deviceType } = this.props
        if (deviceType === DEVICE_TYPE_HEATER) {
          return
        }
        this.props.changeOrder(subModule, {
          stat_dt: DEVICE_TYPE_HEATER,
          page: 1
        })
        return true
      }
    }
    this.setState({
      isFushikang: false
    })
  }
  getColumns = () => {
    const columns = [
      {
        title: '学校',
        dataIndex: 'schoolName'
      },
      {
        title: '设备类型',
        dataIndex: 'deviceType',
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
    const { isFushikang } = this.state
    if (isFushikang) {
      columns.splice(
        2,
        0,
        {
          title: '总用水量',
          dataIndex: 'totalWaterUsage'
        },
        {
          title: '人均用水量',
          dataIndex: 'verageWaterUsage)'
        }
      )
      columns.splice(0, 1, {
        title: '公寓',
        dataIndex: 'schoolName'
      })
    }
    return columns
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'page',
        'order',
        'orderBy',
        'schools',
        'buildingIds'
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
    this.checkSchoolFsk(nextProps)
  }
  changeRange = key => {
    this.props.changeOrder(subModule, {
      stat_day: key === 'all' ? 'all' : +key
    })
  }
  showBuildingSelect = () => {
    this.setState({
      showBuildingSelect: true
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }
  confirmBuildings = ({ all, dataSource }) => {
    this.setState({
      showBuildingSelect: false
    })
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    this.props.changeOrder(subModule, {
      stat_buildingIds: buildingIds
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
    const {
      page,
      deviceType,
      day,
      buildingIds,
      schoolId,
      buildingsOfSchoolId
    } = this.props
    const {
      dataSource,
      total,
      loading,
      barData,
      isFushikang,
      showBuildingSelect
    } = this.state
    const buildingNames =
      buildingIds === 'all'
        ? '全部楼栋'
        : buildingIds
            .map(
              b =>
                buildingsOfSchoolId[+schoolId] &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b) &&
                buildingsOfSchoolId[+schoolId].find(bs => bs.id === b).name
            )
            .join('、')
    return (
      <div className="orderStat">
        <QueryPanel>
          <QueryLine labelName="时间筛选">
            <QueryBlock>
              <span>时间筛选:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ORDER_STAT_DAY_SELECT}
                value={day}
                onClick={this.changeRange}
              />
            </QueryBlock>
          </QueryLine>
          {isFushikang ? (
            <div className="queryLine">
              <div className="block">
                <span>楼栋筛选:</span>
                <span className="customized_select_option">
                  {buildingNames}
                </span>
                <Button type="primary" onClick={this.showBuildingSelect}>
                  点击选择
                </Button>
              </div>
            </div>
          ) : (
            <QueryLine>
              <QueryBlock>
                <span>设备类型:</span>
                <CheckSelect
                  options={DEVICETYPE}
                  value={deviceType}
                  onClick={this.changeDevice}
                />
              </QueryBlock>
            </QueryLine>
          )}
        </QueryPanel>

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
              columns={this.getColumns()}
              onChange={this.changeTable}
              onRowClick={this.selectRow}
              rowClassName={this.setRowClass}
            />
          </div>

          <OrderBarChart data={barData} />
        </div>
        {showBuildingSelect ? (
          <BuildingMultiSelectModal
            all={buildingIds === 'all'}
            selectedItems={buildingIds !== 'all' ? buildingIds : []}
            schoolId={schoolId}
            closeModal={this.closeBuildingSelect}
            confirmBuildings={this.confirmBuildings}
          />
        ) : null}
      </div>
    )
  }
}
export default OrderStatView
