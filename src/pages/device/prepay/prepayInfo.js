import React from 'react'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import CONSTANTS from '../../component/constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import BasicSelector from '../../component/basicSelectorWithoutAll'
const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
const initialItems = [{ prepay: '' }]
const initialDrinkItems = [
  [{ prepay: '', usefor: 1 }],
  [{ prepay: '', usefor: 2 }],
  [{ prepay: '', usefor: 3 }]
]
class PrepayInfo extends React.Component {
  constructor(props) {
    super(props)
    let deviceType = '',
      id = 0
    let items = initialItems
    let drinkItems = initialDrinkItems
    let deviceTypeError = false
    this.state = {
      id,
      deviceType,
      items,
      drinkItems,
      deviceTypeError,
      schoolId: '',
      schoolError: false,
      originalSchool: '',
      originalDevice: '',
      minPrepay: 1,
      minError: false,
      prepay: '',
      prepayError: false,
      businesses: [],
      minErrorMsg: ''
    }
  }
  fetchData = body => {
    let resource = '/api/device/prepay/option/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          let { id, deviceType, schoolId, minPrepay, prepay } = json.data
          let nextState = {
            id: id,
            deviceType: deviceType,
            schoolId: schoolId,
            originalSchool: schoolId,
            originalDevice: deviceType
          }
          this.fetchDeviceTypes(schoolId)
          if (minPrepay) {
            nextState.minPrepay = minPrepay
          }
          if (prepay) {
            nextState.prepay = prepay
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
  checkItems = () => {
    let items = JSON.parse(JSON.stringify(this.state.items)),
      nextState = { items: items }
    for (let i = 0; i < items.length; i++) {
      let record = items[i]
      if (!record.prepay) {
        record.error = true
        this.setState(nextState)
        return false
      } else if (record.error) {
        record.error = false
      }
    }
    this.setState(nextState)
    return true
  }
  checkDrinkItems = () => {
    let drinkItems = JSON.parse(JSON.stringify(this.state.drinkItems)),
      nextState = { drinkItems: drinkItems }
    for (let i = 0; i < drinkItems.length; i++) {
      let r = drinkItems[i]
      for (let j = 0; j < r.length; j++) {
        let record = r[j]
        if (!record.prepay) {
          record.error = true
          this.setState(nextState)
          return false
        } else if (record.error) {
          record.error = false
        }
      }
    }
    this.setState(nextState)
    return true
  }
  completeEdit = () => {
    let deviceType = parseInt(this.state.deviceType, 10),
      schoolId = parseInt(this.state.schoolId, 10),
      resource = ''
    let minPrepay = parseInt(this.state.minPrepay, 10),
      prepay = parseInt(this.state.prepay, 10)

    const body = {
      deviceType: deviceType,
      schoolId: schoolId,
      minPrepay: minPrepay,
      prepay: prepay
    }
    if (this.props.match.params.id) {
      body.id = this.state.id
      resource = '/api/device/prepay/option/update'
    } else {
      resource = '/api/device/prepay/option/add'
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/device/prepay')
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
      prepay,
      minPrepay
    } = this.state
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
    if (!prepay || prepay < 1) {
      return this.setState({
        prepayError: true
      })
    }
    if (!minPrepay) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付不能为空'
      })
    }
    if (minPrepay < 1) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付必须为不小于1的整数'
      })
    }
    if (minPrepay > prepay) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付不能大于预付金额'
      })
    }
    if (!(id && originalSchool === schoolId && originalDevice === deviceType)) {
      this.checkExist(this.completeEdit)
    } else {
      this.completeEdit()
    }
  }
  back = () => {
    this.props.history.goBack()
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
    if (v === 2) {
      nextState.items = initialItems
    } else {
      nextState.drinkItems = initialDrinkItems
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
  checkExist = callback => {
    let dt = parseInt(this.state.deviceType, 10)
    let schoolId = parseInt(this.state.schoolId, 10)
    let resource = '/device/prepay/option/check'
    const body = {
      deviceType: dt,
      schoolId: schoolId
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data.result) {
          Noti.hintLock('添加出错', '当前设备已有预付选项，请返回该项编辑')
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  changePrepay = e => {
    let v = parseInt(e.target.value, 10)
    this.setState({
      prepay: v
    })
  }
  checkPrepay = e => {
    let v = parseInt(e.target.value, 10)
    if (!v || v < 1) {
      return this.setState({
        prepayError: true
      })
    }
    if (this.state.prepayError) {
      this.setState({
        prepayError: false
      })
    }
  }
  abstractItem = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.pop()
    this.setState({
      items: items
    })
  }
  addItem = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.push({ prepay: '' })
    this.setState({
      items: items
    })
  }
  changeDrinkPrepay = (e, i, index) => {
    const drinkItems = JSON.parse(JSON.stringify(this.state.drinkItems))
    drinkItems[i][index].prepay = e.target.value
    this.setState({
      drinkItems: drinkItems
    })
  }
  checkDrinkPrepay = (e, i, index) => {
    const drinkItems = JSON.parse(JSON.stringify(this.state.drinkItems))
    if (!drinkItems[i][index].prepay) {
      drinkItems[i][index].error = true
      this.setState({
        drinkItems: drinkItems
      })
    }
  }
  abstractDrinkItem = i => {
    const drinkItems = JSON.parse(JSON.stringify(this.state.drinkItems))
    drinkItems[i].pop()
    this.setState({
      drinkItems: drinkItems
    })
  }
  addDrinkItem = i => {
    const drinkItems = JSON.parse(JSON.stringify(this.state.drinkItems))
    let usefor = i + 1
    drinkItems[i].push({ prepay: '', usefor: usefor })
    this.setState({
      drinkItems: drinkItems
    })
  }
  changeSchool = value => {
    let v = parseInt(value, 10)
    this.setState({
      schoolId: v
    })
    this.fetchDeviceTypes(v)
  }
  fetchDeviceTypes = v => {
    let resource = '/api/school/business/list'
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
  changeMin = e => {
    let v = parseInt(e.target.value, 10)
    this.setState({
      minPrepay: v
    })
  }
  checkMin = e => {
    let v = parseInt(e.target.value, 10)
    if (!v) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付不能为空'
      })
    }
    if (v < 1) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付必须为不小于1的整数'
      })
    }
    if (this.state.prepay && v > this.state.prepay) {
      return this.setState({
        minError: true,
        minErrorMsg: '最低预付不能大于预付金额'
      })
    }
    if (this.state.minError) {
      this.setState({
        minError: false
      })
    }
  }

  render() {
    let {
      id,
      deviceType,
      businesses,
      deviceTypeError,
      prepay,
      prepayError,
      schoolId,
      schoolError,
      minPrepay,
      minError,
      minErrorMsg
    } = this.state
    let deviceOptions = {}
    businesses.forEach((d, i) => (deviceOptions[d] = CONSTANTS.DEVICETYPE[d]))

    return (
      <div className="infoList prepayInfo">
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
            <p>预付金额:</p>
            <input
              type="number"
              value={prepay}
              onChange={this.changePrepay}
              onBlur={this.checkPrepay}
            />元
            {prepayError ? (
              <span className="checkInvalid">预付金额必须为非负整数！</span>
            ) : null}
          </li>
          <li>
            <p>最低预付金额:</p>
            <input
              type="number"
              value={minPrepay}
              onChange={this.changeMin}
              onBlur={this.checkMin}
            />元
            {minError ? (
              <span className="checkInvalid">{minErrorMsg}</span>
            ) : null}
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.back}>
            {this.props.location.state
              ? BACKTITLE[this.props.location.state.path]
              : '返回'}
          </Button>
        </div>
      </div>
    )
  }
}

export default PrepayInfo
