import React from 'react'
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';

import {Button, DatePicker, Table, Modal} from 'antd'

import AjaxHandler from '../ajax'
import Noti from '../noti'
import AddPlusAbs from '../component/addPlusAbs'
import SchoolSelector from '../component/schoolSelector'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import CONSTANTS from '../component/constants'

const VALUELENGTH = '150px'

const RangePicker = DatePicker.RangePicker

class NotifyInfo extends React.Component {
  constructor (props) {
    super(props)
    let schoolError=false, type='0', typeError=false
    let content='', contentError=false, endTime=moment(), endTimeError=false,mobiles=[{mobile:'',error:false}],mobilesError, checkCount = 0
    let existError = false

    this.state = { 
      type, typeError, schoolError, content, contentError, endTime, endTimeError, mobiles, mobilesError, checkCount, 
      originalSchoolIds: [],
      id: 0,
      showSchools: false,
      schools: [],
      all: false,
      originalAll: false
    }
  }
  fetchData =(body)=>{
    let resource='/api/notify/one'
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let mobiles = json.data.mobiles && json.data.mobiles.map((r,i)=>{
            return {
              mobile: r,
              error: false
            }
          })
          let {type, schoolIds, content, schoolRange, endTime, schoolNames} = json.data, nextState = {}
          let schools = schoolIds && schoolIds.map((id, i) => ({id: id, name: schoolNames[i]}))
          nextState.type = type.toString()
          if (schoolRange === 1) {
            nextState.all = true
          } else if (schoolRange === 2) {
            nextState.schools = schools
          }
          if (type === 1) {
            if (schoolRange === 1) {
              nextState.originalAll = true
            } else {
              nextState.originalSchoolIds = JSON.parse(JSON.stringify(schools))
            }
          }
          nextState.content = content
          if (endTime) {
            nextState.endTime = moment(endTime)
          }
          if (mobiles) {
            nextState.mobiles = mobiles
          }
          this.setState(nextState)
        }else{
          throw new Error('网络出错，获取数据失败，请稍后重试～')
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }

