import React from 'react'
import moment from 'moment';
import 'rc-time-picker/assets/index.css';

import {Button, DatePicker, Modal} from 'antd'

import AjaxHandler from '../../ajax'
import Noti from '../../noti'
import CONSTANTS from '../../component/constants'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'

class NotifyInfo extends React.Component {
  static propTypes = {
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor (props) {
    super(props)
    let type=''
    let content='', contentError=false, endTime = moment(), endTimeError = false

    this.state = { 
      type, content, contentError, endTime, endTimeError, 
      id: 0,
      schools: [],
      all: false,
      status: '',
      creatorName: '',
      showModal: false,
      note: '',
      pass: false,
      noteError: false
    }
  }
  fetchData =(body)=>{
    let resource='/api/notify/one'
    const cb=(json)=>{
      if(json.error){
        throw new Error(json.error.displayMessage || json.error)
      }else{
        if(json.data){
          let {type, schoolIds, content, schoolRange, endTime, schoolNames, status, creatorName, note} = json.data, nextState = {}
          let schools = schoolIds && schoolIds.map((id, i) => ({id: id, name: schoolNames[i]}))
          nextState.type = type
          if (schoolRange === 1) {
            nextState.all = true
          } else if (schoolRange === 2) {
            nextState.schools = schools
          }
          nextState.content = content
          if (endTime) {
            nextState.endTime = moment(endTime)
          }
          nextState.status = status
          nextState.creatorName = creatorName || ''
          nextState.note = note || ''
          this.setState(nextState)
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
    this.setState({
      posting: true
    })
    let {id, content, endTime, note, pass} = this.state
    let resource = '/notify/censor'
    let passed = pass ? 1 : 2
    const body = {
      id: id,
      content: content,
      endTime: parseInt(moment(endTime).valueOf(), 10),
      pass: passed,
      note: note.trim()
    }
    const cb = (json) => {
        if(json.error){
          throw new Error(json.error.displayMessage || json.error)
        }else{
          /*--------redirect --------*/
          if(json.data){
            Noti.hintSuccess(this.props.history,'/notify/censor')
          }      
        }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  censorRefuse = () => {
    if (this.checkComplete()) {
      this.setState({
        pass: false,
        showModal: true
      })
    }
  }
  censorPass = () => {
    if (this.checkComplete()) {
      this.setState({
        pass: true,
        showModal: true
      })
    }
  }
  checkComplete = () => {
    let {content} = this.state
    if (content) {
      return true
    } else {
      this.setState({
        contentError: true
      })
      return false
    }
  }
  cancel = () => {
    this.props.history.goBack()
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
  confirm = () => {
    let note = this.state.note.trim()
    let {pass, checking, posting} = this.state
    if (!note && !pass) {
      return this.setState({
        noteError: true
      })
    }
    this.setState({
      noteError: false
    })
    if (checking || posting) {
      return
    }
    if (pass) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
  }
  checkExist = (callback) => {
    let {schools, checking} = this.state
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/notify/check'
    let body = {}

    body.schoolRange = 2
    body.schoolIds = schools.map((s) => (s.id))

    const cb = (json) => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
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
  cancelInput = () => {
    this.setState({
      showModal: false
    })
  }
  changeNote = (e) => {
    this.setState({
      note: e.target.value
    })
  }

  render () {
    let {type, content, contentError, 
      endTime, schools, all,
      status, creatorName,
      showModal, note, pass
    } = this.state
    let {forbiddenStatus} = this.props

    const schoolItems = schools.map((s, i) => (<span className='puncSeperated' key={i}>{s.name}</span>))

    return (
      <div className='infoList notifyInfo'>
        <ul>
          <li>
            <p>公告类型:</p>
            <span>{CONSTANTS.NOTIFYTYPES[type]}</span>      
          </li>
          <li>
            <p>选择学校:</p>
            <span>{all ? '全部学校' : schoolItems}</span>
          </li>
          <li className='itemsWrapper high'>
            <p>公告内容:</p>
            <div>
              <textarea value={content} onChange={this.changeContent} onBlur={this.checkContent} />
              {contentError ? <span className='checkInvalid'>公告内容不能为空！</span> : null }
            </div>
          </li>
          <li >
            <p>公告截至时间:</p>
              <DatePicker
                className='datePicker'
                style={{height: '30px', width: 'auto'}}
                showTime
                allowClear={false}
                value={moment(endTime)}
                format="YYYY-MM-DD HH:mm"
                onChange={this.changeEndTime}
              />
          </li>

          <li>
            <p>公告状态:</p>
            <span>{CONSTANTS.NOTIFYSTATUS[status]}</span>       
          </li>
          <li>
            <p>创建人:</p>
            <span>维修员 {creatorName}</span>
          </li>

        </ul>

        <div className='btnArea'>
          {forbiddenStatus.CENSOR_NOTIFY ? null : <Button onClick={this.censorRefuse} >审核未通过</Button>}
          {forbiddenStatus.CENSOR_NOTIFY ? null : <Button type='primary' onClick={this.censorPass} >审核通过</Button>}
          <Button onClick={this.cancel} >返回</Button>
        </div>

        <Modal wrapClassName='modal' width={800} title={pass ? '请输入备注' : '请输入拒绝原因'} visible={showModal} onCancel={this.cancelInput} onOk={this.confirm} okText='确认'>
          <div className=''>
            <input placeholder={pass ? "备注" : '拒绝原因'} className='noteInput' value={note} onChange={this.changeNote} />
          </div>
        </Modal>

      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    forbiddenStatus: state.setAuthenData.forbiddenStatus
  }
}

export default withRouter(connect(mapStateToProps, {
})(NotifyInfo))