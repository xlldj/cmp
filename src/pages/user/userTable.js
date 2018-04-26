import React from 'react'
import { Table } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../util/ajax'
import SearchLine from '../component/searchLine'
import SchoolSelector from '../component/schoolSelector'
import BasicSelector from '../component/basicSelector'
import Time from '../../util/time'
import CONSTANTS from '../../constants'
import { checkObject } from '../../util/checkSame'

import PropTypes from 'prop-types'
const subModule = 'userList'

const { USERORIGIN } = CONSTANTS
const SIZE = CONSTANTS.PAGINATION

class UserTableView extends React.Component {
  static propTypes = {
    schoolId: PropTypes.string.isRequired,
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    let dataSource = []
    let searchingText = ''
    this.state = {
      dataSource,
      searchingText,
      loading: false,
      total: 0
    }
    this.columns = [
      {
        title: '学校名称',
        dataIndex: 'schoolName',
        className: 'firstCol'
      },
      {
        title: '用户手机号',
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

  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/api/user/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          nextState.dataSource = json.data.users
          nextState.total = json.data.total
          if (body.page === 1) {
            nextState.page = 1
          }
        } else {
          this.setState(nextState)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }

  componentDidMount() {
    this.props.hide(false)
    let { page, schoolId, selectKey, userTransfer } = this.props
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
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'page',
        'schoolId',
        'selectKey',
        'userTransfer'
      ])
    ) {
      return
    }
    let { page, schoolId, selectKey, userTransfer } = nextProps
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
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
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
    let selectKey = this.props.selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeUser(subModule, { page: 1, selectKey: v })
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeUser(subModule, { page: page })
  }
  changeUserTransfer = v => {
    let { userTransfer } = this.props
    if (userTransfer === v) {
      return
    }
    this.props.changeUser(subModule, { page: 1, userTransfer: v })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page, schoolId, userTransfer } = this.props

    return (
      <div className="contentArea">
        <SearchLine
          leftDespTitle1={`当前用户数量：${total ? total : 0}`}
          searchInputText="手机号/手机型号"
          rightAddTitle="导入富士康员工"
          rightAddLink="/user/foxconn"
          selector1={
            <BasicSelector
              allTitle="所有用户"
              selectedOpt={userTransfer}
              staticOpts={USERORIGIN}
              changeOpt={this.changeUserTransfer}
            />
          }
          selector2={
            <SchoolSelector
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
            />
          }
          searchingText={this.state.searchingText}
          pressEnter={this.pressEnter}
          changeSearch={this.changeSearch}
        />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            dataSource={dataSource}
            columns={this.columns}
            onChange={this.changePage}
          />
        </div>
      </div>
    )
  }
}

export default UserTableView