  componentDidMount(){
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
  postInfo = () => {
    let {schools, all, type, content, endTime} = this.state, mobiles=JSON.parse(JSON.stringify(this.state.mobiles))
    const body = {
      type: parseInt(type),
      content: content
    }
    if (type === '3') {
      for (let i=0;i<mobiles.length;i++) {
        if (!mobiles[i].mobile || !/^1[3|4|5|7|8][0-9]{9}$/.test(parseInt(mobiles[i].mobile))) {
          mobiles[i].error = true
          mobiles[i].errorMessage = '手机号出错，请重新核对！'
          return this.setState({
            mobiles: mobiles
          })
        }
      }
      let ms = mobiles.map((r, i)=>(parseInt(r.mobile)))
      body.mobiles = ms
    } else {
      if (all) {
        body.schoolRange = 1
      } else {
        body.schoolRange = 2
        body.schoolIds = schools.map((s) => (s.id))
      }
      if (type === '1') {
        body.endTime = parseInt(moment(endTime).valueOf())
      }
    }
    let resource
    if(this.props.match.params.id){
      body.id = parseInt(this.props.match.params.id.slice(1))
      resource = '/api/notify/update'
    } else {
      resource = '/api/notify/add'
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            Noti.hintSuccess(this.props.history,'/notify/list')
          }else{
            throw new Error('网络出错，请稍后重试～')
          }        
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  comleteEdit = () => {
    let {id, type, content, schools, all, originalSchoolIds, originalAll} = this.state
    if (!type || type === '0') {
      return this.setState({
        typeError: true
      })
    }
    if (!content) {
      return this.setState({
        contentError: true
      })
    }
    if ((type === '1' || type === '2') && schools.length < 1) {
      return this.setState({
        schoolError: true
      })
    }
    if (type === '1') {
      if (id && originalAll) { // 若原来就是全部学校, 不需要查重
        this.postInfo()
      } else if (id) { // 编辑，但非全部学校
        let beyond = schools.filter((s) => {
          let exist = originalSchoolIds.some((o) => (o.id === s.id))
          return !exist
        })
        if (beyond.length > 0) {
          let body = {
            schoolRange: 2
          }
          body.schoolIds = beyond.map((b) => (b.id))
          this.checkNotifyExist(this.postInfo, body)
        } else {
          this.postInfo()
        }
      } else {
        this.checkNotifyExist(this.postInfo)
      }
    } else if (type === '3') {
      this.checkExistPost()
    } else {
      this.postInfo()
    }
  }
  cancel = () => {
    this.props.history.goBack()
  }
  checkNotifyExist = (callback, payload) => {
    let {schools, all} = this.state
    let resource = '/notify/check'
    let body = {}
    if (payload) {
      body = payload
    } else {
      if (all) {
        body.schoolRange = 1
      } else {
        body.schoolRange = 2
        body.schoolIds = schools.map((s) => (s.id))
      }
    }
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage
        }
      } else {
        if (json.data.result) {
          Noti.hintLock('请求出错', '该学校已存在紧急公告，当前不能再添加')
          this.setState({
            existError: true
          })
        } else {
          if (this.state.existError) {
            this.setState({
              existError: false
            })
          }
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeType = (v) => {
    let nextState = {}
    nextState.type = v
    this.setState(nextState)
  }
  checkType = (v) => {
    let {schoolId, originalSchoolId} = this.state
    if (!v || v==='0') {
      return this.setState({
        typeError: true
      })
    }
    let nextState = {}
    if (this.state.typeError) {
      nextState.typeError = false
    }
    this.setState(nextState)
  }
  changeContent = (e) => {
    let v = e.target.value
    this.setState({
      content: v
    })
  }
  checkContent = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        content: v,
        contentError: true
      })
    }
    let nextState = {
      content: v
    }
    if (this.state.contentError) {
      nextState.contentError = false
    }
    this.setState(nextState)
  }
  changeEndTime = (v) => {
    this.setState({
      endTime: v
    })
  }
  changeMobile = (e, i) => {
    let mobiles =JSON.parse(JSON.stringify(this.state.mobiles))
    mobiles[i].mobile = e.target.value.trim()
    this.setState({
      mobiles: mobiles
    })
  }
  checkMobile = (e, i) => {
    let mobiles = JSON.parse(JSON.stringify(this.state.mobiles))
    if (!mobiles[i].mobile || !/^1[3|4|5|7|8][0-9]{9}$/.test(parseInt(mobiles[i].mobile))) {
      mobiles[i].error = true
      mobiles[i].errorMessage = '手机号格式不正确！'
      return  this.setState({
                mobiles: mobiles
              })
    } else if (mobiles[i].error) {
      mobiles[i].error = false
    }
    /* ----- check mobile if exist ----- */
    this.setState({
      mobiles: mobiles
    })
    this.checkExist(mobiles[i].mobile, i)
  }
  checkExistPost = () => {
    let {checkCount, mobiles} = this.state
    let resource = '/api/user/mobile/check'
    const body = {
      mobile: parseInt(mobiles[checkCount].mobile)
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          checkCount++
          this.setState({
            checkCount: checkCount
          })
          if (checkCount === mobiles.length) {
            this.postInfo()
          } else {
            this.checkExistPost()
          }
        } else {
          // hint the mobile does not exist
          let mobiles = JSON.parse(JSON.stringify(this.state.mobiles))
          mobiles[checkCount].error = true
          mobiles[checkCount].errorMessage = '该手机号未注册！'
          this.setState({
            checkCount: 0,
            mobiles: mobiles
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  checkExist = (m, i) => {
    let resource = '/api/user/mobile/check'
    const body = {
      mobile: parseInt(m)
    }
    const cb = (json) => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          // nothing 
        } else {
          // hint the mobile does not exist
          let mobiles = JSON.parse(JSON.stringify(this.state.mobiles))
          mobiles[i].error = true
          mobiles[i].errorMessage = '该手机号未注册！'
          this.setState({
            mobiles: mobiles
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  addMobile = () => {
    let mobiles = JSON.parse(JSON.stringify(this.state.mobiles))
    mobiles.push({mobile: '', error: false})
    this.setState({
      mobiles: mobiles
    })
  }
  abstractMobile = () => {
    let mobiles = JSON.parse(JSON.stringify(this.state.mobiles))
    mobiles.pop()
    this.setState({
      mobiles: mobiles
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
  setSchools = (data, all) => {
    let {id, type, originalAll, originalSchoolIds} = this.state, body = {}
    if (all) {
      let schools = data.map((r) => ({id: r.id, name: r.name}))
      if (type === '1') {
        if (!id) { // 新建，全量查
          body.schoolRange = 1          
          this.checkNotifyExist(null, body)
        } else if (!originalAll) {  //// 原来不是全部，查重
          let beyond = schools.filter((s) => { // 是否有超出原来范围的学校
            let exist = originalSchoolIds.some((o) => (o.id === s.id))
            return !exist
          })
          if (beyond.length > 0) { // 有则对超出的学校查重
            body.schoolRange = 2
            body.schoolIds = beyond.map((b) => (b.id))
            this.checkNotifyExist(null, body)
          }
        }
      }
      return this.setState({
        all: true,
        showSchools: false,
        schoolError: false,
        schools: schools
      })
    }
    let schools = [], nextState = {}
    data.forEach((r,i)=>{
      if(r.selected){
        schools.push({
          id: r.id,
          name: r.name
        })
      }
    })
    if (schools.length === 0) {
      nextState.schoolError = true
      nextState.showSchools = false
      nextState.all = false
      nextState.schools = schools
      return this.setState(nextState)
    } else if (this.state.schoolError) {// 若不为0，且当前有维修员无学校报错，清空报错
      nextState.schoolError = false    
    }
    nextState.showSchools = false
    nextState.schools = schools
    nextState.all = false
    this.setState(nextState)

    if (schools.length > 0 && type === '1') {
      let schoolIds = schools.map((s) => (s.id))
      body = {
        schoolRange: 2
      }
      if (id === 0) { // 新建
        body.schoolIds = schoolIds
        this.checkNotifyExist(null, body)
      } else if (!originalAll) {//原来是全部，就不需要查重，否则查重
        let beyond = schools.filter((s) => { // 是否有超出原来范围的学校
          let exist = originalSchoolIds.some((o) => (o.id === s.id))
          return !exist
        })
        if (beyond.length > 0) { // 有则对超出的学校查重
          body.schoolIds = beyond.map((b) => (b.id))
          this.checkNotifyExist(null, body)
        }
      }
    }
  }

  render () {
    let {id, type, typeError, schoolId, schoolError, content, contentError, endTime, endTimeError, mobiles, mobilesError, existError, showSchools, schools, all} = this.state
    const contentInput = (
      <li className='itemsWrapper high'>
        <p>公告内容:</p>
        <div>
          <textarea value={content} onChange={this.changeContent} onBlur={this.checkContent} />
          {contentError ? <span className='checkInvalid'>公告内容不能为空！</span> : null }
        </div>
      </li>
    )
    const endItem = (
      <li >
        <p>公告截至时间:</p>
          <DatePicker
            className='end'
            showTime
            allowClear={false}
            value={moment(endTime)}
            format="YYYY-MM-DD HH:mm"
            onChange={this.changeEndTime}
          />
      </li>
    )
    const mobileGroup = mobiles.length&&mobiles.map((r,i)=>{
      return (
        <div key={i}>
          <input style={{width: VALUELENGTH}} key={`input${i}`} value={r.mobile} onChange={(e)=>{this.changeMobile(e, i)}} onBlur={(e)=>{this.checkMobile(e, i)}} />
          {r.error ? <span key={`span${i}`} className='checkInvalid'>{r.errorMessage}</span> : null }
        </div>
      )
    })
    const mobileItem = (
      <li className='itemsWrapper'>
        <p>用户手机:</p>
        <div>
          {mobileGroup}
          <AddPlusAbs count={mobiles.length} add={this.addMobile} abstract={this.abstractMobile} />
        </div>
      </li>
    )
    const schoolItems = schools.map((s, i) => (<span className='puncSeperated' key={i}>{s.name}</span>))

    return (
      <div className='infoList notifyInfo'>
        <ul>
          <li>
            <p>公告类型:</p>
            <BasicSelectorWithoutAll
              staticOpts={CONSTANTS.NOTIFYTYPES}  
              width={150} 
              selectedOpt={type} 
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              invalidTitle='选择类型'
              disabled={id}
              className={id ? 'disabled' : ''}
            />
            {typeError?<span className='checkInvalid'>公告类型不能为空！</span>:null}        
          </li>
          
          {type !== '3' ? 
            <li>
              <p>选择学校:</p>
              <span>{all ? '全部学校' : schoolItems}</span>
              <a onClick={this.showSchools} className='mgl20' href='' >点击选择</a>
              {schoolError ? <span className='checkInvalid'>学校不能为空！</span> : null}
            </li>
            : null 
          }


          {type ? contentInput : null}
          {type === '1' ? endItem : null }
          {type === '3' ? mobileItem : null }

        </ul>

        <div className='btnArea'>
          <Button type='primary' onClick={this.comleteEdit} >确认</Button>
          <Button onClick={this.cancel} >返回</Button>
        </div>

        <div>
          <SchoolMultiSelector closeModal={this.closeModal} setSchools={this.setSchools} all={all} showModal={showSchools} schools={JSON.parse(JSON.stringify(schools))} />
        </div>

      </div>
    )
  }
}


class SchoolMultiSelector extends React.Component{
  constructor(props){
    super(props)
    let dataSource = [],searchingText = ''
    this.state = {
      dataSource,
      searchingText,
      all: false
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
            schools.forEach((r,i)=>{
              let s = schoolLists.find((rec)=>(rec.id === r.id))
              if (s) {
                s.selected = true
              }
            })
            schoolLists.forEach((r,i)=>{
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
    let all = nextProps.all
    let nextSchools = nextProps.schools
    if (all) {
      let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
      dataSource.forEach((r) => (r.selected = true))
      return this.setState({
        all: true,
        dataSource: dataSource
      })
    }
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
    if (this.state.all) {
      this.props.setSchools(JSON.parse(JSON.stringify(this.state.dataSource)), true)
    } else {
      this.props.setSchools(JSON.parse(JSON.stringify(this.state.dataSource)))
    }
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
  toggleAll = () => {
    let all = this.state.all
    let nextState = {
      all: !all
    }
    let dataSource = JSON.parse(JSON.stringify(this.state.dataSource))
    if (!all) { // 现在选中了所有
      dataSource.forEach((s) => (s.selected = true))
    } else {
      dataSource.forEach((s) => (s.selected = false))
    }
    nextState.dataSource = dataSource
    this.setState(nextState)
  }
  render(){
    const {dataSource, all} = this.state

    const columns = [{
      title: (<p >学校名称</p>),
      dataIndex: 'name'
    }, {
      title: (<p style={{textAlign:'center'}}>操作  <input type='checkbox' checked={all} onChange={this.toggleAll} /></p>),
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
          <p style={{marginBottom:'10px'}}>当前已选择的学校:{all ? '全部学校' :selectedSchoolItems}</p>
          <Table rowKey={record=>record.id}  pagination={false} dataSource={dataSource} columns={columns} onRowClick={this.selectRow} />
        </div>
        
      </Modal>
    )
  }
}


export default NotifyInfo
