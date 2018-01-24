import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../component/basicSelectorWithoutAll'

class RateLimitInfo extends React.Component {
  constructor(props) {
    super(props)
    let deviceType = '',
      id = ''
    let deviceTypeError = false
    this.state = {
      id,
      deviceType,
      deviceTypeError,
      schoolId: '',
      schoolError: false,
      originalSchool: '',
      originalDevice: '',
      businesses: [],
      time: '',
      timeError: false,
      money: '',
      moneyError: false,
      posting: false,
      checking: false
    }
  }
  componentDidMount() {
    this.props.hide(false)
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      const body = {
        id: id
      }
      this.fetchData(body)
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  fetchData = body => {
    let resource = '/order/limit/one'
    const cb = json => {
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data) {
          let { id, deviceType, schoolId, time, money } = json.data
          let nextState = {
            id: id,
            deviceType: deviceType,
            schoolId: schoolId,
            originalSchool: schoolId,
            originalDevice: deviceType,
            time: time,
            money: money
          }
          this.setState(nextState)
          this.fetchDeviceTypes(schoolId)
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  fetchDeviceTypes = v => {
    let resource = '/school/business/list'
    const body = {
      id: v
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          this.setState({
            businesses: json.data.businesses
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  confirm = () => {
    let {
      id,
      schoolId,
      originalSchool,
      deviceType,
      originalDevice,
      time,
      money,
      checking,
      posting
    } = this.state
    if (checking || posting) {
      return
    }

    if (!schoolId) {
      return this.setState({
        schoolError: true
      })
    }
    if (!deviceType) {
      return this.setState({
        deviceTypeError: true
      })
    }
    if (!time || time <= 0) {
      return this.setState({
        timeError: true
      })
    }
    if (!money || money <= 0) {
      return this.setState({
        moneyError: true
      })
    }
    if (!(id && originalSchool === schoolId && originalDevice === deviceType)) {
      this.checkExist(this.postInfo)
    } else {
      this.postInfo()
    }
  }

  postInfo = () => {
    if (this.state.posting) {
      return
    }
    this.setState({
      posting: true
    })
    let deviceType = parseInt(this.state.deviceType, 10),
      schoolId = parseInt(this.state.schoolId, 10),
      resource = ''
    let time = parseInt(this.state.time, 10),
      money = parseInt(this.state.money, 10)

    const body = {
      deviceType: deviceType,
      schoolId: schoolId,
      time: time,
      money: money
    }
    if (this.state.id) {
      body.id = this.state.id
      resource = '/order/limit/update'
    } else {
      resource = '/order/limit/add'
    }
    const cb = json => {
      this.setState({
        posting: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/device/rateLimit')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  checkExist = callback => {
    if (this.state.checking) {
      return
    }
    this.setState({
      checking: true
    })
    let dt = parseInt(this.state.deviceType, 10)
    let schoolId = parseInt(this.state.schoolId, 10)
    let resource = '/order/limit/check'
    const body = {
      deviceType: dt,
      schoolId: schoolId
    }
    const cb = json => {
      this.setState({
        checking: false
      })
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else {
        if (json.data.result) {
          Noti.hintLock('添加出错', '当前设备已有扣费速率，请返回该项编辑')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changeSchool = value => {
    let v = parseInt(value, 10)
    this.setState({
      schoolId: v
    })
    this.fetchDeviceTypes(v)
  }
  checkSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let {
      schoolError,
      id,
      originalSchool,
      schoolId,
      deviceType,
      originalDevice
    } = this.state
    if (schoolError) {
      this.setState({
        schoolError: false
      })
    }
    if (!deviceType) {
      // 如果设备类型还未设置，不去check
      return
    }
    if (!(id && originalSchool === schoolId && originalDevice === deviceType)) {
      this.checkExist(null)
    }
  }
  changeDevice = v => {
    if (!v) {
      return this.setState({
        deviceTypeError: true
      })
    }
    let { deviceTypeError } = this.state,
      nextState = {}
    nextState.deviceType = parseInt(v, 10)
    if (deviceTypeError) {
      nextState.deviceTypeError = false
    }
    this.setState(nextState)
  }
  checkDevice = v => {
    if (!v || v === '0') {
      return this.setState({
        deviceTypeError: true
      })
    }
    this.setState({
      deviceTypeError: false
    })
    let {
      id,
      schoolId,
      originalSchool,
      originalDevice,
      deviceType
    } = this.state
    if (!schoolId) {
      return
    }
    if (!(id && originalSchool === schoolId && originalDevice === deviceType)) {
      this.checkExist(null)
    }
  }
  changeTime = e => {
    let v = parseFloat(e.target.value, 10)
    this.setState({
      time: v
    })
  }
  checkTime = e => {
    let v = parseFloat(e.target.value, 10)
    if (!v || v <= 0) {
      return this.setState({
        timeError: true
      })
    }
    if (this.state.timeError) {
      this.setState({
        timeError: false
      })
    }
  }
  changeMoney = e => {
    let v = parseFloat(e.target.value, 10)
    this.setState({
      money: v
    })
  }
  checkMoney = e => {
    let v = parseFloat(e.target.value, 10)
    if (!v || v <= 0) {
      return this.setState({
        moneyError: true
      })
    }
    if (this.state.moneyError) {
      this.setState({
        moneyError: false
      })
    }
  }

  back = () => {
    this.props.history.goBack()
  }
  render() {
    let {
      id,
      deviceType,
      deviceTypeError,
      businesses,
      schoolId,
      schoolError,
      time,
      timeError,
      money,
      moneyError
    } = this.state

    let deviceOptions = {}
    businesses.forEach((d, i) => (deviceOptions[d] = CONSTANTS.DEVICETYPE[d]))

    return (
      <div className="infoList rateLimitInfo">
        <ul>
          <li>
            <p>学校:</p>
            <SchoolSelector
              disabled={id}
              width={CONSTANTS.SELECTWIDTH}
              className={id ? 'disabled' : ''}
              selectedSchool={schoolId}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>设备类型:</p>
            <BasicSelector
              disabled={id}
              width={CONSTANTS.SELECTWIDTH}
              className={id ? 'disabled' : ''}
              invalidTitle="选择设备"
              selectedOpt={deviceType}
              staticOpts={deviceOptions}
              changeOpt={this.changeDevice}
              checkOpt={this.checkDevice}
            />
            {deviceTypeError ? (
              <span className="checkInvalid">设备类型不能为空！</span>
            ) : null}
          </li>
          <li>
            <p>扣费速率:</p>
            <input
              type="number"
              className="shortInput"
              value={time}
              onChange={this.changeTime}
              onBlur={this.checkTime}
            />{' '}
            秒 /
            <input
              type="number"
              className="shortInput"
              value={money}
              onChange={this.changeMoney}
              onBlur={this.checkMoney}
            />{' '}
            元
            {timeError ? (
              <span className="checkInvalid">时间必须为非负整数！</span>
            ) : null}
            {moneyError ? (
              <span className="checkInvalid">金额必须为非负整数！</span>
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

export default RateLimitInfo
