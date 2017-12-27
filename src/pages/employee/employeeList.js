/* 员工列表 */
/* 'force' in '/employee/delete': if force to delete. 
  1. false: no force, if account has remainder, pop a modal;
  2. true: force delete
*/
import React from 'react'
import { Link} from 'react-router-dom'
import { Table, Button, Popconfirm, Modal } from 'antd'
import Noti from '../noti'
import AjaxHandler from '../ajax'
import SearchLine from '../component/searchLine'
import CONSTANTS from '../component/constants'
import SchoolSelector from '../component/schoolSelector'

import {checkObject} from '../util/checkSame'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee } from '../../actions'
const subModule = 'employeeList'

const SIZE = CONSTANTS.PAGINATION
const BACKTITLE={
  fromInfoSet: '返回学校信息设置'
}

class EmployeeList extends React.Component {
  static propTypes = {
    selectKey: PropTypes.string.isRequired,
    page: PropTypes.number.isRequired,
    schoolId: PropTypes.string.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
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
      title: '登录账号',
      dataIndex: 'account',
      width: '15%',
      className: 'firstCol'
    }, {
      title: '手机号',
      dataIndex: 'contactMobile',
      width: '15%'
    }, {
      title: '姓名',
      dataIndex: 'nickName',
      width: '14%'
    }, {
      title: '身份',
      dataIndex: 'roles',
      width: '12%',
      render: (text, record) => {
        try {
          let roles = record.roles, type = record.type
          if (type === 2) {
            return '维修员'
          } else {
            let result = roles && roles.map(r => r.name)
            return result.join('、')
          }
        } catch (e) {
          console.log(e)
        }
      }
    }, {
      title: '学校',
      dataIndex: 'schools',
      width: '30%',
      render: (text, record) => {
        try {
          if (record.schoolLimit) {
            let schools = record.schools
            let result = schools && schools.map((r, i) => {
              if (i === schools.length - 1) {
                return r.name
              } else {
                return  r.name + ','
              }
            })
            return result
          } else {
            return '不限制学校'
          }
        } catch (e) {
          console.log(e)
        }
      }
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
      if (json.data) {
        nextState.dataSource =  json.data.users
        nextState.total = json.data.total
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
    let {page, selectKey, schoolId} = this.props
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
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
    if (checkObject(this.props, nextProps, ['page', 'selectKey', 'schoolId'])) {
      return
    }
    let {page, selectKey, schoolId} = nextProps
    const body = {
      page: page,
      size: SIZE
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.fetchData(body)
    this.setState({
      searchingText: selectKey
    })
  }
  delete = (e, id, force) => {
    if (this.props.DELETE_EMPLOYEE) {
      return Noti.hintWarning('', '您没有权限进行此操作')
    }
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
  pressEnter = () => {
    let v = this.state.searchingText.trim()
    this.setState({
      searchingText: v
    })
    let selectKey = this.props.selectKey
    if (v === selectKey) {
      return
    }
    this.props.changeEmployee(subModule, {page: 1, selectKey: v})
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value
    })
  }
  back = (e) => {
    this.props.history.goBack()
  }
  changePage = (pageObj) => {
    let page = pageObj.current
    this.props.changeEmployee(subModule, {page: page})
  }
  changeSchool = (value) => {
    let {schoolId} = this.props
    if (schoolId === value) {
      return
    }
    this.props.changeEmployee(subModule, {page: 1, schoolId: value})
  }

  render () {
    const {dataSource,searchingText, total, loading, hintDeleteModal} = this.state
    const {page, schoolId} = this.props

    return (
      <div className='contentArea'>
        <SearchLine 
          addTitle='添加新员工' 
          addLink='/employee/list/add' 
          searchInputText='身份／姓名／手机号' 
          searchingText={searchingText} 
          pressEnter={this.pressEnter} 
          changeSearch={this.changeSearch} 
          selector1={<SchoolSelector selectedSchool={schoolId} changeSchool={this.changeSchool} />}
        />

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
        {this.props.location.state ?
          <div className='btnRight'>
            <Button onClick={this.back}>{BACKTITLE[this.props.location.state.path]}</Button>
          </div>
          :null
        }
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
  selectKey: state.changeEmployee[subModule].selectKey,
  page: state.changeEmployee[subModule].page,
  schoolId: state.changeEmployee[subModule].schoolId,
  forbiddenStatus: state.setAuthenData.forbiddenStatus
})

export default withRouter(connect(mapStateToProps, {
 changeEmployee 
})(EmployeeList))
