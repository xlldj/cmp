/* ----------------------------角色列表----------------------------- */
/* ------------------------state description----------------------- */
/* 
*/

import React from 'react'
import { Link} from 'react-router-dom'
import { Table, Popconfirm} from 'antd'
import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'

import {checkObject} from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../../actions'
const subModule = 'roleList'

const SIZE = CONSTANTS.PAGINATION

class RoleTable extends React.Component {
  static propTypes = {
    page: PropTypes.number.isRequired
  }
  constructor(props){
    super(props)
    this.state = {
      dataSource: [],
      searchingText: '',
      loading: false,
      total: '',
      deletingId: '',
      hintDeleteModal: false
    }
    this.columns = [{
      title: '角色',
      dataIndex: 'name',
      width: '75%',
      className: 'firstCol'
    }, {
      title: '操作',
      dataIndex: 'operation',
      className: 'lastCol',
      width: '100',
      render: (text, record, index) => (
        <div style={{textAlign:'right'}} key={index} className='editable-row-operations'>
          <Link to={`/employee/role/detail/:${record.id}`} >编辑</Link>
          <span className='ant-divider' />
          <Popconfirm title="确定要删除此角色?" 
            onConfirm={(e) => {this.delete(e, record.id)}} okText="确认" cancelText="取消">
            <a href="">删除</a>
          </Popconfirm>
        </div>
      )
    }]
  }
  fetchData = (body) => {
    this.setState({
      loading: true
    })
    let resource='/role/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if (json.data) {
        nextState.dataSource =  json.data.users
        nextState.total = json.data.total
      }     
      this.setState(nextState)  
    }
    AjaxHandler.ajax(resource,body,cb, null, {clearLoading: true, thisObj: this})
  }
  componentDidMount(){
    this.props.hide(false)
    let {page} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  componentWillUnmount () {
    // this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page'])) {
      return
    }
    let {page} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    this.fetchData(body)
  }
  delete = (e, id) => {
    if (e) {
      e.preventDefault()
    }
    let resource='/role/delete'
    const body={
      id: id
    }
    const cb = (json) => {
      let nextState = {}
      if (json.data) {
        let {result, failReason} = json.data
        if (result === false) { // service error, unknown reason
          Noti.hintWarning('删除出错', failReason || '请稍后重新尝试')
        } else { // delete success
          const body={
            page: this.props.page,
            size: SIZE
          }
          this.fetchData(body)
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  back = (e) => {
    this.props.history.goBack()
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeEmployee(subModule, {page: page})
  }

  render () {
    const {dataSource, total, loading} = this.state
    const {page} = this.props

    return (
        <div className='contentArea'>
          <SearchLine addTitle='添加身份' addLink='/employee/role/add'  />

          <div className='tableList'>
            <Table 
              bordered
              loading={loading}
              rowKey={(record)=>(record.id)} 
              pagination={{pageSize: SIZE, current: page, total: total}}  
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
  page: state.changeEmployee[subModule].page
})

export default withRouter(connect(mapStateToProps, {
 changeEmployee 
})(RoleTable))
