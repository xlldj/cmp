import React, { Fragment } from 'react'

import { Table, Button, Checkbox } from 'antd'
import moment from 'moment'
import AjaxHandler from '../../../../util/ajax'
// import AjaxHandler from '../../../../mock/ajax'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
import Noti from '../../../../util/noti'
import Format from '../../../../util/format'
import { notEmpty } from '../../../../util/types'

import CheckSelect from '../../../component/checkSelect'
import ThresholdSelector from '../../../component/thresholdSelector'
import SetRuleHint from './setRuleHint.js'
// import RangeSelect from '../rangeSelectDisableMonth.js'
import RangeSelect from '../../../component/rangeSelect'
import BuildingMultiSelectModal from '../../../component/buildingMultiSelectModal'
import RepairmanTable from '../../../component/repairmanChooseClean.js'
import CascadedBuildingSelect from '../../../component/cascadedBuildingSelect'

import { checkObject } from '../../../../util/checkSame'
const subModule = 'orderList'

const {
  PAGINATION: SIZE,
  DEVICETYPE,
  ORDER_ANALYZE_DAY_SELECT,
  ROOMTYPES,
  DEVICE_WARN_TASK_STATUS_ENUM,
  NORMAL_DAY_7,
  ORDER_ANALYZE_DAY_SELECT_ARR,
  ORDER,
  ORDER_ANALYZE_ORDERBYS,
  DEVICE_TYPE_HEATER,
  DEVICE_TYPE_DRINGKER,
  DEVICE_TYPE_BLOWER
} = CONSTANTS

