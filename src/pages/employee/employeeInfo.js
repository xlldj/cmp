/* ---------------- state description --------------- */
/* 
   temporary change: 
     distinguish 'maintainer' and other roles.
     use 'type' to differ. type: {2: maintainer,  3: other roles} 
*/
/* state:
    1. 'roleData' is the data for role-select-modal, before post, filter items whose 'selected' is true.
       Thus build roleData from server:'roles' when edit employee.
    2. 'selectedSchools' is all the schools selected from school-select-modal. When allSchools is true, this will be ignored.
    3. 'allSchools' hints if selected all schools. Corresponding to server: 'schoolLimit'.
    4. 'authenStatus' is used to show privileges in authenDataTble. Build as below described. 
*/
/* status construction: 
    1. Get all roles. If store/roles is not set, fetch all roles.
    2. Get all privileges of roles. If store/rolePrivileges is not set, fetch all privileges of roles.
    3. Fetch data when edit. When got data, set 'authenStatus' based on its roles.
    4. Each time roles are reselected, reset the privileges-table. When setting, disable roles-select.
*/

import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../ajax'
import Noti from '../noti'
import {setStore, getStore} from '../util/storage'
import MultiSelectModal from '../component/multiSelectModal'
import SchoolMutilSelect from '../component/schoolMultiSelectModal'
import AuthenDataTable from '../component/authenDataTable'
import {buildAuthenBaseOnfull} from '../util/authenDataHandle'
import BasicSelector from '../component/basicSelectorWithoutAll'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { setAuthenData, setRoleList } from '../../actions'

const TYPES = {
  2: '维修员',
  3: '其他'
}

