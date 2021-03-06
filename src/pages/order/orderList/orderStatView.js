import React, { Fragment } from 'react'

import { Table } from 'antd'
import AjaxHandler from '../../../util/ajax'
// import AjaxHandler from '../../../mock/ajax.js'
import CONSTANTS from '../../../constants'

import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import CheckSelect from '../../component/checkSelect'
// import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
import OrderBarChart from './orderBarChart'
import RangeSelect from '../../component/rangeSelect'
import CascadedBuildingSelect from '../../component/cascadedBuildingSelect'
import BasicSelector from '../../component/basicSelectorWithoutAll'

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
  DEVICE_TYPE_HEATER,
  RESIDENCE_DIMENSION
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
      showBuildingSelect: false,
      startTime: '',
      endTime: '',
      searchingText: ''
    }
  }
  fetchList = props => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
    }
    props = props || this.props
    const { isFushikang } = this.state

    let {
      page,
      schoolId,
      deviceType,
      day,
      order,
      orderBy,
      startTime,
      endTime,
      areaIds,
      buildingIds,
      floorIds,
      dimension,
      selectKey
    } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    } else {
      body.day = +day
      if (day === 'all') {
        body.day = ORDER_STAT_DAY_UNLIMITED
      }
    }
    // if (buildingIds !== 'all') {
    //   body.buildingIds = buildingIds
    // }
    if (isFushikang) {
      if (areaIds !== 'all') {
        body.areaIds = areaIds
      }
      if (buildingIds && buildingIds !== 'all') {
        body.buildingIds = buildingIds
      }
      if (floorIds && floorIds !== 'all') {
        body.floorIds = floorIds
      }
      if (dimension) {
        body.dimension = dimension
      }
      if (selectKey) {
        body.selectKey = selectKey
      }
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

    const resource = '/api/order/statistic/list'
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = { listLoading: false }
      if (!this.state.histogramLoading) {
        nextState.loading = false
      }
      if (json && json.data) {
        nextState.dataSource = json.data.list
        nextState.total = json.data.total
      }
      this.setState(nextState)
    })
  }
  fetchHistogram = props => {
    if (!this.state.loading) {
      this.setState({
        loading: true
      })
    }
    props = props || this.props
    const { isFushikang } = this.state

    let {
      page,
      schoolId,
      deviceType,
      day,
      startTime,
      endTime,
      areaIds,
      buildingIds,
      floorIds,
      dimension,
      selectKey
    } = props
    const body = {
      page: page,
      size: SIZE
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    } else {
      body.day = +day
      if (day === 'all') {
        body.day = ORDER_STAT_DAY_UNLIMITED
      }
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (isFushikang) {
      if (areaIds !== 'all') {
        body.areaIds = areaIds
      }
      if (buildingIds !== 'all') {
        body.buildingIds = buildingIds
      }
      if (floorIds !== 'all') {
        body.floorIds = floorIds
      }
      if (dimension) {
        body.dimension = dimension
      }
      if (selectKey) {
        body.selectKey = selectKey
      }
    }

    const resource = '/api/order/statistic/histogram'
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = { histogramLoading: false }
      if (!this.state.listLoading) {
        nextState.loading = false
      }
      if (json && json.data) {
        const barData = this.getBarData()
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
    })
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
    this.checkSchoolFsk().then(() => {
      this.fetchList()
      this.fetchHistogram()
    })
    // this.checkSchoolFsk()
    this.syncStateWithProps()
  }
  syncStateWithProps = props => {
    let { startTime, endTime, selectKey } = props || this.props

    const nextState = {}
    if (startTime !== this.state.startTime) {
      nextState.startTime = startTime
      nextState.endTime = endTime
    }
    if (selectKey !== this.state.searchingText) {
      nextState.searchingText = selectKey
    }
    this.setState(nextState)
  }
  //检查选择学校是否为富士康
  checkSchoolFsk = props => {
    return new Promise((resolve, reject) => {
      const { schools, schoolId } = props || this.props
      const fox_index = schools.findIndex(s => s.id === parseInt(schoolId, 10))
      const nextState = { isFushikang: false }
      if (fox_index !== -1) {
        const school = schools[fox_index]
        if (school.name === '富士康' || school.name === '富士康工厂') {
          nextState.isFushikang = true
          const { deviceType } = this.props
          if (deviceType !== DEVICE_TYPE_HEATER) {
            this.props.changeOrder(subModule, {
              stat_dt: DEVICE_TYPE_HEATER,
              page: 1
            })
          }
        }
      }
      this.setState(nextState, resolve)
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
        sorter: true
      },
      {
        title: '人均消费(元)',
        dataIndex: 'userAverage',
        sorter: true
      },
      {
        title: '使用次数',
        dataIndex: 'orderCount',
        sorter: true
      },
      {
        title: '次均消费(元)',
        dataIndex: 'orderAverage',
        sorter: true
      },
      {
        title: '总收益(元)',
        dataIndex: 'totalIncome',
        sorter: true
      }
    ]
    const { isFushikang } = this.state
    if (isFushikang) {
      columns.splice(5, 1, {
        title: '次均消费',
        dataIndex: 'orderAverage',
        render: (text, record) => (
          <span>
            {record.orderWaterUsageAverage}L({record.orderAverage}元)
          </span>
        )
      })
      columns.splice(3, 1)
      columns.splice(
        2,
        0,
        {
          title: '总用水量',
          dataIndex: 'totalWaterUsage',
          render: (text, record) => (
            <span>
              {record.totalWaterUsage}L({record.totalIncome}元)
            </span>
          )
        },
        {
          title: '赠送用水量',
          dataIndex: 'givingWaterUsage',
          render: (text, record) => (
            <span>
              {record.givingWaterUsage}L({record.givingConsume}元)
            </span>
          )
        },
        {
          title: '充值用水量',
          dataIndex: 'chargeWaterUsage',
          render: (text, record) => (
            <span>
              {record.chargeWaterUsage}L({record.chargeConsume}元)
            </span>
          )
        },
        {
          title: '人均用水量',
          dataIndex: 'averageWaterUsage',
          render: (text, record) => (
            <span>
              {record.averageWaterUsage}L({record.userAverage}元)
            </span>
          )
        }
      )
      columns.splice(
        0,
        1,
        {
          title: '公寓',
          dataIndex: 'schoolName'
        },
        {
          title: '区域',
          dataIndex: 'areaName'
        },
        {
          title: '楼栋',
          dataIndex: 'buildingName'
        },
        {
          title: '楼层',
          dataIndex: 'floorName'
        }
      )
      columns.splice(columns.length - 1, 1, {
        title: '充值金额(元)',
        dataIndex: 'chargeAmount'
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
        'startTime',
        'endTime',
        'areaIds',
        'buildingIds',
        'floorIds',
        'dimension',
        'selectKey'
        // 'buildingIds'
      ])
    ) {
      return
    }

    this.syncStateWithProps(nextProps)
    // if these options are same, doesn't need to refetch histogram.
    if (
      !checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'startTime',
        'endTime',
        'areaIds',
        'buildingIds',
        'floorIds',
        'dimension',
        'selectKey'
      ])
    ) {
      this.checkSchoolFsk(nextProps).then(() => {
        this.fetchList(nextProps)
        this.fetchHistogram(nextProps)
      })
    } else {
      this.checkSchoolFsk(nextProps).then(() => {
        this.fetchList(nextProps)
      })
    }
  }
  changeRange = key => {
    this.props.changeOrder(subModule, {
      stat_day: key === 'all' ? 'all' : +key,
      stat_startTime: '',
      stat_endTime: ''
    })
  }
  showBuildingSelect = () => {
    this.setState({
      showBuildingSelect: true
    })
  }
  // closeBuildingSelect = () => {
  //   this.setState({
  //     showBuildingSelect: false
  //   })
  // }
  // confirmBuildings = ({ all, dataSource }) => {
  //   this.setState({
  //     showBuildingSelect: false
  //   })
  //   let buildingIds = all
  //     ? 'all'
  //     : dataSource.filter(d => d.selected === true).map(d => d.id)
  //   this.props.changeOrder(subModule, {
  //     stat_buildingIds: buildingIds
  //   })
  // }
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
      stat_startTime: startTime,
      stat_endTime: endTime,
      stat_page: 1,
      stat_day: 0
    })
  }
  confirmResidence = ({ areaIds, buildingIds, floorIds }) => {
    this.props.changeOrder(subModule, {
      stat_areaIds: areaIds,
      stat_buildingIds: buildingIds,
      stat_floorIds: floorIds
    })
  }
  changeDimension = v => {
    this.props.changeOrder(subModule, {
      dimension: v
    })
  }
  changeSearch = e => {
    const nextState = {}
    nextState.searchingText = e.target.value
    this.setState(nextState)
  }
  pressEnter = () => {
    let { selectKey } = this.props
    let searchingText = this.state.searchingText.trim()
    if (selectKey !== searchingText) {
      this.props.changeOrder(subModule, {
        stat_selectKey: searchingText,
        page: 1
      })
    }
  }
  clearMobile = () => {
    this.setState(
      {
        searchingText: ''
      },
      this.pressEnter
    )
  }
  render() {
    const {
      page,
      deviceType,
      day,
      buildingIds,
      areaIds,
      floorIds,
      schoolId,
      dimension
    } = this.props
    const {
      dataSource,
      total,
      loading,
      barData,
      isFushikang,
      startTime,
      endTime
      // showBuildingSelect
    } = this.state

    const buildingSelect = (
      <Fragment>
        <span>位置筛选:</span>
        <CascadedBuildingSelect
          schoolId={schoolId}
          areaIds={areaIds}
          buildingIds={buildingIds}
          floorIds={floorIds}
          confirm={this.confirmResidence}
        />
        <span className="leftSeperator">维度:</span>
        <BasicSelector
          staticOpts={RESIDENCE_DIMENSION}
          selectedOpt={dimension}
          changeOpt={this.changeDimension}
        />
      </Fragment>
    )
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
              <RangeSelect
                className="seperator"
                startTime={startTime}
                endTime={endTime}
                allowHours={true}
                format="YYYY-MM-DD HH:mm:ss"
                changeStartTime={this.changeStartTime}
                changeEndTime={this.changeEndTime}
                confirm={this.confirmTimeRange}
                disableRule={this.disableRule}
              />
            </QueryBlock>
          </QueryLine>
          <QueryLine>
            <QueryBlock>
              {isFushikang ? (
                buildingSelect
              ) : (
                <Fragment>
                  <span>设备类型:</span>
                  <CheckSelect
                    options={DEVICETYPE}
                    value={deviceType}
                    onClick={this.changeDevice}
                  />
                </Fragment>
              )}
            </QueryBlock>
          </QueryLine>
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
              rowKey={(record, index) => index}
              columns={this.getColumns()}
              onChange={this.changeTable}
              onRowClick={this.selectRow}
              rowClassName={this.setRowClass}
            />
          </div>

          <OrderBarChart data={barData} />
        </div>
        {/* {showBuildingSelect ? (
          <BuildingMultiSelectModal
            all={buildingIds === 'all'}
            selectedItems={buildingIds !== 'all' ? buildingIds : []}
            schoolId={schoolId}
            closeModal={this.closeBuildingSelect}
            confirmBuildings={this.confirmBuildings}
          />
        ) : null} */}
      </div>
    )
  }
}
export default OrderStatView
