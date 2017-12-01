import React from 'react'
import { Button} from 'antd'
import Modal from 'antd/lib/modal'
import Table from 'antd/lib/table'
import AjaxHandler from '../ajax'
import Noti from '../noti'
import CONSTANTS from '../component/constants'
import BasicSelector from '../component/basicSelectorWithoutAll'
import {setStore, getStore} from '../util/storage'

const TYPE = CONSTANTS.ROLE

class EmployeeInfo extends React.Component {
  constructor (props) {
    super(props)
    let id='',mobile='',nickName='',type='0',mobileError=false,nameError=false,nameErrorMessage='',schools=[],showSchools=false,typeError=false
    let mobileErrorMessage = '手机号格式不正确', originalMobile = 0, schoolError = false
    this.state = {id,mobile,nickName,type,mobileError,mobileErrorMessage, nameError,nameErrorMessage,schools,showSchools, typeError, schoolError}
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
        id: parseInt(id)
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
    let {mobile,nickName,type,id,schools} = this.state
    let resource
    const body={
      mobile: mobile,
      nickName: nickName,
      type: parseInt(type)
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
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
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
    if (this.state.id && parseInt(m) === this.state.originalMobile) {
      this.postData()
    } else {
      this.checkExistPost()
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
    if (id && parseInt(m) === this.state.originalMobile) {
      return
    }
    this.checkExist()
  }
  checkExist = () => {
    let {mobile} = this.state
    let resource = '/api/user/mobile/check'
    const body = {
      mobile: parseInt(mobile)
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          let nextState = {}
          nextState.mobileError = true
          nextState.mobileErrorMessage = '该手机号已注册！'
          this.setState(nextState)
        } else {
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  checkExistPost = () => {
    let {mobile} = this.state
    let resource = '/api/user/mobile/check'
    const body = {
      mobile: parseInt(mobile)
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          let nextState = {}
          nextState.mobileError = true
          nextState.mobileErrorMessage = '该手机号已注册！'
          this.setState(nextState)
        } else {
          this.postData()
        }
      }
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
    data.map((r,i)=>{
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
    const {id, schools, showSchools, type,nickName,nameError,nameErrorMessage, typeError, mobileError, mobileErrorMessage, schoolError} = this.state
    const selectedSchoolItems = schools&&schools.map((r,i)=>(
      <span key={i}>{r.name}</span>
    ))

    return (
      <div className='infoList userInfo'>
        <ul>
          <li>
            <p>员工手机号:</p>
            <input 
              disabled={id}
              className={id ? 'disabled' : ''} onChange={this.changeMobile} onBlur={this.checkMobile} value={this.state.mobile} />
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
        <div className='btnArea'>*登录账号为员工手机号，初始密码为"Xl"+手机号</div>
        <div className='btnArea'>
          <Button type='primary' onClick={this.confirm}>确认</Button>
          <Button onClick={this.back}>返回</Button>
        </div>
        <div style={{clear:'both'}}></div>

        <div>
          <RepairmanTable closeModal={this.closeModal} setSchools={this.setSchools} showModal={showSchools} schools={JSON.parse(JSON.stringify(schools))} />
        </div>

      </div>
    )
  }
}

class RepairmanTable extends React.Component{
  constructor(props){
    super(props)
    let dataSource = [],searchingText = ''
    this.state = {
      dataSource,
      searchingText
    }
  }
  fetchSchools = (body) => {
    let resource='/school/list'
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            let schoolLists = json.data.schools, schools = this.props.schools
            schools.map((r,i)=>{
              let s = schoolLists.find((e,ind)=>(e.id === r.id))
              s.selected = true
            })
            schoolLists.map((r,i)=>{
              if(!r.selected){
                r.selected = false
              }
            })
            this.setState({
              dataSource: schoolLists
            })
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  componentDidMount(){
    const body={
      page: 1,
      size: 100
    }
    this.fetchSchools(body)
  }
  componentWillReceiveProps (nextProps) {
    let nextSchools = nextProps.schools
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach((r) => (r.selected = false))
    nextSchools.forEach((r) => {
      let s = dataSource.find((school) => (school.id === r.id))
      if (s) {
        s.selected = true
      }
    })
    this.setState({
      dataSource: dataSource
    })
  }
  confirm = () => {
    this.props.setSchools(JSON.parse(JSON.stringify(this.state.dataSource)))
  }
  cancel = () => {
    //clear all the data
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource.forEach((r) => (r.selected = false))
    this.setState({
      dataSource: dataSource
    })
    this.props.closeModal()
  }
  changeSelect = (e,i) => {
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    dataSource[i].selected = !dataSource[i].selected
    this.setState({
      dataSource: dataSource
    })
  }
  searchKey = (e) => {
    if(e.key.toLowerCase() === 'enter'){
      this.handleSearch()
    }
  }
  changeSearch = (e) => {
    this.setState({
      searchingText: e.target.value.trim()
    })
  }
  handleSearch = () => {
    const body = {
      page: 1,
      size: 80000,
      namePrefix: this.state.searchingText
    }
    this.fetchSchools(body)
  }
  resetSearch = () => {
    this.setState({
      searchingText: ''
    })
    const body = {
      page: 1,
      size: 80000
    }
    this.fetchSchools(body)
  }
  selectRow = (record, index, event) => {
    this.changeSelect(null, index)
  }
  render(){
    const {dataSource} = this.state

    const columns = [{
      title: (<p >学校名称</p>),
      dataIndex: 'name'
    }, {
      title: (<p style={{textAlign:'center'}}>操作</p>),
      dataIndex: 'operation',
      width: '100',
      className: 'center',
      render: (text, record, index) => (
        <input type='checkbox' checked={record.selected} onChange={(e)=>{this.changeSelect(e,index)}} />
      )
    }]

    const schools = dataSource&&dataSource.filter((r,i)=>(r.selected === true))

    const selectedSchoolItems = schools&&schools.map((r,i)=>(
      <span className='seperateItem' key={i} >{r.name}/</span>
    ))

    return (
      <Modal wrapClassName='modal' width={800} title='' visible={this.props.showModal} onCancel={this.cancel} onOk={this.confirm} okText='' footer={null}>
        <div className='giftStatus searchLine maintainerSchSel'>
          <input placeholder="搜索学校" className='searchInput' value={this.state.searchingText} onKeyDown={this.searchKey} onChange={this.changeSearch} />
          <Button className='rightConfirm' type='primary' onClick={this.confirm} >确定</Button>
        </div>
        <div className='depositGiftTable'>
          <p style={{marginBottom:'10px'}}>当前已选择的学校:{selectedSchoolItems}</p>
          <Table rowKey={record=>record.id}  pagination={false} dataSource={dataSource} columns={columns} onRowClick={this.selectRow} />
        </div>
        
      </Modal>
    )
  }
}

export default EmployeeInfo
