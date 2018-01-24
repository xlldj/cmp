import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'

class SupplierInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: 0,
      name: '',
      nameError: false,
      alias: '',
      aliasError: false,
      version: '',
      versionError: false,
      posting: false,
      checking: false,
      originalName: ''
    }
  }
  fetchData = body => {
    let resource = '/supplier/query/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let { id, name, alias, version } = json.data
          let nextState = {
            id: id,
            name: name,
            originalName: name,
            alias: alias
          }
          if (version) {
            nextState.version = version
          }
          this.setState(nextState)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      const body = {
        id: parseInt(this.props.match.params.id.slice(1), 10)
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  completeEdit = () => {
    let { id, name, alias, version, posting } = this.state
    if (posting) {
      return
    }
    this.setState({
      posting: true
    })

    const body = {
      name: name,
      alias: alias
    }
    if (version) {
      body.version = version
    }
    const resource = '/supplier/save'
    if (id) {
      body.id = id
    }
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/device/suppliers')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  confirm = () => {
    let { id, name, alias, originalName, checking, posting } = this.state
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    if (!alias) {
      return this.setState({
        aliasError: true
      })
    }
    if (checking || posting) {
      return
    }
    /*版本号可以为空 
    if (!version) {
      return this.setState({
        versionError: true
      })
    }*/
    if (!(id && originalName === name)) {
      this.checkExist(this.completeEdit)
    } else {
      this.completeEdit()
    }
    // this.completeEdit()
  }
  back = () => {
    this.props.history.goBack()
  }
  /* -----需要改成对应的查重------ */
  checkExist = (callback, state) => {
    let { name, checking } = { ...this.state, ...state }
    if (checking) {
      return
    }
    this.setState({
      checking: true
    })
    let resource = '/supplier/check'
    const body = {
      name: name
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          Noti.hintLock('添加出错', '当前供应商已被添加，请勿重复添加！')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeName = e => {
    this.setState({
      name: e.target.value
    })
  }
  checkName = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        nameError: true,
        name: v
      })
    }
    let nextState = {
      name: v
    }
    if (this.state.nameError) {
      nextState.nameError = false
    }
    this.setState(nextState)
    this.checkExist(null, { name: v })
  }
  changeAlias = e => {
    this.setState({
      alias: e.target.value
    })
  }
  checkAlias = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        aliasError: true,
        alias: v
      })
    }
    let nextState = {
      alias: v
    }
    if (this.state.aliasError) {
      nextState.aliasError = false
    }
    this.setState(nextState)
  }
  changeVersion = e => {
    this.setState({
      version: e.target.value
    })
  }

  render() {
    let {
      name,
      nameError,
      alias,
      aliasError,
      version,
      versionError
    } = this.state

    return (
      <div className="infoList ">
        <ul>
          <li>
            <p>供应商名称:</p>
            <input
              value={name}
              onChange={this.changeName}
              onBlur={this.checkName}
            />
            {nameError ? (
              <span className="checkInvalid">供应商名字不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>别名:</p>
            <input
              value={alias}
              onChange={this.changeAlias}
              onBlur={this.checkAlias}
            />
            {aliasError ? (
              <span className="checkInvalid">别名不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>版本号:</p>
            <input value={version} onChange={this.changeVersion} />
            {versionError ? (
              <span className="checkInvalid">别名不能为空！</span>
            ) : null}
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default SupplierInfo
