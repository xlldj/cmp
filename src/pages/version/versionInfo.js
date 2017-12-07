import React from 'react'

import {Button, Popconfirm} from 'antd'
import AjaxHandler from '../ajax'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import Noti from '../noti'
import CONSTANTS from '../component/constants'
import PicturesWall from '../component/picturesWall'

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
      content: '',
      contentError: '',
      contentErrorMsg: '',
      system: '',
      defaultIOS: '',
      defaultAndroid: '',
      systemError: false,
      method: '',
      methodError: false,
      url: '',
      urlError: false,
      method: '',
      apkError: false,
      fileList: []
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
    } else {
      this.getLatestVersion()
    }
  }
  getLatestVersion () {
    this.getLatestIOS()
    this.getLatestAndroid()
  }
  getDefaultVersion (arr) {
    let reversed = arr.reverse()
    let over = false
    reversed.forEach((r, index, current) => {
      if (!over) {
        let i = parseInt(r, 10)
        if (i < 9) {
          r = i + 1
          current[index] = r
          over = true
        }
      }
    })
    return reversed.reverse().join('.')
  }
  getLatestIOS () {
    let resource = '/version/list'
    const body = {
      page: 1,
      size: 1,
      system: 1
    }
    const cb = (json) => {
      if (json.data && json.data.versions) {
        let nextState = {}, defaultIOS = '1.0.0'
        if (json.data.versions.length > 0) {
          let ios = json.data.versions[0].versionNo
          let vs = ios.split('.')
          let nextVersion = this.getDefaultVersion(vs)
          defaultIOS = nextVersion
        }
        nextState.defaultIOS = defaultIOS
        if (this.state.system === '1') {
          nextState.versionNo = defaultIOS
        }
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  getLatestAndroid () {
    let resource = '/version/list'
    const body = {
      page: 1,
      size: 1,
      system: 2
    }
    const cb = (json) => {
      if (json.data && json.data.versions) {
        let nextState = {}, defaultAndroid = '1.0.0'
        if (json.data.versions.length > 0) {
          let android = json.data.versions[0].versionNo
          let vs = android.split('.')
          let nextVersion = this.getDefaultVersion(vs)
          defaultAndroid = nextVersion
        }
        nextState.defaultAndroid = defaultAndroid
        if (this.state.system === '2') {
          nextState.versionNo = defaultAndroid
        }
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentWillUnmount () {
    this.props.hide(true)
  }
  postInfo = () => {
    let {system, versionNo, type, method, url, content, id, fileList} = this.state
    const body = {
      system: system,
      versionNo: versionNo,
      type: parseInt(type, 10),
      content: content
    }
    if (method === '1') {
      body.url = url
    } else if (method === '2') {
      body.url = fileList[0].url
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
    let {system, versionNo, type, method, url, content, fileList} = this.state, nextState = {}
    if (!system) {
      nextState.systemError = true
      return this.setState(nextState)
    }
    nextState.systemError = false
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
    nextState.codeError = false
    if (!type) {
      nextState.typeError = true
      return this.setState(nextState)
    }
    nextState.typeError = false
    if (!method) {
      nextState.methodError = true
      return this.setState(nextState)
    }
    nextState.methodError = false
    if (method === '1' && !url) {
      return nextState.urlError = true
    }
    nextState.urlError = false
    if (method === '2' && fileList.length === 0) {
      nextState.methodError = true
      return this.setState(nextState)
    }
    nextState.methodError = false
    if (!content) {
      nextState.contentError = true
      nextState.contentErrorMsg = '更新内容不能为空！'
      return this.setState(nextState)
    }
    if (content.length > 200) {
      nextState.contentError = true
      nextState.contentErrorMsg = '更新内容不能超过200字'
      return this.setState(nextState)
    }
    nextState.contentError = false
    nextState.contentErrorMsg = ''
    this.setState(nextState)
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
      versionNo: versionNo.trim() 
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
  changeSystem = (v) => {
    let nextState = {
      system: v
    }
    let {defaultIOS, defaultAndroid} = this.state
    if (v === '1') {
      nextState.versionNo = defaultIOS
    } else if (v === '2') {
      nextState.versionNo = defaultAndroid
    }
    this.setState(nextState)
  }
  checkSystem = (v) => {
    if (!v) {
      return this.setState({
        systemError: true
      })
    }
    let nextState = {}
    if (this.state.systemError) {
      nextState.systemError = false
    }
    this.setState(nextState)
  }
  setImages = (fileList) => {
    this.setState({
      fileList: JSON.parse(JSON.stringify(fileList))
    })
  }
  changeMethod = (v) => {
    this.setState({
      method: v
    })
  }
  checkMethod = (v) => {
    if (!v) {
      this.setState({
        methodError: true
      })
    }
    if (this.state.methodError) {
      this.setState({
        methodError: false
      })
    }
  }
  changeUrl = (e) => {
    this.setState({
      url: e.target.value
    })
  }
  checkUrl = (e) => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        urlError: true,
        url: v
      })
    }
    if (this.state.urlError) {
      this.setState({
        url: v,
        urlError: false
      })
    }
  }

  render () {
    let {id, type, typeError, versionNo, codeError, codeErrorMsg, 
      content, contentError, contentErrorMsg,
      system, systemError, method, methodError,
      url, urlError, apkError, fileList
    } = this.state

    return (
      <div className='infoList versionInfo'>
        <ul>
          <li>
            <p>选择系统:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              disabled={id} 
              staticOpts={CONSTANTS.SYSTEMS}  
              selectedOpt={system.toString()} 
              changeOpt={this.changeSystem}
              checkOpt={this.checkSystem}
              invalidTitle='选择系统'
            />
            {systemError ? <span className='checkInvalid'>系统不能为空！</span>:null}        
          </li>
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
              selectedOpt={type.toString()} 
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              invalidTitle='选择方式'
            />
            {typeError ? <span className='checkInvalid'>更新方式不能为空！</span>:null}        
          </li>

          <li>
            <p>地址输入方式:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              staticOpts={CONSTANTS.VERSIONADDMETHOD}  
              selectedOpt={method} 
              changeOpt={this.changeMethod}
              checkOpt={this.checkMethod}
              invalidTitle='选择方式'
            />
            {methodError ? <span className='checkInvalid'>更新方式不能为空！</span>:null}        
          </li>

          {
            method === '1' || id ?
              <li>
                <p>地址:</p>
                <input className='long' type='url' value={url} onChange={this.changeUrl} onBlur={this.checkUrl} placeholder='' />
                {urlError ? <span className='checkInvalid'>地址不能为空！</span>:null}        
              </li>
            : null
          }

          {
            method === '2' ?
              <li className='itemsWrapper'>
                <p>安装包上传:</p>
                <PicturesWall accept='*' limit={1} setImages={this.setImages} fileList={fileList} dir='version-apk' /> 
                {apkError ? <span className='checkInvalid'>请上传安装包！</span>:null}        
              </li>
            : null
          }

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
