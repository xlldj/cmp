import React from 'react'
import { Table, Button, Popconfirm } from 'antd'
import Time from '../../../util/time'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import { checkObject } from '../../../util/checkSame'

import SearchInput from '../../component/searchInput'
import CheckSelect from '../../component/checkSelect'
import { QueryPanel, QueryLine, QueryBlock } from '../../component/query'
import { safeGet } from '../../../util/types'
import Noti from '../../../util/noti'

const subModule = 'userList'

const {
  PAGINATION: SIZE,
  COMPANY_USER_AHTH_PENDING,
  COMPANY_USER_AUTH_STATUS
} = CONSTANTS

class FoxconnListView extends React.Component {
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
        title: '员工姓名',
        dataIndex: 'userName',
        className: 'firstCol',
        width: '20%'
      },
      {
        title: '工号',
        dataIndex: 'userNo',
        width: '20%'
      },
      {
        title: '手机号(登陆账号)',
        dataIndex: 'mobile',
        width: '20%'
      },
      {
        title: '绑定时间',
        dataIndex: 'authTime',
        width: '20%',
        render: (text, record) => {
          if (record.auth === COMPANY_USER_AHTH_PENDING) {
            return '未绑定'
          }
          return record.authTime ? Time.getTimeStr(record.authTime) : '未知'
        }
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => {
          if (record.auth === COMPANY_USER_AHTH_PENDING) {
            return
          } else {
            return (
              <div className="editable-row-operations lastCol">
                <Popconfirm
                  title="确定要解绑么?"
                  onCancel={null}
                  onConfirm={e => this.deAuth(e, record.id)}
                >
                  <a
                    onClick={e => {
                      e.preventDefault()
                    }}
                  >
                    解除绑定
                  </a>
                </Popconfirm>
              </div>
            )
          }
        }
      }
    ]
  }
  deAuth = (e, id) => {
    const resource = '/api/user/deauth'
    const body = {
      id
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (safeGet(json, 'data')) {
        if (json.data.result) {
          Noti.hintOk('解绑成功', '已成功解绑该用户')
          this.fetchData()
        } else {
          const { failReason } = json.data
          Noti.hintWarning(
            '解绑失败',
            failReason || json.data.displayMessage || '请稍后重试'
          )
        }
      }
    })
  }
  fetchData = props => {
    if (this.state.loading) {
      return
    }
    this.setState({
      loading: true
    })
    const resource = '/api/user/auth/list'
    const {
      foxconn_selectKey: selectKey,
      foxconn_page: page,
      foxconn_auth: auth
    } =
      props || this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (auth !== 'all') {
      body.auth = +auth
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
    let { foxconn_selectKey } = props || this.props

    const nextState = {}
    if (foxconn_selectKey !== this.state.searchingText) {
      nextState.searchingText = foxconn_selectKey
    }
    this.setState(nextState)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(this.props, nextProps, [
        'foxconn_page',
        'foxconn_selectKey',
        'foxconn_auth'
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
    let selectKey = this.props.foxconn_selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeUser(subModule, { foxconn_page: 1, foxconn_selectKey: v })
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
    this.props.changeUser(subModule, { foxconn_page: page })
  }

  changeAuth = value => {
    let { foxconn_auth: auth } = this.props
    if (value === auth) {
      return
    }
    this.props.changeUser(subModule, {
      foxconn_auth: value,
      analyze_page: 1
    })
  }

  render() {
    const { dataSource, total, loading, searchingText } = this.state
    const { foxconn_page: page, foxconn_auth: auth } = this.props
    const showClearBtn = !!searchingText

    return (
      <div className="">
        <QueryPanel>
          <QueryLine>
            <QueryBlock>
              <span>是否绑定:</span>
              <CheckSelect
                allOptValue="all"
                allOptTitle="不限"
                options={COMPANY_USER_AUTH_STATUS}
                value={auth}
                onClick={this.changeAuth}
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
                placeholder="手机号/工号/姓名"
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

export default FoxconnListView
