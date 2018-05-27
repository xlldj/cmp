import React from 'react'
import { Table, Button } from 'antd'
import { Link } from 'react-router-dom'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'
import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'

const subModule = 'userList'

const { USERORIGIN, PAGINATION: SIZE, USER_LIST_TAB_TABLE } = CONSTANTS

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
      isFushikang: false
    }
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
    this.checkSchoolFsk()
  }
  syncStateWithProps = props => {
    let { list_selectKey: selectKey } = props || this.props
    const nextState = {}
    if (selectKey !== this.state.searchingText) {
      nextState.searchingText = selectKey
    }
    this.setState(nextState)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'list_page',
        'schoolId',
        'schools',
        'list_selectKey',
        'list_userTransfer'
      ])
    ) {
      return
    }
    this.fetchData(nextProps)
    this.syncStateWithProps(nextProps)
    this.checkSchoolFsk(nextProps)
  }
  changeSchool = value => {
    let { schoolId, tabIndex } = this.props
    if (schoolId === value) {
      return
    }
    const data = { schoolId }
    if (tabIndex === USER_LIST_TAB_TABLE) {
      data.list_page = 1
    } else {
      data.analyze_page = 1
    }
    this.props.changeUser(subModule, data)
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
  getColumns = () => {
    const { forbiddenStatus } = this.props
    const { USER_INFO_DETILE } = forbiddenStatus
    const columns = [
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
              {USER_INFO_DETILE ? null : (
                <Link to={`/user/userInfo/:${record.id}`}>详情</Link>
              )}
            </span>
          </div>
        )
      }
    ]
    const { isFushikang } = this.state
    if (isFushikang) {
      columns.unshift(
        {
          title: '工号',
          dataIndex: 'userNo',
          className: 'firstCol'
        },
        {
          title: '姓名',
          dataIndex: 'userName'
        }
      )
    }
    return columns
  }
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.list_selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeUser(subModule, { list_page: 1, list_selectKey: v })
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
    this.props.changeUser(subModule, { list_page: page })
  }
  changeUserTransfer = v => {
    let { list_userTransfer: userTransfer } = this.props
    if (userTransfer === v) {
      return
    }
    this.props.changeUser(subModule, { list_page: 1, list_userTransfer: v })
  }

  render() {
    const { dataSource, total, loading, searchingText } = this.state
    const { list_page: page, list_userTransfer: userTransfer } = this.props
    const showClearBtn = !!searchingText
    const columns = this.getColumns()
    return (
      <div className="">
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <span>用户类型:</span>
              <CheckSelect
                allOptValue="all"
                allOptTitle="全部"
                options={USERORIGIN}
                value={userTransfer}
                onClick={this.changeUserTransfer}
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
          <QueryLine>
            <QueryBlock />
            <QueryBlock>
              <span>总用户数: {total}</span>
            </QueryBlock>
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
            columns={columns}
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
