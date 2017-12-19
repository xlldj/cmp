/* ----------------------------权限列表----------------------------- */
/* ------------------------state description----------------------- */
/* 
*/

import React from 'react'
import { Link} from 'react-router-dom'
import { Table, Button, Popconfirm, Modal } from 'antd'
import Noti from '../../noti'
import AjaxHandler from '../../ajax'
import SearchLine from '../../component/searchLine'
import CONSTANTS from '../../component/constants'

import {checkObject} from '../../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../../actions'
const subModule = 'authenList'

const SIZE = CONSTANTS.PAGINATION
const TYPE = CONSTANTS.ROLE

class AuthenTable extends React.Component {
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
      title: '手机号',
      dataIndex: 'mobile',
      width: '25%',
      className: 'firstCol'
    }, {
      title: '姓名',
      dataIndex: 'nickName',
      width: '25%'
    }, {
      title: '身份',
      dataIndex: 'type',
      width: '25%',
      render: (text,record,index) => (
        TYPE[record.type]
      )
    }, {
      title: '操作',
      dataIndex: 'operation',
      className: 'lastCol',
      render: (text, record, index) => (
        <div style={{textAlign:'right'}} key={index} className='editable-row-operations'>
          <Link to={`/employee/list/detail/:${record.id}`} >编辑</Link>
          <span className='ant-divider' />
        <Popconfirm title="确定要删除此员工?" onConfirm={(e) => {this.delete(e, record.id, false)}} okText="确认" cancelText="取消">
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
    let resource='/api/employee/list'
    const cb = (json) => {
      let nextState = {loading: false}
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          nextState.dataSource =  json.data.users
          nextState.total = json.data.total
        }else{
          this.setState(nextState)
          throw new Error('网络出错，请稍后重试～')
        }      
      }
      this.setState(nextState)  
    }
    AjaxHandler.ajax(resource,body,cb, this.errorHandler)
  }
  errorHandler = () => {
    this.setState({
      loading: false
    })
  }
  componentDidMount(){
    this.props.hide(false)
    let {page, selectKey} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  componentWillReceiveProps (nextProps) {
    if (checkObject(this.props, nextProps, ['page', 'selectKey'])) {
      return
    }
    let {page, selectKey} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  delete = (e, id, force) => {
    if (e) {
      e.preventDefault()
    }
    let {deletingId} = this.state
    if (deletingId !== id) {
      this.setState({
        deletingId: id
      })
    }
    let resource='/employee/delete'
    const body={
      id: id,
      force: force 
    }
    const cb = (json) => {
      let nextState = {}
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          let {result, failReason} = json.data
          // if account has remainder, and this delete if first time.
          if (result === false && force === false) { // account has remainder
            nextState.hintDeleteModal = true
          } else if (result === false) { // service error, unknown reason
            Noti.hintWarning('删除出错', failReason || '请稍后重新尝试')
          } else { // delete success
            const body={
              page: this.props.page,
              selectKey: this.props.selectKey,
              size: SIZE
            }
            this.fetchData(body)
          }
        } else { // this should not happen
          Noti.hintError()
        }
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource,body,cb)    
  }
  forceDelete = () => {
    this.delete(null, this.state.deletingId, true)
    this.setState({
      hintDeleteModal: false
    })
  }
  cancelDelete = () => {
    this.setState({
      hintDeleteModal: false
    })
  }
  back = (e) => {
    this.props.history.goBack()
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeEmployee(subModule, {page: page})
  }

  render () {
    const {dataSource, total, loading, hintDeleteModal} = this.state
    const {page} = this.props

    return (
      <div className='contentArea'>
        <SearchLine addTitle='添加权限点' addLink='/employee/authen/add'  />

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
          <div className='btnRight'>
            <Button onClick={this.back}>返回</Button>
          </div>
        <Modal
          title='账户还有余额'
          visible={hintDeleteModal}
          onOk={this.forceDelete}
          onCancel={this.cancelDelete}
          maskClosable={true}
          className='popupModal'
        >
          <span>
            当前账户还有余额，您可以提取余额后再删除。确定不提取直接删除么？
          </span>
        </Modal>

      </div>
    )
  }
}



const mapStateToProps = (state, ownProps) => ({
  page: state.changeEmployee[subModule].page
})

export default withRouter(connect(mapStateToProps, {
 changeEmployee 
})(AuthenTable))