class OrderAnalyzeView extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    this.state = {
      dataSource,
      loading: false,
      total: 0,
      totalDeviceCount: 0,
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      threshold: this.props.threshold,
      thresholdType: this.props.thresholdType,
      showSetRuleHint: !this.checkRulesReady(this.props),
      selectedRowKeys: [],
      buildingDataSet: {},
      showBuildingSelect: false,
      notHandlingCount: '',
      isFushikang: ''
    }
  }
  fetchData = props => {
    this.setState({
      loading: true
    })
    props = props || this.props

    let {
      page,
      day,
      schoolId,
      buildingIds,
      roomType,
      warnTaskStatus,
      threshold,
      thresholdType,
      deviceType,
      startTime,
      endTime,
      order,
      orderBy
    } = props
    const body = {
      page: page,
      size: SIZE,
      schoolId: +schoolId, // schoolId should not be 'all', thus could be parse to int directly
      threshold,
      thresholdType
    }
    if (orderBy && order !== -1) {
      body.orderBy = ORDER_ANALYZE_ORDERBYS[orderBy]
      body.order = ORDER[order]
    }
    if (buildingIds !== 'all') {
      body.buildingIds = buildingIds
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    } else {
      body.day = parseInt(day, 10)
    }
    if (deviceType !== 'all') {
      body.deviceType = parseInt(deviceType, 10)
    }
    if (roomType !== 'all') {
      body.roomType = parseInt(roomType, 10)
    }
    if (warnTaskStatus !== 'all') {
      // body.warnTaskStatus = parseInt(warnTaskStatus, 10)
      body.warnTaskStatus = warnTaskStatus.toString() === '1' ? false : true
    }

    let resource = '/api/order/consumption/device/list'
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { loading: false }

      if (json && json.data) {
        // select no rows default
        let dataSource = json.data.list.map(l => {
          l.selected = false
          return l
        })
        const { allRowsOfOrderTableSelected } = this.state
        if (allRowsOfOrderTableSelected) {
          dataSource.forEach(d => {
            if (!d.warningTaskHandling) {
              d.selected = true
            }
          })
        }
        nextState.dataSource = dataSource
        nextState.total = json.data.total
        nextState.totalDeviceCount = json.data.totalDeviceCount
        nextState.notHandlingCount = json.data.notHandlingCount
      }
      this.setState(nextState)
    })
  }
  componentDidMount() {
    let { schoolId, schools, buildingsOfSchoolId } = this.props
    // change schoolId if is 'all' now
    if (schoolId === 'all') {
      schoolId = (schools && schools[0] && schools[0].id) || 1
      this.props.changeOrder(subModule, { schoolId })
    }
    // fetch buildings if not set
    // here guarantees schoolId is always set and buildings are always fetched when mounted.
    // thus only need to fetch buildings when schoolId is changed through user click.
    this.checkSchoolFsk()
    if (!buildingsOfSchoolId[schoolId]) {
      this.props.fetchBuildings(+schoolId)
    }
    this.syncStateWithProps()
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'day',
        'schoolId',
        'deviceType',
        'page',
        'startTime',
        'endTime',
        'buildingIds',
        'roomType',
        'threshold',
        'thresholdType',
        'warnTaskStatus',
        'order',
        'orderBy',
        'schools'
      ])
    ) {
      return
    }
    // if 'schoolId' is changed ,fetch buildings again if needed
    if (this.props.schoolId !== nextProps.schoolId) {
      this.props.fetchBuildings(+nextProps.schoolId)
    }
    this.checkSchoolFsk(nextProps)
    this.syncStateWithProps(nextProps)
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
          analyze_deviceType: DEVICE_TYPE_HEATER,
          page: 1
        })
        return true
      }
    }
    this.setState({
      isFushikang: false
    })
  }
  syncStateWithProps = props => {
    let { startTime, endTime, threshold, thresholdType } = props || this.props

    const nextState = {}
    if (startTime !== this.state.startTime) {
      nextState.startTime = startTime
      nextState.endTime = endTime
    }
    if (threshold !== this.state.threshold) {
      nextState.threshold = threshold
    }
    if (thresholdType !== this.state.thresholdType) {
      nextState.thresholdType = thresholdType
    }

    // check if rules are set ready
    if (this.checkRulesReady(props)) {
      nextState.showSetRuleHint = false
      this.fetchData(props)
    } else {
      nextState.showSetRuleHint = true
    }
    this.setState(nextState)
  }
  isThresholdReady = value => {
    // set rules here for threshold
    let v = +value
    if (v >= 0) {
      return true
    }
    return false
  }
  checkRulesReady = props => {
    let { schoolId, threshold, thresholdType } = props || this.props
    if (
      schoolId === 'all' ||
      !this.isThresholdReady(threshold) ||
      !thresholdType
    ) {
      return false
    }
    return true
  }
  changeRange = key => {
    this.props.changeOrder(subModule, {
      analyze_startTime: '',
      analyze_endTime: '',
      analyze_day: +key
    })
  }
  changeStartTime = time => {
    this.setState({
      startTime: time
    })
  }
  disableRule = (startTime, endTime) => {
    return (
      startTime < moment(endTime).subtract(1, 'M') &&
      startTime > moment(endTime)
    )
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
      analyze_startTime: startTime,
      analyze_endTime: endTime,
      analyze_page: 1,
      analyze_day: 0
    })
  }
  changeDevice = value => {
    let { deviceType } = this.props
    if (value === deviceType) {
      return
    }
    this.props.changeOrder(subModule, { analyze_deviceType: value, page: 1 })
  }
  showBuildingSelect = () => {
    this.setState({
      showBuildingSelect: true
    })
  }

  changeRoomType = value => {
    let { roomType } = this.props
    if (value === roomType) {
      return
    }
    this.props.changeOrder(subModule, { analyze_roomType: value, page: 1 })
  }
  changeThreshold = e => {
    let value = e.target.value
    // no negative, could be fractional
    let v = parseInt(value, 10)
    if (v >= 0) {
      this.setState({
        threshold: value
      })
    } else {
      this.setState({ threshold: '' })
    }
  }
  changeThresholdType = v => {
    console.log(v)
    this.setState({
      thresholdType: v
    })
  }
  confirmThreshold = () => {
    let { threshold, thresholdType } = this.state
    this.props.changeOrder(subModule, {
      analyze_thresholdType: thresholdType || 0,
      analyze_threshold: parseFloat(threshold, 10) || 0,
      page: 1
    })
  }
  changeWarnTaskStatus = value => {
    let { warnTaskStatus } = this.props
    if (value === warnTaskStatus) {
      return
    }
    this.props.changeOrder(subModule, {
      analyze_warnTaskStatus: value,
      page: 1
    })
  }

  back = () => {
    this.props.history.goBack()
  }

  changeTable = (pageObj, filters, sorter) => {
    let { order, field } = sorter
    let data = {}
    if (order !== this.props.order || field !== this.props.orderBy) {
      data.analyze_order = order
      data.analyze_orderBy = field
      data.analyze_page = 1
    }
    let page = pageObj.current
    if (page !== this.props.page) {
      data.analyze_page = page
    }
    this.props.changeOrder(subModule, data)
  }

  selectRow = (record, index, event) => {
    const { dataSource } = this.state
    this.toggleOrderRowSelectStatus(null, dataSource[index].deviceId)
  }
  onSelectInvert = () => {
    console.log('onSelectInvert')
  }
  selectAllItemsOfOrderTable = () => {
    console.log('selectAllItemsOfOrderTable')
  }
  toOrderRecord = (e, deviceType, location) => {
    e.preventDefault()
    // must stop it unless will cause a click on order/list item to show detail
    e.stopPropagation()
    // just go to order list tab
    console.log(location)
    this.props.changeOrder(subModule, {
      tabIndex: 1, // goto order list tab
      page: 1,
      day: NORMAL_DAY_7, // set to 7 days default
      deviceType: deviceType || 'all',
      status: 'all',
      userType: 'all',
      selectKey: location,
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
  }
  toggleAllRowsOfOrderTable = () => {
    const { allRowsOfOrderTableSelected } = this.state

    const dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    if (allRowsOfOrderTableSelected) {
      // previous all selected, not deselect
      dataSource.forEach(d => (d.selected = false))
    } else {
      dataSource.forEach(d => (d.selected = true))
    }
    this.setState({
      allRowsOfOrderTableSelected: !this.state.allRowsOfOrderTableSelected,
      dataSource
    })
  }
  toggleOrderRowSelectStatus = (e, deviceId) => {
    let { allRowsOfOrderTableSelected } = this.state

    const dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    let data = dataSource.find(d => d.deviceId === deviceId)
    if (data) {
      // if has task handling, can't select it
      if (data.warningTaskHandling) {
        return
      }
      data.selected = !data.selected
    }
    // if 'allRowsOfOrderTableSelected' is true, which means selected all items across pages, need to
    // toggle it when deselect some item in this page
    if (allRowsOfOrderTableSelected) {
      let allRowsInCurrentPageSelected = dataSource
        .filter(d => d.warningTaskHandling === false)
        .every(d => d.selected === true)
      if (!allRowsInCurrentPageSelected) {
        allRowsOfOrderTableSelected = false
      }
    }
    this.setState({
      dataSource,
      allRowsOfOrderTableSelected
    })
  }
  getColumns = () => {
    let { day, deviceType, forbiddenStatus } = this.props
    let { startTime, endTime, allRowsOfOrderTableSelected } = this.state
    const dayStr = day
      ? ORDER_ANALYZE_DAY_SELECT[day]
      : `${Time.format(startTime, 'yyyy-MM-DD')}至${Time.format(
          endTime,
          'yyyy-MM-DD'
        )}`

    let columns = [
      {
        title: (
          <Checkbox
            style={{ textAlign: 'center' }}
            checked={allRowsOfOrderTableSelected}
            onChange={this.toggleAllRowsOfOrderTable}
          />
        ),
        width: '4%',
        dataIndex: 'selected',
        className: 'center',
        render: (text, record) => {
          if (record.warningTaskHandling) {
            return ''
          } else {
            return (
              <Checkbox
                checked={record.selected}
                onChange={e => {
                  this.toggleOrderRowSelectStatus(e, record.deviceId)
                }}
              />
            )
          }
        }
      },
      {
        title: '学校',
        width: '18%',
        dataIndex: 'schoolName'
      },
      {
        title: '设备',
        dataIndex: 'deviceType',
        width: '10%',
        render: (text, record, index) => DEVICETYPE[record.deviceType]
      },
      {
        title: '设备地址',
        dataIndex: 'location',
        width: '18%'
      },
      {
        title: `${dayStr}消费总额(元)`,
        dataIndex: 'consumption',
        className: 'shalowRed',
        width: '12%',
        render: (text, record, index) =>
          notEmpty(record.consumption) ? `¥${record.consumption}` : 0,
        sorter: true
      }
    ]
    // 如果没有权限，删掉第一列
    if (forbiddenStatus.BUILD_TASK_BY_DEVICE_CONSUMPTION) {
      columns.splice(0, 1)
    }
    if (deviceType === DEVICE_TYPE_BLOWER) {
      columns.push({
        title: `${dayStr}使用时长(秒)`,
        dataIndex: 'timeDuration',
        width: '14%',
        render: (text, record) =>
          record.timeDuration ? `${Format.ms2s(record.timeDuration)}秒` : 0,
        sorter: true
      })
    } else if (
      deviceType === DEVICE_TYPE_HEATER ||
      deviceType === DEVICE_TYPE_DRINGKER
    ) {
      columns.push({
        title: `${dayStr}用水量(升)`,
        dataIndex: 'waterUsage',
        width: '12%',
        render: (text, record, index) => record.waterUsage || 0,
        sorter: true
      })
    }
    columns = columns.concat([
      {
        title: '是否存在预警工单',
        dataIndex: 'warningTaskHandling',
        width: '12%',
        render: (text, record, index) =>
          record.warningTaskHandling ? (
            <span>
              是 |{' '}
              <a onClick={e => this.toTaskDetail(e, record.workOrderId)}>
                查看工单
              </a>
            </span>
          ) : (
            '否'
          )
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <a
              href=""
              onClick={e =>
                this.toOrderRecord(e, record.deviceType, record.location)
              }
            >
              查看订单记录
            </a>
          </div>
        )
      }
    ])
    return columns
  }
  toTaskDetail = (e, id) => {
    e.preventDefault()
    this.props.changeTask('taskListContainer', {
      tabIndex: 2, // '处理中'
      showDetail: true,
      selectedRowIndex: 0,
      selectedDetailId: id,
      schoolId: 'all',
      mine: 2
    })
    this.props.changeTask('pendingList', {
      day: 'all',
      type: 'all',
      selectKey: id
    })
    this.props.history.push({
      pathname: '/task/list',
      state: { path: 'fromOrder', id: id }
    })
  }
  getSchoolName = () => {
    let { schoolId, schools } = this.props
    if (schoolId === 'all') {
      return
    }
    let school = schools && schools.find(s => s.id === +schoolId)
    return school ? school.name : ''
  }

  confirmBuildings = ({ all, dataSource }) => {
    this.setState({
      showBuildingSelect: false
    })
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    this.props.changeOrder(subModule, {
      analyze_buildingIds: buildingIds
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }
  showRepairmanSelect = () => {
    this.setState({
      showRepairmanSelect: true
    })
  }
  confirmChooseRepairman = (assignId, level, content) => {
    // first post then close the modal. And notice to forbid double click when posting
    const { allRowsOfOrderTableSelected, dataSource } = this.state
    const {
      schoolId,
      deviceType,
      buildingIds,
      threshold,
      thresholdType,
      day,
      startTime,
      endTime,
      roomType
    } = this.props
    const resource = '/api/work/order/create/batch'
    const body = {
      schoolId: +schoolId,
      assignId,
      level,
      content
    }

    let deviceIds = dataSource.filter(d => d.selected === true)
    if (allRowsOfOrderTableSelected) {
      // if post 'all', set all the needing options
      body.all = true
      if (deviceType !== 'all') {
        body.deviceType = +deviceType
      }
      if (buildingIds !== 'all') {
        body.buildingIds = buildingIds
      }
      if (roomType !== 'all') {
        body.roomType = +roomType
      }
      body.threshold = threshold
      body.thresholdType = thresholdType
    } else {
      body.deviceIds = deviceIds.map(d => d.deviceId)
    }
    // always posting time setting
    if (day) {
      // day is not 0, which is a valid value
      body.day = +day
    } else {
      body.startTime = startTime
      body.endTime = endTime
    }
    this.setState({
      postingTask: true
    })
    AjaxHandler.fetch(resource, body).then(json => {
      const nextState = {
        postingTask: false
      }
      if (json && json.data) {
        // close modal and clear selectedRowKeys
        nextState.showRepairmanSelect = false
        nextState.selectedRowKeys = []
        Noti.hintOk('生成成功', '工单已提交')
        // refetch data, since these items' warningTaskHandling is changed
        this.fetchData()
      }
      this.setState(nextState)
    })
  }
  cancelChooseRepairman = () => {
    this.setState({
      showRepairmanSelect: false
    })
  }
  render() {
    const {
      page,
      deviceType,
      buildingIds,
      day,
      roomType,
      warnTaskStatus,
      schoolId,
      buildingsOfSchoolId,
      forbiddenStatus
    } = this.props
    const { BUILD_TASK_BY_DEVICE_CONSUMPTION } = forbiddenStatus
    const {
      threshold,
      thresholdType,
      dataSource,
      total,
      totalDeviceCount,
      loading,
      startTime,
      endTime,
      showSetRuleHint,
      showBuildingSelect,
      showRepairmanSelect,
      allRowsOfOrderTableSelected,
      notHandlingCount,
      isFushikang
    } = this.state
    const selectedRowLengthsOfOrderTable = dataSource.filter(
      d => d.selected === true && d.warningTaskHandling === false
    ).length
    const schoolName = this.getSchoolName()
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

    console.log(isFushikang)
    const showBuildTaskBtn = selectedRowLengthsOfOrderTable > 0
    const buildingSelect = (
      <Fragment>
        <span>楼栋筛选:</span>
        <span className="customized_select_option">{buildingNames}</span>
        <Button type="primary" onClick={this.showBuildingSelect}>
          点击选择
        </Button>
      </Fragment>
    )
    return (
      <div className="orderWarnListWrapper">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <span>时间筛选:</span>
              <CheckSelect
                options={ORDER_ANALYZE_DAY_SELECT_ARR}
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
                disableRule={this.disableRule}
              />
            </div>
          </div>
          {isFushikang ? null : (
            <div className="queryLine">
              <div className="block">
                <span>设备类型:</span>
                <CheckSelect
                  options={DEVICETYPE}
                  value={deviceType}
                  onClick={this.changeDevice}
                />
              </div>
            </div>
          )}

          <div className="queryLine">
            <div className="block">{buildingSelect}</div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>宿舍类型:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={ROOMTYPES}
                value={roomType}
                onClick={this.changeRoomType}
              />
            </div>

            <div className="block orderWarnThresholdWrapper">
              <span className="shortSeperator">消费区间筛选(元):</span>
              <input
                className="shortInput"
                value={threshold}
                onChange={this.changeThreshold}
              />
              <ThresholdSelector
                value={+thresholdType}
                changeThreshold={this.changeThresholdType}
              />
              <Button
                type="primary"
                className="shortSeperator"
                onClick={this.confirmThreshold}
              >
                确认
              </Button>
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>工单状态:</span>
              <CheckSelect
                allOptTitle="不限"
                allOptValue="all"
                options={DEVICE_WARN_TASK_STATUS_ENUM}
                value={warnTaskStatus}
                onClick={this.changeWarnTaskStatus}
              />
            </div>

            {showSetRuleHint ? null : (
              <div className="block">
                <span className="seperator">
                  {schoolName} {buildingNames} 共{totalDeviceCount}个设备，当前筛选{
                    total
                  }个设备
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="tableList">
          {showSetRuleHint ? (
            <SetRuleHint />
          ) : (
            <Fragment>
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
                rowKey={record => record.deviceId}
                columns={this.getColumns()}
                onChange={this.changeTable}
                onRowClick={this.selectRow}
              />
              {showBuildTaskBtn && !BUILD_TASK_BY_DEVICE_CONSUMPTION ? (
                <div className="buildTaskWrapper">
                  <Button type="primary" onClick={this.showRepairmanSelect}>
                    批量生成工单
                  </Button>
                  <span>
                    {allRowsOfOrderTableSelected
                      ? `当前选中全部订单${notHandlingCount}条`
                      : `当前选中${selectedRowLengthsOfOrderTable}条`}
                  </span>
                </div>
              ) : null}
            </Fragment>
          )}
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

        {/* for repairm choose */}
        {showRepairmanSelect ? (
          <RepairmanTable
            showModal={showRepairmanSelect}
            confirm={this.confirmChooseRepairman}
            cancel={this.cancelChooseRepairman}
            schoolId={schoolId}
            schoolName={schoolName}
            taskCount={
              allRowsOfOrderTableSelected
                ? notHandlingCount
                : selectedRowLengthsOfOrderTable
            }
          />
        ) : null}
      </div>
    )
  }
}

export default OrderAnalyzeView
