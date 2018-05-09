import React from 'react'
import { Table, Button } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Format from '../../../util/format'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'
import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'

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
      endTime: ''
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
    const resource = '/api/statistics/order/user/consume'
    const {
      schoolId,
      analyze_day: day,
      analyze_startTime: startTime,
      analyze_endTime: endTime,
      analyze_deviceType: deviceType,
      analyze_selectKey: selectKey,
      analyze_page: page
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
        'analyze_deviceType'
      ])
    ) {
      return
    }
    this.fetchData(nextProps)
    this.syncStateWithProps(nextProps)
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
    const { analyze_deviceType: deviceType } = this.props
    let columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol',
        width: '10%'
      },
      {
        title: '用户',
        dataIndex: 'userName',
        width: '10%'
      },
      {
        title: '使用次数',
        dataIndex: 'useNum',
        width: '10%'
      }
    ]
    if (
      deviceType === DEVICE_TYPE_HEATER ||
      deviceType === DEVICE_TYPE_DRINGKER
    ) {
      columns.push({
        title: '用水量',
        dataIndex: 'waterUsage',
        width: '10%'
      })
    } else if (deviceType === DEVICE_TYPE_BLOWER) {
      columns.push({
        title: '时长(秒)',
        dataIndex: 'timeDuration',
        width: '10%',
        render: (text, record) =>
          record.timeDuration ? `${Format.ms2s(record.timeDuration)}秒` : 0
      })
    }

    columns = columns.concat([
      {
        title: '消费总额',
        dataIndex: 'consume',
        width: '10%',
        className: 'shalowRed',
        render: (text, record, index) =>
          record.consume ? `¥${record.consume}` : ''
      },
      {
        title: '充值金额',
        dataIndex: 'rechargeBalance',
        width: '10%',
        render: (text, record, index) => record.rechargeBalance || ''
      },
      {
        title: '账户总余额(元)',
        dataIndex: 'totalBalance',
        width: '10%',
        className: 'shalowRed',
        render: (text, record, index) => record.totalBalance || ''
      },
      {
        title: '账户赠送余额(元)',
        dataIndex: 'givingBalance',
        width: '10%',
        className: 'shalowRed',
        render: (text, record, index) => record.givingBalance || ''
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/user/userInfo/:${record.userId}`}>查看用户详情</Link>
              <span className="ant-divider" />
              <a onClick={e => this.toOrderOfUser(e, record.userId)}>
                查看订单记录
              </a>
            </span>
          </div>
        )
      }
    ])
    return columns
  }

  render() {
    const {
      dataSource,
      total,
      loading,
      searchingText,

      startTime,
      endTime
    } = this.state
    const {
      analyze_page: page,
      analyze_day: day,
      analyze_deviceType: deviceType
    } = this.props
    const showClearBtn = !!searchingText

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
                placeholder="手机号/手机型号"
                searchingText={searchingText}
                pressEnter={this.pressEnter}
                changeSearch={this.changeSearch}
              />
            </QueryBlock>
          </QueryLine>
        </QueryPanel>

        <div className="tableList">
          <Table
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
      </div>
    )
  }
}

export default UserTableView