const backTitle = {
  fromFund: '返回资金详情'
}
class EmployeeInfo extends React.Component {
  static propTypes = {
    schools: PropTypes.array.isRequired,
    full: PropTypes.array.isRequired,
    originalPrivileges: PropTypes.array.isRequired,
    roles: PropTypes.array.isRequired,
    rolesSet: PropTypes.bool.isRequired,
    rolePrivileges: PropTypes.array.isRequired,
    rolePrivilegesSet: PropTypes.bool.isRequired
  }
  constructor (props) {
    super(props)
    let id='',contactMobile='',nickName='', mobileError=false,nameError=false,nameErrorMessage='', showSchools=false
    let mobileErrorMessage = '手机号格式不正确', originalMobile = 0, schoolError = false
    this.state = {
      id,
      contactMobile,
      nickName,mobileError,mobileErrorMessage, nameError,
      nameErrorMessage, originalMobile, 
      showSchools, schoolError,
      account: '',
      accountError: false,
      roleError: false,
      showRoleModal: false,
      roleData: props.roles,
      allSchools: false,
      schoolLimit: true,
      selectedSchools: [],
      authenStatus: [],
      posting: false,
      checking: false, 
      type: ''
    }
    this.roleColumns = [{
      title: '身份',
      dataIndex: 'name',
      width: '75%'
    }]
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
        let roleData = json.data.roles.map((role) => {
          role.value = role.name
          role.selected = false
          return role
        })
        this.setState({
          roleData: roleData
        })
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchData = (body) => {
    let resource='/api/employee/one'
    const cb = (json) => {
      if(json.data){
        let {id, contactMobile, account, schoolLimit, roles, type, nickName, schools} = json.data
        let nextState = {
          id: id,
          account: account,
          schoolLimit: schoolLimit,
          contactMobile: contactMobile,
          nickName: nickName,
          originalMobile: contactMobile,
          type: type
        }
        let selectedSchools = [] 
        schools.forEach(s => {
          let school = this.props.schools.find(sch => sch.id === s.id)
          if (school) {
            selectedSchools.push(school)
          }
        })
        nextState.selectedSchools = selectedSchools
        let roleData = JSON.parse(JSON.stringify(this.props.roles))
        if (roles) {
          roles.forEach(r => {
            let role = roleData.find(ro => ro.id === r)
            if (role) {
              role.selected = true
            }
          })
          nextState.roleData = roleData
          // this should always exist
          this.buildPrivileges(roles)
        }

        this.setState(nextState)
      }       
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  buildPrivileges = (roles) => {
    // get all privileges from roles and privileges of roles
    let {rolePrivileges, originalPrivileges} = this.props
    let currentPrivileges = []
    if (rolePrivileges) {
      roles.forEach(r => {
        let rolePrivilege = rolePrivileges.find(rp => rp.id === r)
        if (rolePrivilege && rolePrivilege.privileges) {
          rolePrivilege.privileges.forEach(priviId => {
            let found = currentPrivileges.find(a => a.id === priviId)
            if (!found) {
              let privilege = originalPrivileges.find(o => o.id === priviId)
              if (privilege) {
                currentPrivileges.push(privilege)
              }
            }
          })
        }
      })
    }
    let authenStatus = buildAuthenBaseOnfull(this.props.full, currentPrivileges)
    this.setState({
      authenStatus: authenStatus 
    })
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
      this.checkIfFetchData()
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  checkIfFetchData = () => {
    // if edit, get the info
    if(this.props.match.params.id){
      let id = this.props.match.params.id.slice(1) 
      const body={
        id: parseInt(id, 10)
      }
      this.fetchData(body)
    }
  }
  componentDidMount () {
    this.props.hide(false)
    // get all the roles
    let {rolesSet, rolePrivilegesSet} = this.props
    if (rolesSet) {
      if (!rolePrivilegesSet) {
        this.fetchRolePrivileges()
      } else {
        this.checkIfFetchData()
      }
    } else {
      this.fetchRoles()
    }
    if (this.props.full) {
      this.setState({
        authenStatus: this.props.full
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
    let {account, contactMobile, nickName, roleData, id, selectedSchools, schoolLimit, posting} = this.state
    let type = parseInt(this.state.type, 10)
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let resource = '/api/employee/add'
    const body={
      account: account,
      contactMobile: contactMobile,
      name: nickName,
      type: type,
      schoolLimit: schoolLimit
    }
    if (schoolLimit) {
      body.schoolIds = selectedSchools.map(s => s.id)
    }
    if (type === 3) {
      let selectedRoles = roleData.filter(r => r.selected === true)
      body.roles = selectedRoles.map(r => r.id)
    }
    if (id) {
      body.id = id
      resource ='/api/employee/update'
    }
    console.log(body)
    const cb = (json) => {
      this.setState({
        posting: false
      })
      if(json.error){
        Noti.hintServiceError(json.error.displayMessage)
      }else{
        /*--------redirect --------*/
        if(json.data){
          if (this.state.id) {
            let id = this.state.id
            let currentId = parseInt(getStore('userId'), 10)
            if (id === currentId) {
              // change userName in sessionStorage and state
              setStore('username', nickName)
              this.props.changeCurrentName(nickName)
            }
          }
          Noti.hintSuccess(this.props.history,'/employee')
        }       
      }
    }
    AjaxHandler.ajax(resource,body,cb, null, {clearPosting: true, thisObj: this})
  }
  confirm = () => {
    let {account, schoolLimit, type, roleData, selectedSchools} = this.state
    if (!account) {
      return this.setState({
        accountError: true
      })
    }
    let m = this.state.contactMobile
    if (!m) {
      return this.setState({
        mobileError: true,
        mobileErrorMessage: '手机号不能为空'
      })
    }
    /*if(!/^1[3|4|5|7|8][0-9]{9}$/.test(m)){
      return this.setState({
        mobileError: true,
        mobileErrorMessage: '手机号格式不正确！'
      })
    }*/
    let n = this.state.nickName
    if(!n){
      return this.setState({
        nameError: true,
        nameErrorMessage: '名字不能为空！'
      })
    }
    if (!type) {
      return this.setState({
        typeError: true
      })
    }
    if (parseInt(type, 10) === 3) {
      let r = roleData.filter(r => r.selected === true)
      if (!r || r.length === 0) {
        return this.setState({
          roleError: true
        })
      }
    }
    if (schoolLimit && (selectedSchools.length === 0)) {
      return this.setState({
        schoolError: true
      })
    }
    let {checking, posting} = this.state
    if (checking || posting) {
      return
    }
    this.postData()
  }
  changeMobile = (e) => {
    this.setState({
      contactMobile:e.target.value.trim()
    })
  }
  checkMobile = () => {
    let m = this.state.contactMobile
    if(!/^1[3|4|5|7|8][0-9]{9}$/.test(m)){
      return this.setState({
        mobileError: true,
        mobileErrorMessage: '手机号格式不正确！'
      })
    }else{
      this.setState({
        mobileError: false
      })
    }
  }
  checkExist = (callback) => {
    let {contactMobile, checking} = this.state
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/api/user/contactMobile/check'
    const body = {
      contactMobile: parseInt(contactMobile, 10)
    }
    const cb = (json) => {
      const nextState = {
        checking: false
      }
      if (json.data) {
        if (json.data.result) {
          nextState.mobileError = true
          nextState.mobileErrorMessage = '该手机号已注册！'
        } else {
          if (callback) {
            callback()
          }
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeName = (e) => {
    this.setState({
      nickName: e.target.value
    })
  }
  checkName = (e) => {
    let m = e.target.value.trim()
    if(!m){
      return this.setState({
        nickName: m,
        nameError: true,
        nameErrorMessage: '名字不能为空！'
      })
    }else{
      this.setState({
        nickName: m,
        nameError: true,
        nameErrorMessage: ''
      })
    }
  }
  setSchools = (data) => {
    let selectedSchools = []
    let nextState = {
      showSchools: false,
      schoolLimit: true
    }
    let {dataSource} = data
    dataSource.forEach((r,i)=>{
      if(r.selected){
        selectedSchools.push({
          id: r.id,
          name: r.name
        })
      }
    })
    nextState.selectedSchools = selectedSchools
    if (selectedSchools.length === 0) {// 选择了0个学校，报错
      nextState.schoolError = true
    } else if (this.state.schoolError) {// 清空报错
      nextState.schoolError = false
    }

    this.setState(nextState)
  }
  showSchools = (e) => {
    e.preventDefault()
    this.setState({
      showSchools: true
    })
  }
  closeSchool = () => {
    let {selectedSchools} = this.state, nextState = {showSchools: false}
    if (selectedSchools.length === 0) {
      nextState.schoolError = true
    }
    this.setState(nextState)
  }
  buildAccount = () => {
    // get an account
    let resource = '/employee/account/auto/one'
    const body = null
    const cb = (json) => {
      if (json.data.account) {
        let nextState = {
          account: json.data.account
        }
        if (this.state.accountError) {
          nextState.accountError = false
        }
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  showRoleModal = (e) => {
    e.preventDefault()
    this.setState({
      showRoleModal: true
    })
  }
  setRoleItems = (data) => {
    let roleData = JSON.parse(JSON.stringify(data))
    let nextState = {
      roleData: roleData,
      showRoleModal: false,
      schoolLimit: false
    }
    let roles = roleData.filter(r => r.selected === true)
    if (roles.length === 0) {
      nextState.roleError = true
    } else if (this.state.roleError) {
      nextState.roleError = false
    }
    this.setState(nextState)
    let roleIds = roles.map(r => r.id)
    this.buildPrivileges(roleIds)
  }
  closeRoleSelect = () => {
    let nextState = {
      showRoleModal: false
    }
    let {roleData} = this.state
    let roles = roleData.filter(r => r.selected === true)
    if (roles.length === 0) {
      nextState.roleError = true
    }
    this.setState(nextState)
  }
  changeType = (value) => {
    let v = parseInt(value, 10), nextState = {}
    if (v) {
      nextState.type = value
      if (v === 3) {
        nextState.showRoleModal = true
      }
      if (this.state.typeError) {
        nextState.typeError = false
      }
    }
    this.setState(nextState)
  }
  clearSchoolLimit = () => {
    this.setState({
      schoolLimit: false,
      showSchools: false
    })
  }

  render () {
    const {id, 
      account, accountError,
      nickName,nameError,nameErrorMessage,
      contactMobile, mobileError, mobileErrorMessage,
      roleError, showRoleModal, roleData,
      showSchools, schoolError, selectedSchools, schoolLimit,
      authenStatus,
      typeError
    } = this.state
    let type = parseInt(this.state.type, 10)
    const selectedSchoolItems = selectedSchools && selectedSchools.map((r,i)=>(
      <span key={i}>{r.name}</span>
    ))
    const selectedRoleItems = roleData && roleData.map((r, i) => {
      return (<span key={i}>{r.selected ? r.name: ''}</span>)
    })

    /* formal role select:
    <li>
      <p>员工身份:</p>
      <a className='mgr10' onClick={this.showRoleModal} href='' >点击选择</a>
      <span className='value'>{selectedRoleItems}</span>
      {roleError ? <span className='checkInvalid' >请为选择最少一个角色！</span> : null}
    </li>
    */
    return (
      <div className='infoList employeeInfo'>
        <ul>
          <li>
            <p>登录账号:</p>
            <span>{account}</span>
            {id ? null : <Button type='primary' onClick={this.buildAccount} >生成账号</Button>}
            {accountError ? <span className='checkInvalid'>请先生成账号!</span> : null}
            <span className='mgl10 hint'>(初始密码为"Xl"+登录账号)</span>
          </li>
          <li>
            <p>员工姓名:</p>
            <input className='value' onChange={this.changeName} onBlur={this.checkName} value={nickName} />
            { nameError ? <span className='checkInvalid'>{nameErrorMessage}</span> : null }
          </li>
          <li>
            <p>员工手机号:</p>
            <input
              onChange={this.changeMobile} 
              // onBlur={this.checkMobile} 
              value={contactMobile} 
            />
            { mobileError ? <span className='checkInvalid'>{mobileErrorMessage}</span> : null }
          </li>
          <li>
            <p>员工身份:</p>
            <BasicSelector
              staticOpts={TYPES}
              selectedOpt={type.toString()}
              changeOpt={this.changeType}
              checkOpt={this.checkType}
            />
            {type === 3 ? <span className='value mgl10'>{selectedRoleItems}</span> : null }
            {(type === 3) && roleError ? <span className='checkInvalid' >请选择最少一个身份！</span> : null}
            {typeError ? <span className='checkInvalid' >请选择身份！</span> : null}
          </li>
          <li>
            <p>指定学校:</p>
            <a className='mgr10' onClick={this.showSchools} href='' >点击选择</a>
            {schoolLimit ? selectedSchoolItems : <span>不限制学校</span>}
            {schoolError ? <span className='checkInvalid' >请为选择最少一个学校！</span> : null}
          </li>
          <li className='itemsWrapper'>
            {parseInt(type, 10) === 3 ? 
              <AuthenDataTable
                clickable={false}
                authenStatus={authenStatus}
              />
            : null}
          </li>
        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>{this.props.location.state?(backTitle[this.props.location.state.path]):'返回'}</Button>
        </div>
        <div style={{clear:'both'}}></div>

        <MultiSelectModal 
          closeModal={this.closeRoleSelect} 
          confirm={this.setRoleItems} 
          show={showRoleModal} 
          dataSource={roleData} 
          columns={this.roleColumns} 
        />

        <div>
          <SchoolMutilSelect 
            closeModal={this.closeSchool} 
            setSchools={this.setSchools} 
            showModal={showSchools} 
            selectedSchools={JSON.parse(JSON.stringify(selectedSchools))}
            clearSchoolLimit={this.clearSchoolLimit} 
          />
        </div>

      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  schools: state.setSchoolList.schools,
  full: state.setAuthenData.full,
  originalPrivileges: state.setAuthenData.originalPrivileges,
  roles: state.setRoleList.roles,
  rolesSet: state.setRoleList.rolesSet,
  rolePrivileges: state.setRoleList.rolePrivileges,
  rolePrivilegesSet: state.setRoleList.rolePrivilegesSet
})

export default withRouter(connect(mapStateToProps, {
  setAuthenData,
  setRoleList
 })(EmployeeInfo))