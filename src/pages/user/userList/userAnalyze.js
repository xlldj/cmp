import React, { Fragment } from 'react'
import { Table, Button } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Format from '../../../util/format'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'
import BuildingMultiSelectModal from '../../component/buildingMultiSelectModal'
import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import CascadedBuildingSelect from '../../component/cascadedBuildingSelect'

const subModule = 'userList'

const {
  USER_ANALYZE_DAY_SELECT,
  PAGINATION: SIZE,
  DEVICETYPE,
  NORMAL_DAY_7,
  DEVICE_TYPE_HEATER,
  DEVICE_TYPE_DRINGKER,
  DEVICE_TYPE_BLOWER
} = CONSTANTS

class UserTableView extends React.Component {
  constructor(props) {
    super(props)
    let dataSource = []
    let searchingText = ''
    this.state = {
      dataSource,
      searchingText,
      loading: false,
      total: 0,
      startTime: '',
      endTime: '',
      showBuildingSelect: false,
      isFushikang: false
    }
  }
  toOrderOfUser = (e, id) => {
    e.preventDefault()
    this.props.changeOrder('orderList', {
      tabIndex: 1,
      page: 1,
      schoolId: 'all',
      deviceType: 'all',
      day: NORMAL_DAY_7, // last 7 days
      status: 'all',
      selectKey: '',
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
    this.props.history.push({
      pathname: '/order/list',
      state: { path: 'fromUserAnalyze', id: id }
    })
  }
  fetchData = props => {
    if (this.state.loading) {
      return
    }
    this.setState({
      loading: true
    })
    const { isFushikang } = this.state
    const resource = '/api/statistics/order/user/consume'
    const {
      schoolId,
      analyze_day: day,
      analyze_startTime: startTime,
      analyze_endTime: endTime,
      analyze_deviceType: deviceType,
      analyze_selectKey: selectKey,
      analyze_page: page,
      buildingIds,
      areaIds,
      floorIds
    } =
      props || this.props
    const body = {
      page: page,
      size: SIZE,
      deviceType: +deviceType
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (buildingIds !== 'all') {
      body.buildingIds = buildingIds
    }
    if (isFushikang) {
      if (areaIds !== 'all') {
        body.areaIds = areaIds
      }
      if (floorIds !== 'all') {
        body.floorIds = floorIds
      }
    }
    if (day) {
      body.day = parseInt(day, 10)
    } else {
      body.startTime = startTime
      body.endTime = endTime
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { loading: false }
      if (json && json.data) {
        nextState.dataSource = json.data.list
        nextState.total = json.data.total
      }
      this.setState(nextState)
    })
  }

  componentDidMount() {
    this.fetchData()
    this.syncStateWithProps()
    this.checkSchoolFsk()
  }
  syncStateWithProps = props => {
    let { analyze_startTime, analyze_endTime, analyze_selectKey } =
      props || this.props

    const nextState = {}
    if (analyze_startTime !== this.state.startTime) {
      nextState.startTime = analyze_startTime
      nextState.endTime = analyze_endTime
    }
    if (analyze_selectKey !== this.state.searchingText) {
      nextState.searchingText = analyze_selectKey
    }
    this.setState(nextState)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'analyze_page',
        'schoolId',
        'analyze_day',
        'analyze_startTime',
        'analyze_endTime',
        'analyze_selectKey',
        'analyze_deviceType',
        'buildingIds',
        'schools',
        'areaIds',
        'floorIds'
      ])
    ) {
      return
    }
    this.fetchData(nextProps)
    this.syncStateWithProps(nextProps)
    this.checkSchoolFsk(nextProps)
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
        let { analyze_deviceType: deviceType } = this.props
        if (deviceType === DEVICE_TYPE_HEATER) {
          return
        }
        this.props.changeUser(subModule, {
          analyze_deviceType: DEVICE_TYPE_HEATER,
          analyze_page: 1
        })
        return true
      }
    }
    this.setState({
      isFushikang: false
    })
  }
  changeSearch = e => {
    this.setState({
      searchingText: e.target.value
    })
  }
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.analyze_selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeUser(subModule, { analyze_page: 1, analyze_selectKey: v })
  }
  clearSearch = () => {
    this.setState(
      {
        searchingText: ''
      },
      this.pressEnter
    )
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeUser(subModule, { analyze_page: page })
  }

  changeRange = key => {
    this.props.changeUser(subModule, {
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
    this.props.changeUser(subModule, {
      analyze_startTime: startTime,
      analyze_endTime: endTime,
      analyze_page: 1,
      analyze_day: 0
    })
  }
  changeDevice = value => {
    let { analyze_deviceType: deviceType } = this.props
    if (value === deviceType) {
      return
    }
    this.props.changeUser(subModule, {
      analyze_deviceType: value,
      analyze_page: 1
    })
  }
  getColumns = () => {
    const { isFushikang } = this.state
    const { analyze_deviceType: deviceType, forbiddenStatus } = this.props
    const { USER_INFO_DETILE } = forbiddenStatus
    let columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol'
      },
      {
        title: '用户',
        dataIndex: 'mobile'
      },
      {
        title: '使用次数',
        dataIndex: 'useNum'
      }
    ]
    if (
      deviceType === DEVICE_TYPE_HEATER ||
      deviceType === DEVICE_TYPE_DRINGKER
    ) {
      columns.push({
        title: '用水量',
        dataIndex: 'waterUsage'
      })
    } else if (deviceType === DEVICE_TYPE_BLOWER) {
      columns.push({
        title: '时长(秒)',
        dataIndex: 'timeDuration',
        render: (text, record) =>
          record.timeDuration ? `${Format.ms2s(record.timeDuration)}秒` : 0
      })
    }
    if (isFushikang) {
      columns = columns.concat([
        {
          title: '充值金额消费(元)',
          dataIndex: 'rechargeConsume',
          className: 'shalowRed',
          render: (text, record, index) =>
            record.rechargeConsume || record.rechargeConsume === 0
              ? `¥${record.rechargeConsume}`
              : ''
        },
        {
          title: '赠送金额消费(元)',
          dataIndex: 'givingConsume',
          className: 'shalowRed',
          render: (text, record, index) =>
            record.givingConsume || record.givingConsume === 0
              ? `¥${record.givingConsume}`
              : ''
        }
      ])
      columns.splice(
        2,
        0,
        {
          title: '员工姓名',
          dataIndex: 'userName'
        },
        {
          title: '工号',
          dataIndex: 'userNo'
        }
      )
      columns.splice(1, 0, {
        title: '宿舍',
        width: '6%',
        dataIndex: 'location',
        render: text => text || '暂无'
      })
      columns.splice(
        0,
        1,
        {
          title: '公寓',
          dataIndex: 'schoolName',
          width: '6%',
          className: 'firstCol'
        },
        {
          title: '区域',
          dataIndex: 'areaName',
          width: '6%'
        },
        {
          title: '楼栋',
          dataIndex: 'buildingName',
          width: '6%'
        },
        {
          title: '楼层',
          dataIndex: 'floorName',
          width: '6%'
        }
      )
    }
    columns = columns.concat([
      {
        title: '消费总额(元)',
        dataIndex: 'consume',
        className: 'shalowRed',
        render: (text, record, index) =>
          record.consume || record.consume === 0 ? `¥${record.consume}` : ''
      },
      {
        title: '充值金额(元)',
        dataIndex: 'rechargeBalance'
      },
      {
        title: '账户总余额(元)',
        dataIndex: 'totalBalance'
      },
      {
        title: '账户赠送余额(元)',
        dataIndex: 'givingBalance'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              {USER_INFO_DETILE ? null : (
                <Link to={`/user/userInfo/:${record.userId}`}>
                  查看用户详情
                </Link>
              )}
              {USER_ANALYZE_DAY_SELECT || USER_INFO_DETILE ? null : (
                <span className="ant-divider" />
              )}
              {USER_ANALYZE_DAY_SELECT ? null : (
                <a onClick={e => this.toOrderOfUser(e, record.userId)}>
                  查看订单记录
                </a>
              )}
            </span>
          </div>
        )
      }
    ])
    return columns
  }

  showBuildingSelect = () => {
    this.setState({
      showBuildingSelect: true
    })
  }
  confirmBuildings = ({ all, dataSource }) => {
    this.setState({
      showBuildingSelect: false
    })
    let buildingIds = all
      ? 'all'
      : dataSource.filter(d => d.selected === true).map(d => d.id)
    this.props.changeUser(subModule, {
      buildingIds: buildingIds
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }
  confirmResidence = ({ areaIds, buildingIds, floorIds }) => {
    this.props.changeUser(subModule, {
      areaIds,
      buildingIds,
      floorIds
    })
  }
  render() {
    const {
      dataSource,
      total,
      loading,
      searchingText,

      startTime,
      endTime,
      showBuildingSelect,
      isFushikang
    } = this.state
    const {
      analyze_page: page,
      analyze_day: day,
      analyze_deviceType: deviceType,
      buildingIds,
      schoolId,
      buildingsOfSchoolId,
      areaIds,
      floorIds
    } = this.props
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
    const showClearBtn = !!searchingText

    const buildingSelect = isFushikang ? (
      <Fragment>
        <span>位置筛选:</span>
        <CascadedBuildingSelect
          schoolId={schoolId}
          areaIds={areaIds}
          buildingIds={buildingIds}
          floorIds={floorIds}
          confirm={this.confirmResidence}
        />
      </Fragment>
    ) : (
      <Fragment>
        <span>楼栋筛选:</span>
        <span className="customized_select_option">{buildingNames}</span>
        <Button type="primary" onClick={this.showBuildingSelect}>
          点击选择
        </Button>
      </Fragment>
    )
    return (
      <div className="">
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <span>时间筛选:</span>
              <CheckSelect
                options={USER_ANALYZE_DAY_SELECT}
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
            </QueryBlock>
          </QueryLine>
          {isFushikang ? null : (
            <QueryLine>
              <QueryBlock>
                <span>设备类型:</span>
                <CheckSelect
                  options={DEVICETYPE}
                  value={deviceType}
                  onClick={this.changeDevice}
                />
              </QueryBlock>

              <QueryBlock>
                {showClearBtn ? (
                  <Button
                    onClick={this.clearSearch}
                    className="rightSeperator"
                    type="primary"
                  >
                    清空
                  </Button>
                ) : null}
                <SearchInput
                  placeholder="宿舍/手机号/手机型号"
                  searchingText={searchingText}
                  pressEnter={this.pressEnter}
                  changeSearch={this.changeSearch}
                />
              </QueryBlock>
            </QueryLine>
          )}
          <QueryLine>
            <QueryBlock>{buildingSelect}</QueryBlock>
            {isFushikang ? (
              <QueryBlock>
                {showClearBtn ? (
                  <Button
                    onClick={this.clearSearch}
                    className="rightSeperator"
                    type="primary"
                  >
                    清空
                  </Button>
                ) : null}
                <SearchInput
                  placeholder="手机号/手机型号"
                  searchingText={searchingText}
                  pressEnter={this.pressEnter}
                  changeSearch={this.changeSearch}
                />
              </QueryBlock>
            ) : null}
          </QueryLine>
        </QueryPanel>

        <div className="tableList">
          <Table
            className="noCursor"
            bordered
            showQuickJumper
            loading={loading}
            pagination={{
              pageSize: SIZE,
              current: page,
              total: total,
              showQuickJumper: true
            }}
            dataSource={dataSource}
            rowKey={record => record.id}
            columns={this.getColumns()}
            onChange={this.changePage}
            onRowClick={this.selectRow}
            rowClassName={this.setRowClass}
          />
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

export default UserTableView
