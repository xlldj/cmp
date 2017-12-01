import React from 'react'

import {Button, Popconfirm} from 'antd'

import AjaxHandler from '../ajax'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import Noti from '../noti'
import CONSTANTS from '../component/constants'

const VALUELENGTH = '150px'

class VersionInfo extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id: 0,
      versionNo: '',
      originalVersion: '',
      codeError: false,
      type: '',
      typeError: false,
      android: '',
      androidError: false,
      ios: '',
      iosError: false,
      content: '',
      contentError: '',
      contentErrorMsg: ''
    }
  }
  fetchData =(body)=>{
    let resource='/version/one'
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络错误，请稍后重试'
        }
      } else {
        if (json.data) {
          this.setState(json.data)
          this.setState({originalVersion: json.data.versionNo})
        } else {
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
    let {versionNo, type, ios, android, content, id} = this.state
    const body = {
      versionNo: versionNo,
      type: parseInt(type, 10),
      ios: ios,
      android: android,
      content: content
    }
    let resource
    if (id) {
      body.id = id
      resource = '/version/update'
    } else {
      resource = '/version/add'
    }
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络错误，请稍后重试'
        }
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history,'/version')
        } else {
          throw {
            title: '请求出错',
            message: json.error.displayMessage || '网络错误，请稍后重试'
          }
        }        
      }
    }
    AjaxHandler.ajax(resource,body,cb)
  }
  comleteEdit = () => {
    let {versionNo, type, ios, android, content} = this.state, nextState = {}

    if (!versionNo) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号不能为空！'
      return this.setState(nextState)
    }
    if (!/^[1-9]\d?\.[0-9]\d?\.[0-9]\d?$/.test(versionNo)) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号格式不正确，请输入如1.1.1格式的数字,每个数字不超过两位'
      return this.setState(nextState)
    }
    if (!type) {
      return this.setState({
        typeError: true
      })
    }
    if (!ios) {
      return this.setState({
        iosError: true
      })
    }
    if (!android) {
      return this.setState({
        androidError: true
      })
    }
    if (!content) {
      return this.setState({
        contentError: true,
        contentErrorMsg: '更新内容不能为空！'
      })
    }
    if (content.length > 200) {
      return this.setState({
        contentError: true,
        contentErrorMsg: '更新内容不能超过200字'
      })
    }
    this.postInfo()
    // this.checkExist(this.postInfo)
  }
  cancel = () => {
    this.props.history.goBack()
  }
  cancelPost = () => {
    // nothing
  }
  changeCode = (e) => {
    let v = e.target.value
    this.setState({
      versionNo: v
    })
  }
  checkCode = (e) => {
    let v = e.target.value.trim(), nextState = {versionNo: v}
    if (!v) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号不能为空！'
      return this.setState(nextState)
    }
    if (!/^[1-9]\d?\.[0-9]\d?\.[0-9]\d?$/.test(v)) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号格式不正确，请输入如1.1.1格式的数字,每个数字不超过两位'
      return this.setState(nextState)
    }
    nextState.codeError = false
    nextState.codeErrorMsg = ''
    this.setState(nextState)
    this.checkExist(null)
  }
  checkExist = (callback) => {
    let {versionNo, id, originalVersion} = this.state
    if (id && versionNo.trim() === originalVersion) {
      callback && callback()
      return
    }
    let resource = '/version/check'
    const body = {
      versionNo:versionNo.trim() 
    }
    const cb = (json) => {
      if (json.error) {
        throw {
          title: '请求出错',
          message: json.error.displayMessage || '网络错误，请稍后重试'
        }
      } else {
        let result = json.data.result
        if (result) {
          Noti.hintLock('添加出错', '该版本号已存在于系统中，请勿重复添加')
          this.setState({
            codeError: true,
            codeErrorMsg: '该版本号已存在于系统中，请勿重复添加'
          })
        } else {
          callback && callback()
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
    if (!v) {
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
  changeIos = (e) => {
    this.setState({
      ios: e.target.value
    })
  }
  checkIos = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        iosError: true,
        ios: v
      })
    }
    this.setState({
      iosError: false,
      ios: v
    })
  }
  changeAndroid = (e) => {
    this.setState({
      android: e.target.value
    })
  }
  checkAndroid = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      this.setState({
        androidError: true,
        android: v
      })
    }
    this.setState({
      androidError: false,
      android: v
    })
  }
  changeContent = (e) => {
    let v = e.target.value
    this.setState({
      content: v
    })
  }
  checkContent = (e) => {
    let v = e.target.value.trim(), nextState = {content: v}
    if (!v) {
      return this.setState({
        contentError: true,
        contentErrorMsg: '更新内容不能为空！'
      })
    }
    if (v.length > 200) {
      return this.setState({
        contentError: true,
        contentErrorMsg: '更新内容不能超过200字'
      })
    }
    if (this.state.contentError) {
      nextState.contentError = false
    }
    this.setState(nextState)
  }

  render () {
    let {id, type, typeError, versionNo, codeError, codeErrorMsg, ios, iosError, android, androidError, content, contentError, contentErrorMsg} = this.state

    return (
      <div className='infoList versionInfo'>
        <ul>
          <li>
            <p>版本号:</p>
            <input value={versionNo} disabled={id} className={id ? 'disabled' : ''} onChange={this.changeCode} onBlur={this.checkCode} placeholder='' />
            {codeError ? <span className='checkInvalid'>{codeErrorMsg}</span>:null}        
          </li>
          <li>
            <p>更新方式:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              staticOpts={CONSTANTS.UPDATETYPE}  
              selectedOpt={type} 
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              invalidTitle='选择方式'
            />
            {typeError ? <span className='checkInvalid'>更新方式不能为空！</span>:null}        
          </li>

          <li>
            <p>iOS地址:</p>
            <input className='long' type='url' value={ios} onChange={this.changeIos} onBlur={this.checkIos} placeholder='' />
            {iosError ? <span className='checkInvalid'>iOS地址不能为空！</span>:null}        
          </li>

          <li>
            <p>Android地址:</p>
            <input className='long' type='url' value={android} onChange={this.changeAndroid} onBlur={this.checkAndroid} placeholder='' />
            {androidError ? <span className='checkInvalid'>Android地址不能为空！</span>:null}        
          </li>

          <li className='itemsWrapper high'>
            <p>更新内容:</p>
            <div>
              <textarea value={content} onChange={this.changeContent} onBlur={this.checkContent} />
              {contentError ? <span className='checkInvalid'>{ contentErrorMsg }</span> : null }
            </div>
          </li>
        </ul>

        <div className='btnArea'>
          <Popconfirm title="确定要添加么?" onConfirm={this.comleteEdit} onCancel={this.cancelPost} okText="确认" cancelText="取消">
            <Button type='primary' >确认</Button>
          </Popconfirm>
          <Button onClick={this.cancel} >返回</Button>
        </div>
      </div>
    )
  }
}

export default VersionInfo
