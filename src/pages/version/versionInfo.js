/* fetch the latest version number */
/* 
  1. Fetch when 'system' and 'envType' is set.
  2. If edit, does not need to fetch.
*/

import React from 'react'

import { Button, Popconfirm } from 'antd'
import AjaxHandler from '../../util/ajax'
import BasicSelectorWithoutAll from '../component/basicSelectorWithoutAll'
import Noti from '../../util/noti'
import CONSTANTS from '../../constants'
import PicturesWall from '../component/picturesWall'

class VersionInfo extends React.Component {
  constructor(props) {
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
      defaultAddr: {},
      systemError: false,
      method: '',
      methodError: false,
      url: '',
      urlError: false,
      apkError: false,
      fileList: [],
      envType: '',
      envError: false
    }
  }
  fetchData = body => {
    let resource = '/version/one'
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data) {
          this.setState(json.data)
          this.setState({ originalVersion: json.data.versionNo })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
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
  getDefaultVersion(arr) {
    let reversed = arr.reverse()
    let over = false
    reversed.forEach((r, index, current) => {
      if (!over) {
        let i = parseInt(r, 10)
        if (i < 9) {
          r = i + 1
          current[index] = r
          // if not the last number change, all later numbers clear to 0
          if (index > 0) {
            for (let j = 0; j < index; j++) {
              current[j] = 0
            }
          }
          over = true
        }
      }
    })
    return reversed.reverse().join('.')
  }
  fetchVersion(body) {
    let resource = '/version/list'
    body.page = 1
    body.size = 1
    const cb = json => {
      if (json.data && json.data.versions) {
        let key = body.envType.toString() + body.system.toString()
        let nextState = {}
        let { defaultAddr } = this.state
        let addr = JSON.parse(JSON.stringify(defaultAddr))
        if (json.data.versions.length > 0) {
          let no = json.data.versions[0].versionNo
          if (no) {
            let vs = no.split('.')
            let vnumber = this.getDefaultVersion(vs)
            addr[key] = vnumber || ''
          }
        }
        nextState.defaultAddr = addr
        this.setState(nextState)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  postInfo = () => {
    let {
      system,
      versionNo,
      type,
      method,
      url,
      content,
      id,
      fileList,
      envType,
      posting
    } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })
    const body = {
      system: parseInt(system, 10),
      versionNo: versionNo,
      type: parseInt(type, 10),
      content: content,
      envType: parseInt(envType, 10)
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
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/version')
        } else {
          Noti.hintServiceError(json.error.displayMessage)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null)
  }
  completeEdit = () => {
    let {
        system,
        versionNo,
        type,
        method,
        url,
        content,
        fileList,
        envType,
        checking,
        posting
      } = this.state,
      nextState = {}
    if (!system) {
      nextState.systemError = true
      return this.setState(nextState)
    }
    nextState.systemError = false
    if (!envType) {
      nextState.envError = true
      return this.setState(nextState)
    }
    nextState.envError = false
    if (!versionNo) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号不能为空！'
      return this.setState(nextState)
    }
    if (!/^[1-9]\d?\.[0-9]\d?\.[0-9]\d?(\.[0-9]\d?)?$/.test(versionNo)) {
      nextState.codeError = true
      nextState.codeErrorMsg =
        '版本号格式不正确，请输入如1.1.1或1.1.1.1格式的数字,每个数字不超过两位'
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
      return (nextState.urlError = true)
    }
    nextState.urlError = false
    if (method === '2' && fileList.length === 0) {
      nextState.apkError = true
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
    if (checking || posting) {
      return
    }
    // this.postInfo()
    this.checkExist(this.postInfo)
  }
  cancel = () => {
    this.props.history.goBack()
  }
  cancelPost = () => {
    // nothing
  }
  changeCode = e => {
    let v = e.target.value
    this.setState({
      versionNo: v
    })
  }
  checkCode = e => {
    let v = e.target.value.trim(),
      nextState = { versionNo: v }
    if (!v) {
      nextState.codeError = true
      nextState.codeErrorMsg = '版本号不能为空！'
      return this.setState(nextState)
    }
    if (!/^[1-9]\d?\.[0-9]\d?\.[0-9]\d?(\.[0-9]\d?)?$/.test(v)) {
      nextState.codeError = true
      nextState.codeErrorMsg =
        '版本号格式不正确，请输入如1.1.1或1.1.1.1格式的数字,每个数字不超过两位'
      return this.setState(nextState)
    }
    nextState.codeError = false
    nextState.codeErrorMsg = ''
    this.setState(nextState)
    this.checkExist(null)
  }
  checkExist = callback => {
    let {
      versionNo,
      id,
      system,
      originalVersion,
      envType,
      checking
    } = this.state
    if (!envType) {
      return
    }
    if (id && versionNo.trim() === originalVersion) {
      callback && callback()
      return
    }
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/version/check'
    const body = {
      system: parseInt(system, 10),
      versionNo: versionNo.trim(),
      envType: parseInt(envType, 10)
    }
    const cb = json => {
      const nextState = {
        checking: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        let result = json.data.result
        if (result) {
          Noti.hintLock('添加出错', '该版本号已存在于系统中，请勿重复添加')
          nextState.codeError = true
          nextState.codeErrorMsg = '该版本号已存在于系统中，请勿重复添加'
        } else {
          callback && callback()
        }
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeType = v => {
    let nextState = {}
    nextState.type = v
    this.setState(nextState)
  }
  checkType = v => {
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
  changeContent = e => {
    let v = e.target.value
    this.setState({
      content: v
    })
  }
  checkContent = e => {
    let v = e.target.value.trim(),
      nextState = { content: v }
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
  changeSystem = v => {
    let nextState = {
      system: v
    }
    let { envType, defaultAddr } = this.state
    // if 'envType' is set
    if (envType) {
      let envSys = envType.toString() + v
      if (defaultAddr[envSys]) {
        // let addArr = defaultAddr[envSys].split('-')
        nextState.versionNo = defaultAddr[envSys]
      } else {
        const body = {
          envType: parseInt(envType, 10),
          system: parseInt(v, 10)
        }
        this.fetchVersion(body)
      }
    }
    this.setState(nextState)
  }
  checkSystem = v => {
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
  setImages = fileList => {
    this.setState({
      fileList: JSON.parse(JSON.stringify(fileList))
    })
  }
  changeMethod = v => {
    this.setState({
      method: v
    })
  }
  checkMethod = v => {
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
  changeUrl = e => {
    this.setState({
      url: e.target.value
    })
  }
  checkUrl = e => {
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
  changeEnv = v => {
    let nextState = {
      envType: v
    }

    let { system, defaultAddr } = this.state
    // if 'system' is set
    if (system) {
      let envSys = v + system.toString()
      if (defaultAddr[envSys]) {
        nextState.versionNo = defaultAddr[envSys]
      } else {
        const body = {
          envType: parseInt(v, 10),
          system: parseInt(system, 10)
        }
        this.fetchVersion(body)
      }
    }
    this.setState(nextState)
  }
  checkEnv = v => {
    if (!v) {
      return this.setState({
        envError: true
      })
    }
    if (this.state.envError) {
      this.setState({
        envError: false
      })
    }
  }
  render() {
    let {
      id,
      type,
      typeError,
      versionNo,
      codeError,
      codeErrorMsg,
      content,
      contentError,
      contentErrorMsg,
      system,
      systemError,
      method,
      methodError,
      url,
      urlError,
      apkError,
      fileList,
      posting,
      envType,
      envError
    } = this.state

    return (
      <div className="infoList versionInfo">
        <ul>
          <li>
            <p>选择系统:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              disabled={id}
              className={id ? 'disabled' : ''}
              staticOpts={CONSTANTS.SYSTEMS}
              selectedOpt={system.toString()}
              changeOpt={this.changeSystem}
              checkOpt={this.checkSystem}
              invalidTitle="选择系统"
            />
            {systemError ? (
              <span className="checkInvalid">系统不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>选择环境:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              disabled={id}
              className={id ? 'disabled' : ''}
              staticOpts={CONSTANTS.VERSIONENV}
              selectedOpt={envType}
              changeOpt={this.changeEnv}
              checkOpt={this.checkEnv}
              invalidTitle="选择环境"
            />
            {envError ? (
              <span className="checkInvalid">环境不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>版本号:</p>
            <input
              value={versionNo}
              onChange={this.changeCode}
              onBlur={this.checkCode}
              placeholder=""
            />
            {codeError ? (
              <span className="checkInvalid">{codeErrorMsg}</span>
            ) : null}
          </li>
          <li>
            <p>更新方式:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              staticOpts={CONSTANTS.UPDATETYPE}
              selectedOpt={type.toString()}
              changeOpt={this.changeType}
              checkOpt={this.checkType}
              invalidTitle="选择方式"
            />
            {typeError ? (
              <span className="checkInvalid">更新方式不能为空！</span>
            ) : null}
          </li>

          <li>
            <p>地址输入方式:</p>
            <BasicSelectorWithoutAll
              width={'140px'}
              staticOpts={CONSTANTS.VERSIONADDMETHOD}
              selectedOpt={method}
              changeOpt={this.changeMethod}
              checkOpt={this.checkMethod}
              invalidTitle="选择方式"
            />
            {methodError ? (
              <span className="checkInvalid">更新方式不能为空！</span>
            ) : null}
            {apkError ? (
              <span className="checkInvalid">请上传安装包！</span>
            ) : null}
          </li>

          {method === '1' || id ? (
            <li>
              <p>地址:</p>
              <input
                className="long"
                type="url"
                value={url}
                onChange={this.changeUrl}
                onBlur={this.checkUrl}
                placeholder=""
              />
              {urlError ? (
                <span className="checkInvalid">地址不能为空！</span>
              ) : null}
            </li>
          ) : null}

          {method === '2' ? (
            <li className="itemsWrapper">
              <p>安装包上传:</p>
              <PicturesWall
                accept="*"
                limit={1}
                setImages={this.setImages}
                fileList={fileList}
                dir="version-apk"
              />
            </li>
          ) : null}

          <li className="itemsWrapper high">
            <p>更新内容:</p>
            <div>
              <textarea
                value={content}
                onChange={this.changeContent}
                onBlur={this.checkContent}
              />
              {contentError ? (
                <span className="checkInvalid">{contentErrorMsg}</span>
              ) : null}
            </div>
          </li>
        </ul>

        <div className="btnArea">
          {posting ? (
            <Button type="primary">确认</Button>
          ) : (
            <Popconfirm
              title="确定要添加么?"
              onConfirm={this.completeEdit}
              onCancel={this.cancelPost}
              okText="确认"
              cancelText="取消"
            >
              <Button type="primary">确认</Button>
            </Popconfirm>
          )}
          <Button onClick={this.cancel}>返回</Button>
        </div>
      </div>
    )
  }
}

export default VersionInfo
