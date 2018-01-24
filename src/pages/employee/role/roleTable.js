/* ----------------------------角色列表----------------------------- */
/* ------------------------state description----------------------- */
/* 
*/

import React from 'react'
import { Link } from 'react-router-dom'
import { Table, Popconfirm } from 'antd'
import Noti from '../../../util/noti'
import AjaxHandler from '../../../util/ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'

import { checkObject } from '../../../util/checkSame'
import { add, mul } from '../../../util/numberHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee, setRoleList } from '../../../actions'
const subModule = 'roleList'

const SIZE = CONSTANTS.PAGINATION

class RoleTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired,
    roles: PropTypes.array.isRequired,
    rolesSet: PropTypes.bool.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      dataSource: [],
      searchingText: '',
      loading: false,
      total: '',
      deletingId: '',
      hintDeleteModal: false
    }
    this.columns = [
      {
        title: '身份',
        dataIndex: 'name',
        width: '75%',
        className: 'firstCol'
      },
      {
        title: '操作',
        dataIndex: 'operation',
        className: 'lastCol',
        width: '100',
        render: (text, record, index) => (
          <div
            style={{ textAlign: 'right' }}
            key={index}
            className="editable-row-operations"
          >
            <Link to={`/employee/role/detail/:${record.id}`}>编辑</Link>
            <span className="ant-divider" />
            <Popconfirm
              title="确定要删除此角色?"
              onConfirm={e => {
                this.delete(e, record.id)
              }}
              okText="确认"
              cancelText="取消"
            >
              <a href="">删除</a>
            </Popconfirm>
          </div>
        )
      }
    ]
  }
  fetchData = body => {
    this.setState({
      loading: true
    })
    let resource = '/role/list'
    const cb = json => {
      let nextState = { loading: false }
      if (json.data) {
        this.props.setRoleList({
          roles: json.data.roles,
          rolesSet: true
        })
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearLoading: true,
      thisObj: this
    })
  }
  setData = () => {
    let { page, roles } = this.props
    console.log(roles)
    let total = roles.length
    let start = mul(page - 1, SIZE)
    let end = add(start, SIZE) > total ? total : add(start, SIZE)
    let data = roles.slice(start, end)
    console.log(data)
    this.setState({
      dataSource: data,
      total: total
    })
  }
  componentDidMount() {
    this.props.hide(false)
    let { rolesSet } = this.props
    if (rolesSet) {
      this.setData()
    } else {
      const body = {
        page: 1,
        size: 10000
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    // this.props.hide(true)
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'roles', 'rolesSet'])) {
      return
    }
    console.log(nextProps)

    let { rolesSet } = nextProps
    if (rolesSet) {
      this.props = nextProps
      this.setData()
    } else {
      const body = {
        page: 1,
        size: SIZE
      }
      this.fetchData(body)
    }
  }
  delete = (e, id) => {
    if (e) {
      e.preventDefault()
    }
    let resource = '/role/delete'
    const body = {
      id: id
    }
    const cb = json => {
      let nextState = {}
      if (json.data) {
        let { result, failReason } = json.data
        if (result === false) {
          // service error, unknown reason
          Noti.hintWarning('删除出错', failReason || '请稍后重新尝试')
        } else {
          // delete success
          const body = {
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  back = e => {
    this.props.history.goBack()
  }
  changePage = pageObj => {
    let page = pageObj.current
    this.props.changeEmployee(subModule, { page: page })
  }

  render() {
    const { dataSource, total, loading } = this.state
    const { page } = this.props

    return (
      <div className="contentArea">
        <SearchLine addTitle="添加身份" addLink="/employee/role/add" />

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

const mapStateToProps = (state, ownProps) => ({
  roles: state.setRoleList.roles,
  rolesSet: state.setRoleList.rolesSet,
  page: state.changeEmployee[subModule].page
})

export default withRouter(
  connect(mapStateToProps, {
    changeEmployee,
    setRoleList
  })(RoleTable)
)
