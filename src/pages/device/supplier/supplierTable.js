import React from 'react'
import { Link } from 'react-router-dom'

import { Table, Popconfirm } from 'antd'

import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeDevice } from '../../../actions'
const subModule = 'suppliers'

const SIZE = CONSTANTS.PAGINATION

class SupplierTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor(props) {
    super(props)
    const dataSource = []
    this.state = {
      dataSource: dataSource,
      loading: false,
      total: 0
    }
    this.columns = [
      {
        title: <p className="firstCol">供应商名字</p>,
        dataIndex: 'name',
        width: '35%',
        render: text => <p className="firstCol">{text}</p>
      },
      {
        title: '别名',
        dataIndex: 'alias',
        width: '35%',
        render: text => text || '未知'
      },
      {
        title: <p className="lastCol">操作</p>,
        dataIndex: 'operation',
        render: (text, record, index) => (
          <div className="editable-row-operations lastCol">
            <span>
              <Link to={`/device/suppliers/info/:${record.id}`}>编辑</Link>
              <span className="ant-divider" />
              <Popconfirm
                title="确定要删除此么?"
                onConfirm={e => {
                  this.delete(e, record.id)
                }}
                okText="确认"
                cancelText="取消"
              >
                <a href="">删除</a>
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
    let resource = '/supplier/query/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const data = json.data.supplierEntities.map((s, i) => {
            s.key = s.id
            return s
          })
          nextState.dataSource = data
          nextState.total = json.data.total
        } else {
          this.setState(nextState)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    const body = {
      page: this.props.page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    let { page } = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  delete = (e, id) => {
    e.preventDefault()
    let resource = '/api/supplier/delete'
    const body = {
      id: id
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        } else {
          Noti.hintError('当前供应商不能被删除', '请先清除该供应商设备再删除！')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeDevice(subModule, { page: page })
  }
  render() {
    let { loading, total } = this.state
    let { page } = this.props

    return (
      <div className="contentArea">
        <SearchLine addTitle="添加供应商" addLink="/device/suppliers/addInfo" />

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

const mapStateToProps = (state, ownProps) => ({
  page: state.changeDevice[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeDevice
  })(SupplierTable)
)
