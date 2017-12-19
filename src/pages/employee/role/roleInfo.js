import React from 'react'
import { Button} from 'antd'
import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'
import BasicSelector from '../../component/basicSelectorWithoutAll'
import {setStore, getStore} from '../../util/storage'

const TYPE = CONSTANTS.ROLE

class RoleInfo extends React.Component {
  constructor (props) {
    super(props)
    let id='',mobile='',nickName='',type='0',mobileError=false,nameError=false,nameErrorMessage='',schools=[],showSchools=false,typeError=false
    let mobileErrorMessage = '手机号格式不正确', originalMobile = 0, schoolError = false
    this.state = {id,mobile,nickName,type,mobileError,mobileErrorMessage, nameError,nameErrorMessage, originalMobile, schools,showSchools, typeError, schoolError}
  }
  fetchData = (body) => {
    let resource='/api/employee/one'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
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
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
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
        }else{
          throw new Error('网络出错，请稍后重试～')
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
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
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
    let schools = []
    data.forEach((r,i)=>{
      if(r.selected){
        schools.push({
          id: r.id,
          name: r.name
        })
      }
    })
    if (schools.length === 0 && parseInt(this.state.type, 10) === 2) {// 若为维修员，选择了0个学校，报错
      this.setState({
        schoolError: true
      })
    } else if (this.state.schoolError && schools.length !== 0) {// 若不为0，且当前有维修员无学校报错，清空报错
      this.setState({
        schoolError: false
      })
    }
    this.setState({
      showSchools: false,
      schools: schools
    })
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
  render () {
    const {id, schools, type,nickName,nameError,nameErrorMessage, typeError, mobileError, mobileErrorMessage, schoolError} = this.state
    const selectedSchoolItems = schools&&schools.map((r,i)=>(
      <span key={i}>{r.name}</span>
    ))

    return (
      <div className='infoList'>
        <ul>
          <li>
            <p>身份名称:</p>
            <input 
              disabled={id}
              className={id ? 'disabled' : ''} 
              onChange={this.changeMobile} 
              onBlur={this.checkMobile} 
              value={this.state.mobile} 
            />
            { mobileError ? <span className='checkInvalid'>{mobileErrorMessage}</span> : null }
          </li>
          <li>
            <p>员工姓名:</p>
            <input className='value' onChange={this.changeName} onBlur={this.checkName} value={nickName} />
            { nameError ? <span className='checkInvalid'>{nameErrorMessage}</span> : null }
          </li>   
          <li>
            <p>员工身份:</p>
            <BasicSelector
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={type}
              changeOpt ={this.changeType}
              checkOpt ={this.checkType}
              staticOpts={TYPE}
              invalidTitle='选择角色'
            />
            { typeError ? <span className='checkInvalid'>请选择身份！</span> : null }
          </li>
          {type.toString()==='2'&&(
            <li>
              <p>维修员管理的学校:</p>
              <a className='value' onClick={this.showSchools} href='' >点击选择</a>
            </li>
          )}
          {type.toString()==='2'&&(  
            <li>
              <p >已选择的学校:</p>
              <span className='value'>{selectedSchoolItems}</span>
              {schoolError ? <span className='checkInvalid' >请为维修员选择最少一个学校！</span> : null}
            </li>
          )}
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


export default RoleInfo 
