import React from 'react'
import { Link } from 'react-router-dom'
import { asyncComponent } from '../../component/asyncComponent'

import { Table, Popconfirm } from 'antd'

import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import Time from '../../../util/time'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../../constants'
const SIZE = CONSTANTS.PAGINATION

//const Table = asyncComponent(() => import(/* webpackChunkName: "table" */ "antd/lib/table"))
//const Button = asyncComponent(() => import(/* webpackChunkName: "button" */ "antd/lib/button"))
//const Popconfirm = asyncComponent(() => import(/* webpackChunkName: "popconfirm" */ "antd/lib/popconfirm"))
//const Modal = asyncComponent(() => import(/* webpackChunkName: "modal" */ "antd/lib/modal"))

class PriceTable extends React.Component {
  constructor(props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      page: 1,
      total: 0
    }
    this.columns = [
      {
        title: '学校',
        className: 'firstCol',
        dataIndex: 'schoolName',
        width: '25%'
      },
      {
        title: '水量单价',
        dataIndex: 'money',
        width: '25%',
        render: (text, record, index) => `${record.money}元／${record.amount}L`
      },
      {
        title: '创建时间',
        dataIndex: 'updateTime',
        width: '25%',
        render: (text, record, index) => Time.getTimeStr(record.updateTime)
      },
      {
        title: '操作',
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/price/detail/:${record.id}`}>编辑</Link>
              <span className="ant-divider" />
              <Popconfirm
                title="确定要禁用此单价么?"
                onConfirm={e => {
                  this.delete(e, index)
                }}
                okText="确认"
                cancelText="取消"
              >
                <a href="#">禁用</a>
              </Popconfirm>
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
    let resource = '/device/prepay/function/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试～'
        }
      } else {
        if (json.data) {
          nextState.dataSource = json.data.prepayFunctions
          nextState.total = json.data.total
        } else {
          throw {
            title: '请求出错',
            message: '网络出错，请稍后重试～'
          }
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    const body = {
      page: 1,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  delete = (e, index) => {
    e.preventDefault()
    let resource = '/api/device/prepay/function/delete'
    const body = {
      id: this.state.dataSource[index].id
    }
    const cb = json => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络出错，请稍后重试～'
        }
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const body = {
            page: this.state.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintLock('当前项不能被禁用', '请咨询相关人员！')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.setState({
      page: page,
      loading: true
    })
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  render() {
    let { loading, page, total } = this.state

    return (
      <div className="contentArea">
        <SearchLine addTitle="添加水量单价" addLink="/device/price/addPrice" />

        <div className="tableList">
          <Table
            bordered
            loading={loading}
            rowKey={record => record.id}
            pagination={{ pageSize: SIZE, current: page, total: total }}
            onChange={this.changePage}
            dataSource={this.state.dataSource}
            columns={this.columns}
          />
        </div>
      </div>
    )
  }
}

export default PriceTable
