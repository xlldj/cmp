/* ----------- description --------- */
/* 1. authenStatus is build from props.full
   2. AuthenDataTable's 'authenStatus' is passed from state/authenStatus. 
      Each time changed in AuthenDataTable, change state/AuthenDataTable on hook of confirm.
*/

import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import AuthenDataTable from '../../component/authenDataTable'
import {buildAuthenBaseOnfull, buildAuthenDataForServer} from '../../util/authenDataHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee, setAuthenData, setRoleList } from '../../../actions'

class RoleInfo extends React.Component {
  static propTypes = {
    originalPrivileges: PropTypes.array.isRequired,
    full: PropTypes.array.isRequired
  }
  constructor (props) {
    super(props)
    this.state = {
      id: '',
      name: '',
      originalName: '',
      nameError: false,
      checking: false,
      posting: false,
      authenStatus: this.props.full || []
    }
  }
  fetchData = (body) => {
    let resource='/api/role/one'
    const cb = (json) => {
      try {
        if(json.data){
          let {name, privileges} = json.data
          let status = []
          privileges.forEach(p => {
            let r = this.props.originalPrivileges.find(o => o.id === p)
            if (r) {
              status.push(r)
            }
          })
          let authenStatus = buildAuthenBaseOnfull(this.props.full, status)
          this.setState({
            name: name,
            originalName: name,
            authenStatus: authenStatus 
          })
        }  
      } catch (e) {
        console.log(e)
      }     
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount () {
    console.log(this.props.full)
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body={
        id: id
      }
      this.fetchData(body)
      this.setState({
        id: id
      })
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  postData = () => {
    let {id, name, authenStatus, posting} = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let resource
    let privileges = buildAuthenDataForServer(authenStatus)
    const body={
      name: name,
      privileges: privileges
    }
    if(id){
      body.id = id
      resource ='/api/role/update'
    }else{
      resource = '/api/role/add'
    }
    const cb = (json) => {
      try {
        this.setState({
          posting: false
        })
        if (json.data.result) {
          this.updateRolesInStore()
          Noti.hintSuccess(this.props.history,'/employee/role')
        } else {
          Noti.hintWarning(null, json.data.failReason || '添加出错，请稍后重试')
        }
      } catch (e) {
        console.log(e)
      }     
    }
    // console.log(body)
    AjaxHandler.ajax(resource,body,cb, null, {clearPosting: true, thisObj: this})
  }
  updateRolesInStore = () => {
    this.props.setRoleList({
      rolesSet: false,
      rolePrivilegesSet: false
    })
    this.fetchRoles()
  }
  fetchRoles = () => {
    let resource = '/role/list'
    const body = {
      page: 1,
      size: 10000
    }
    const cb = (json) => {
      if (json.data.roles) {
        this.props.setRoleList({
          roles: json.data.roles,
          rolesSet: true
        })
        if (!this.props.rolePrivilegesSet) {
          this.fetchRolePrivileges()
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchRolePrivileges = () => {
    let {roles} = this.props
    let roleIds = roles.map(r => r.id)
    let resource = '/role/detail/list'
    const body = {
      ids: roleIds
    }
    const cb = (json) => {
      let {roles} = json.data
      this.props.setRoleList({
        rolePrivileges: roles,
        rolePrivilegesSet: true
      })
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  confirm = () => {
    let {name, originalName, id, checking, posting} = this.state
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    if (checking || posting) {
      return
    }
    // if edit and name is not changed, post directly
    if (id && (name === originalName)) {
      this.postData()
    } else {
      this.checkExist(this.postData)
    }
  }
  checkExist = (callback, state) => {
    console.log('checking')
    let {checking, name} = {...this.state, state}
    console.log(checking)
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/api/role/check'
    const body = {
      name: name
    }
    const cb = (json) => {
      const nextState = {
        checking: false
      }
      if (json.data.result) {
        Noti.hintWarning('', '该身份已存在于系统中!')
      } else {
        if (callback) {
          callback()
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb, null, {clearChecking: true, thisObj: this})
  }
  changeName = (e) => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = (e) => {
    let m = e.target.value.trim()
    if (!m) {
      return this.setState({
        name: m,
        nameError: true
      })
    } else {
      this.checkExist(null, {name: m})
      this.setState({
        name: m,
        nameError: false
      })
    }
  }
  setAuthenStatus = (status) => {
    this.setState({
      authenStatus: JSON.parse(JSON.stringify(status))
    })
  }
  render () {
    const {id, name, nameError, authenStatus} = this.state

    return (
      <div className='infoList roleInfo'>
        <ul>
          <li>
            <p>身份名称:</p>
            <input 
              disabled={id}
              className={id ? 'disabled' : ''} 
              onChange={this.changeName} 
              onBlur={this.checkName}
              value={name} 
            />
            { nameError ? <span className='checkInvalid'>名称不能为空！</span> : null }
          </li>
          <li className='itemsWrapper'>
            <p>权限设置:</p>
          </li>
          <li className='itemsWrapper'>
            <AuthenDataTable
              clickable={true}
              authenStatus={authenStatus}
              setStatus={this.setAuthenStatus}
            />
          </li>
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>返回</Button>
        </div>
        <div style={{clear:'both'}}></div>

      </div>
    )
  }
}


const mapStateToProps = (state, ownProps) => ({
  originalPrivileges: state.setAuthenData.originalPrivileges,
  full: state.setAuthenData.full,
  roles: state.setRoleList.roles,
  rolesSet: state.setRoleList.rolesSet,
  rolePrivilegesSet: state.setRoleList.rolePrivilegesSet
})

export default withRouter(connect(mapStateToProps, {
  changeEmployee,
  setAuthenData,
  setRoleList
})(RoleInfo))
