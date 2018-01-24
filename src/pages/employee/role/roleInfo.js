/* ----------- description --------- */
/* 1. authenStatus is build from props.full
   2. AuthenDataTable's 'authenStatus' is passed from state/authenStatus. 
      Each time changed in AuthenDataTable, change state/AuthenDataTable on hook of confirm.
*/

/* ----------- add privileges control (2018/1/8)---------- */

import React from 'react'
import { Button, Checkbox } from 'antd'
import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../component/constants'
import AuthenDataTable from '../../component/authenDataTable'
import {
  buildAuthenBaseOnfull,
  buildAuthenDataForServer
} from '../../util/authenDataHandle'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeEmployee, setAuthenData, setRoleList } from '../../../actions'

const CheckboxGroup = Checkbox.Group

class RoleInfo extends React.Component {
  static propTypes = {
    originalPrivileges: PropTypes.array.isRequired,
    full: PropTypes.array.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      id: '',
      name: '',
      originalName: '',
      nameError: false,
      checking: false,
      posting: false,
      authenStatus: this.props.full || [],
      loginLimit: [CONSTANTS.LOGIN_CMP], // default choose cmp
      loginLimitError: false,
      functionLimit: [],
      functionLimitError: false
    }
  }
  fetchData = body => {
    let resource = '/api/role/one'
    const cb = json => {
      try {
        if (json.data) {
          let { name, privileges, loginLimit, functionLimit } = json.data
          let status = []
          privileges.forEach(p => {
            let r = this.props.originalPrivileges.find(o => o.id === p)
            if (r) {
              status.push(r)
            }
          })
          let authenStatus = buildAuthenBaseOnfull(this.props.full, status)
          let nextState = {
            name: name,
            originalName: name,
            authenStatus: authenStatus
          }
          if (loginLimit) {
            nextState.loginLimit = loginLimit
          }
          if (functionLimit) {
            nextState.functionLimit = functionLimit
          }
          this.setState(nextState)
        }
      } catch (e) {
        console.log(e)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    console.log(this.props.full)
    this.props.hide(false)
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body = {
        id: id
      }
      this.fetchData(body)
      this.setState({
        id: id
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  postData = () => {
    let {
      id,
      name,
      authenStatus,
      posting,
      loginLimit,
      functionLimit
    } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let resource
    let privileges = buildAuthenDataForServer(authenStatus)
    const body = {
      name: name,
      privileges: privileges,
      loginLimit: loginLimit
    }
    if (loginLimit.includes(CONSTANTS.LOGIN_LIGHT)) {
      body.functionLimit = functionLimit
    }
    if (id) {
      body.id = id
      resource = '/api/role/update'
    } else {
      resource = '/api/role/add'
    }
    const cb = json => {
      try {
        this.setState({
          posting: false
        })
        if (json.data.result) {
          this.updateRolesInStore()
          Noti.hintSuccess(this.props.history, '/employee/role')
        } else {
          Noti.hintWarning(null, json.data.failReason || '添加出错，请稍后重试')
        }
      } catch (e) {
        console.log(e)
      }
    }
    // console.log(body)
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
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
    const cb = json => {
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
    let { roles } = this.props
    let roleIds = roles.map(r => r.id)
    let resource = '/role/detail/list'
    const body = {
      ids: roleIds
    }
    const cb = json => {
      let { roles } = json.data
      this.props.setRoleList({
        rolePrivileges: roles,
        rolePrivilegesSet: true
      })
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  confirm = () => {
    let {
      name,
      originalName,
      id,
      checking,
      posting,
      loginLimit,
      functionLimit
    } = this.state
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    if (loginLimit.length < 1) {
      // at least one for loginLimit
      return this.setState({
        loginLimitError: true
      })
    }
    if (
      loginLimit.includes(CONSTANTS.LOGIN_LIGHT) &&
      functionLimit.length < 1
    ) {
      // at least one if choosed 'light'
      return this.setState({
        functionLimitError: true
      })
    }
    if (checking || posting) {
      return
    }
    // if edit and name is not changed, post directly
    if (id && name === originalName) {
      this.postData()
    } else {
      this.checkExist(this.postData)
    }
  }
  checkExist = (callback, state) => {
    console.log('checking')
    let { checking, name } = { ...this.state, state }
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
    const cb = json => {
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
    AjaxHandler.ajax(resource, body, cb, null, {
      clearChecking: true,
      thisObj: this
    })
  }
  changeName = e => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = e => {
    let m = e.target.value.trim()
    if (!m) {
      return this.setState({
        name: m,
        nameError: true
      })
    } else {
      this.checkExist(null, { name: m })
      this.setState({
        name: m,
        nameError: false
      })
    }
  }
  setAuthenStatus = status => {
    this.setState({
      authenStatus: JSON.parse(JSON.stringify(status))
    })
  }

  changeLoginLimit = v => {
    let nextState = {}
    if (v.length === 0) {
      return this.setState({
        loginLimitError: true
      })
    } else if (this.state.loginLimitError) {
      nextState.loginLimitError = false
    }
    nextState.loginLimit = v
    this.setState(nextState)
  }

  changeFunctionLimit = v => {
    let nextState = {}
    if (v.length === 0) {
      // if has right to control function block, hint error when functionLimit is empty.
      if (this.state.loginLimit.includes(CONSTANTS.LOGIN_LIGHT)) {
        return this.setState({
          functionLimitError: true
        })
      }
    } else if (this.state.functionLimitError) {
      nextState.functionLimitError = false
    }
    nextState.functionLimit = v
    this.setState(nextState)
  }
  render() {
    const {
      id,
      name,
      nameError,
      authenStatus,
      loginLimit,
      loginLimitError,
      functionLimit,
      functionLimitError
    } = this.state

    return (
      <div className="infoList roleInfo">
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
            {nameError ? (
              <span className="checkInvalid">名称不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>可登录环境:</p>
            <CheckboxGroup value={loginLimit} onChange={this.changeLoginLimit}>
              <Checkbox value={CONSTANTS.LOGIN_LIGHT}>运维端APP</Checkbox>
              <Checkbox value={CONSTANTS.LOGIN_CMP}>CMP管理后台</Checkbox>
            </CheckboxGroup>
            {loginLimitError ? (
              <span className="checkInvalid">请选择至少一个环境！</span>
            ) : null}
          </li>
          {loginLimit.includes(CONSTANTS.LOGIN_LIGHT) ? (
            <li>
              <p>运维端功能入口:</p>
              <CheckboxGroup
                value={functionLimit}
                onChange={this.changeFunctionLimit}
              >
                <Checkbox value={CONSTANTS.LIGHT_DEVICE}>设备管理</Checkbox>
                <Checkbox value={CONSTANTS.LIGHT_REPAIR}>报修管理</Checkbox>
                <Checkbox value={CONSTANTS.LIGHT_ORDER}>订单管理</Checkbox>
                <Checkbox value={CONSTANTS.LIGHT_STAT}>统计分析</Checkbox>
                <Checkbox value={CONSTANTS.LIGHT_FUND}>充值管理</Checkbox>
                <Checkbox value={CONSTANTS.LIGHT_NOTIFY}>公告管理</Checkbox>
              </CheckboxGroup>
              {functionLimitError ? (
                <span className="checkInvalid">请选择运维端权限！</span>
              ) : null}
            </li>
          ) : null}
          <li className="itemsWrapper">
            <p>CMP权限设置:</p>
          </li>
          <li className="itemsWrapper">
            <AuthenDataTable
              clickable={true}
              authenStatus={authenStatus}
              setStatus={this.setAuthenStatus}
            />
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.back}>返回</Button>
        </div>
        <div style={{ clear: 'both' }} />
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

export default withRouter(
  connect(mapStateToProps, {
    changeEmployee,
    setAuthenData,
    setRoleList
  })(RoleInfo)
)
