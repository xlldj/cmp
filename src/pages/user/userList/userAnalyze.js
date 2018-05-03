import React from 'react'
import moment from 'moment'
import { Table, Button } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import RangeSelect from '../../component/rangeSelect'
import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'

const subModule = 'userList'

const { USER_ANALYZE_DAY_SELECT, PAGINATION: SIZE, DEVICETYPE } = CONSTANTS

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
    this.columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol'
      },
      {
        title: '登录账号',
        dataIndex: 'mobile'
      },
      {
        title: '手机型号',
        dataIndex: 'mobileBrand',
        width: '20%',
        render: (text, record) => {
          let result = ''
          if (record.mobileBrand) {
            result += record.mobileBrand
          }
          if (record.mobileModel) {
            result += `(${record.mobileModel})`
          }
          result = result ? result : '----'
          return result
        }
      },
      {
        title: '注册时间',
        dataIndex: 'createTime',
        render: (text, record) => Time.getTimeStr(record.createTime)
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        width: '12%',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/user/userInfo/:${record.id}`}>详情</Link>
            </span>
          </div>
        )
      }
    ]
  }

  fetchData = props => {
    if (this.state.loading) {
      return
    }
    this.setState({
      loading: true
    })
    const resource = '/api/user/list'
    const {
      list_page: page,
      schoolId,
      list_selectKey: selectKey,
      list_userTransfer: userTransfer
    } =
      props || this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (userTransfer !== 'all') {
      body.userTransfer = parseInt(userTransfer, 10)
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    AjaxHandler.fetch(resource, body).then(json => {
      let nextState = { loading: false }
      if (json && json.data) {
        nextState.dataSource = json.data.users
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
  changeSchool = value => {
    let { schoolId } = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeUser(subModule, { page: 1, schoolId: value })
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
    this.props.changeUser(subModule, { analyze_deviceType: value, page: 1 })
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
      list_page: page,
      analyze_day: day,
      analyze_deviceType: deviceType
    } = this.props
    const showClearBtn = !!searchingText

    return (
      <div className="">
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
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
                disableRule={this.disableRule}
              />
            </div>
          </div>

          <div className="queryLine">
            <div className="block">
              <span>设备类型:</span>
              <CheckSelect
                options={DEVICETYPE}
                value={deviceType}
                onClick={this.changeDevice}
              />
            </div>
            <div className="block">
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
            </div>
          </div>
        </div>

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
            columns={this.columns}
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
