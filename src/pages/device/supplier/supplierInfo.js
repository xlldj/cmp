import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../../constants'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'

class SupplierInfo extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      id: 0,
      name: '',
      nameError: false,
      alias: '',
      aliasError: false,
      agreement: '',
      agreementError: false,
      notify: '',
      notifyError: false,
      write: '',
      writeError: false,
      service: '',
      serviceError: false
    }
  }
  fetchData = body => {
    let resource = '/supplier/query/one'
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data) {
          let { id, name, alias, agreement } = json.data
          let nextState = {
            id: id,
            name: name,
            originalName: name,
            alias: alias
          }
          if (agreement) {
            nextState.agreement = agreement
          }
          this.setState(nextState)
        } else {
          throw new Error('网络出错，获取数据失败，请稍后重试～')
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
    let { id, name, alias, agreement, write, notify, service } = this.state

    const body = {
      name: name,
      alias: alias,
      agreement: parseInt(agreement, 10),
      notify: notify,
      write: write,
      service: service
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
          // throw new Error('test')
          Noti.hintSuccess(this.props.history, '/device/suppliers')
        } else {
          throw new Error('网络出错，请稍后重试～')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  confirm = () => {
    let { id, name, alias, agreement, write, notify, service } = this.state
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
    if (!agreement) {
      return this.setState({
        agreementError: true
      })
    }
    if (!write) {
      return this.setState({
        writeError: true
      })
    }
    if (!notify) {
      return this.setState({
        notifyError: true
      })
    }
    if (!service) {
      return this.setState({
        serviceError: true
      })
    }
    /* if edit a supplier, name is forbidden to be changed. so no need to check exist */
    if (id) {
      this.completeEdit()
    } else {
      this.checkExist(this.completeEdit)
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
      if (json.data.result) {
        Noti.hintLock('添加出错', '当前供应商已被添加，请返回该项编辑')
      } else {
        if (callback) {
          callback()
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb, null, {
      clearChecking: true,
      thisObj: this
    })
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
  changeAgreement = v => {
    this.setState({
      agreement: v
    })
  }
  changeNotify = e => {
    this.setState({
      notify: e.target.value
    })
  }
  checkNotify = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        notifyError: true,
        notify: v
      })
    }
    const nextState = {
      notify: v
    }
    if (this.state.notifyError) {
      nextState.notifyError = false
    }
    this.setState(nextState)
  }

  changeWrite = e => {
    this.setState({
      write: e.target.value
    })
  }
  checkWrite = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        writeError: true,
        write: v
      })
    }
    const nextState = {
      write: v
    }
    if (this.state.writeError) {
      nextState.writeError = false
    }
    this.setState(nextState)
  }

  changeService = e => {
    this.setState({
      service: e.target.value
    })
  }
  checkService = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        serviceError: true,
        service: v
      })
    }
    const nextState = {
      service: v
    }
    nextState.service = v
    if (this.state.serviceError) {
      nextState.serviceError = false
    }
    this.setState(nextState)
  }

  render() {
    let {
      id,
      name,
      nameError,
      alias,
      aliasError,
      agreement,
      agreementError,
      notify,
      notifyError,
      write,
      writeError,
      service,
      serviceError
    } = this.state

    return (
      <div className="infoList ">
        <ul>
          <li>
            <p>供应商名称:</p>
            <input
              value={name}
              disabled={id ? true : false}
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
            <p>协议:</p>
            <BasicSelectorWithoutAll
              invalidTitle="选择设备协议"
              staticOpts={CONSTANTS.DEVICEPROTOCOL}
              width={CONSTANTS.SELECTWIDTH}
              selectedOpt={agreement}
              changeOpt={this.changeAgreement}
            />
            {agreementError ? (
              <span className="checkInvalid">协议不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>notify_uuid:</p>
            <input
              value={notify}
              onChange={this.changeNotify}
              onBlur={this.checkNotify}
            />
            {notifyError ? (
              <span className="checkInvalid">notify_uuid不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>write_uuid:</p>
            <input
              value={write}
              onChange={this.changeWrite}
              onBlur={this.checkWrite}
            />
            {writeError ? (
              <span className="checkInvalid">write_uuid不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>service_uuid:</p>
            <input
              value={service}
              onChange={this.changeService}
              onBlur={this.checkService}
            />
            {serviceError ? (
              <span className="checkInvalid">service_uuid不能为空！</span>
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
