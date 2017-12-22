import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../ajax'
import Noti from '../noti'
import CONSTANTS from '../component/constants'
import {setStore, getStore} from '../util/storage'
import {obj2arr} from '../util/types'
import MultiSelectModal from '../component/multiSelectModal'
import SchoolMutilSelect from '../component/schoolMultiSelectModal'
import AuthenDataTable from '../component/authenDataTable'

class EmployeeInfo extends React.Component {
  constructor (props) {
    super(props)
    let id='',mobile='',nickName='',type='0',mobileError=false,nameError=false,nameErrorMessage='',schools=[],showSchools=false,typeError=false
    let mobileErrorMessage = '手机号格式不正确', originalMobile = 0, schoolError = false
    const roles = obj2arr(CONSTANTS.ROLE)
    const roleData = roles.map((r) => {
      r.selected = false
      return r
    })
    this.state = {id,mobile,nickName,type,mobileError,mobileErrorMessage, nameError,
      nameErrorMessage, originalMobile, schools,showSchools, typeError, schoolError,
      account: '',
      accountError: false,
      selectedRoleItems: [],
      roleError: false,
      showRoleModal: false,
      roleData: roleData,
      allSchools: false,
      selectedSchools: []
    }
    this.roleColumns = [{
      title: '身份',
      dataIndex: 'value',
      width: '75%'
    }]
  }
  fetchData = (body) => {
    let resource='/api/employee/one'
    const cb = (json) => {
      if(json.data){
        let {id, mobile, type, nickName, schools} = json.data
        this.setState({
          id: id,
          mobile: mobile,
          type: type,
          nickName: nickName,
          schools: schools,
          originalMobile: mobile
        })
      }       
    }
    AjaxHandler.ajax(resource,body,cb)
  } 
  componentDidMount () {
    this.props.hide(false)
    if(this.props.match.params.id){
      let id = this.props.match.params.id.slice(1) 
      const body={
        id: parseInt(id, 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.push('/employee')
  }
  postData = () => {
    let {mobile,nickName,type,id,schools, posting} = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    let resource
    const body={
      mobile: mobile,
      nickName: nickName,
      type: parseInt(type, 10)
    }
    if(type.toString()==='2'){
      let newschools = schools.map((r,i)=>{
        return r.id
      })
      body.schoolIds = newschools||[]
    }
    if(id){
      body.id = id
      resource ='/api/employee/update'
    }else{
      resource = '/api/employee/add'
    }
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
    AjaxHandler.ajax(resource,body,cb)
  }
  confirm = () => {
    let m = this.state.mobile
    if(!/^1[3|4|5|7|8][0-9]{9}$/.test(m)){
      return this.setState({
        mobileError: true,
        mobileErrorMessage: '手机号格式不正确！'
      })
    }
    let n = this.state.nickName
    if(!n){
      return this.setState({
        nameError: true,
        nameErrorMessage: '名字不能为空！'
      })
    }
    let r = this.state.type
    if (!r || r==='0') {
      return this.setState({
        typeError: true
      })
    }
    if (parseInt(r, 10) === 2) { // 若为维修员，至少选择一个学校
      let schools = this.state.schools
      let selectedSchoolNumber = schools&&schools.map((r,i)=>(r.selected = true)).length
      if (selectedSchoolNumber === 0) {
        return this.setState({
          schoolError: true
        })
      }
    }
    let {checking, posting} = this.state
    if (checking || posting) {
      return
    }
    if (this.state.id && parseInt(m, 10) === this.state.originalMobile) {
      this.postData()
    } else {
      this.checkExist(this.postData)
    }
  }
  changeMobile = (e) => {
    this.setState({
      mobile:e.target.value.trim()
    })
  }
  changeName = (e) => {
    this.setState({
      nickName: e.target.value
    })
  }
  checkMobile = () => {
    let m = this.state.mobile, id = this.state.id
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
    if (id && parseInt(m, 10) === this.state.originalMobile) {
      return
    }
    this.checkExist()
  }
  checkExist = (callback) => {
    let {mobile, checking} = this.state
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/api/user/mobile/check'
    const body = {
      mobile: parseInt(mobile, 10)
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
  changeType = (v) => {
    this.setState({
      type: v
    })
  }
  checkType = (v) => {
    if (!v || v==='0') {
      return this.setState({
        typeError: true
      })
    }
    this.setState({
      typeError: false
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
      showSchools: false
    }
    let {dataSource, all} = data
    nextState.allSchools = all
    if (all) {
      return this.setState(nextState)
    }
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
  closeModal = () => {
    this.setState({
      showSchools: false
    })
  }
  buildAccount = () => {
    // get an account
  }
  showRoleModal = (e) => {
    e.preventDefault()
    this.setState({
      showRoleModal: true
    })
  }
  setRoleItems = (data) => {
    let roleData = JSON.parse(JSON.stringify(data))
    this.setState({
      roleData: roleData,
      showRoleModal: false
    })
  }
  closeRoleSelect = () => {
    this.setState({
      showRoleModal: false
    })
  }

  render () {
    const {id, 
      account, accountError,
      nickName,nameError,nameErrorMessage,
      mobile, mobileError, mobileErrorMessage,
      roleError, showRoleModal, roleData,
      showSchools, schoolError, selectedSchools,
      allSchools
    } = this.state
    const selectedSchoolItems = selectedSchools && selectedSchools.map((r,i)=>(
      <span key={i}>{r.name}</span>
    ))
    const selectedRoleItems = roleData && roleData.map((r, i) => {
      return (<span key={i}>{r.selected ? r.value : ''}</span>)
    })

    return (
      <div className='infoList employeeInfo'>
        <ul>
          <li>
            <p>员工账号:</p>
            {id ? null : <Button onClick={this.buildAccount} type='primary' >生成</Button>}
            <span>{account}</span>
            {accountError ? <span className='checkInvalid'>请先生成账号!</span> : null}
          </li>
          <li>
            <p>员工姓名:</p>
            <input className='value' onChange={this.changeName} onBlur={this.checkName} value={nickName} />
            { nameError ? <span className='checkInvalid'>{nameErrorMessage}</span> : null }
          </li>
          <li>
            <p>员工手机号:</p>
            <input 
              disabled={id}
              className={id ? 'disabled' : ''} 
              onChange={this.changeMobile} 
              onBlur={this.checkMobile} 
              value={mobile} 
            />
            { mobileError ? <span className='checkInvalid'>{mobileErrorMessage}</span> : null }
          </li>
          <li>
            <p>员工身份:</p>
            <a className='mgr10' onClick={this.showRoleModal} href='' >点击选择</a>
            <span className='value'>{selectedRoleItems}</span>
            {roleError ? <span className='checkInvalid' >请为选择最少一个角色！</span> : null}
          </li>
          <li>
            <p>指定学校:</p>
            <a className='mgr10' onClick={this.showSchools} href='' >点击选择</a>
            <span className='value'>{allSchools ? '全部学校' : selectedSchoolItems}</span>
            {schoolError ? <span className='checkInvalid' >请为选择最少一个学校！</span> : null}
          </li>
          <li className='itemsWrapper'>
            <AuthenDataTable
              clickable={false}
              authenStatus={CONSTANTS.authenData}
            />
          </li>
        </ul>

        <div className='btnArea'>*登录账号为员工手机号，初始密码为"Xl"+手机号</div>
        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>返回</Button>
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
            all={allSchools} 
            closeModal={this.closeModal} 
            setSchools={this.setSchools} 
            showModal={showSchools} 
            selectedSchools={JSON.parse(JSON.stringify(selectedSchools))} 
          />
        </div>

      </div>
    )
  }
}

export default EmployeeInfo
