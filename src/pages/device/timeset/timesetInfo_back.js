import React from 'react'
import moment from 'moment'
import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'

import { Button } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import AddPlusAbs from '../../component/addPlusAbs'
import SchoolSelectWithoutAll from '../../component/schoolSelectorWithoutAll'
import DeviceWithoutAll from '../../component/deviceWithoutAll'
import CONSTANTS from '../../../constants'

const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
class TimesetInfo extends React.Component {
  constructor(props) {
    super(props)
    let deviceType = '0',
      items = [
        {
          startTime: moment('1/1/2017', 'DD/MM/YYYY'),
          endTime: moment('1/1/2017', 'DD/MM/YYYY')
        }
      ],
      deviceTypeError = false,
      selectedSchool = '0',
      schoolError = false
    let id = 0
    this.state = {
      deviceType,
      items,
      deviceTypeError,
      selectedSchool,
      schoolError,
      id
    }
  }
  fetchData = body => {
    let resource = '/api/time/range/water/one'
    const cb = json => {
      if (json.error) {
        throw json.error.displayMessage || json.error
      } else {
        if (json.data) {
          json.data.items.forEach((r, i) => {
            let start = moment('1/1/2017', 'DD/MM/YYYY'),
              end = moment('1/1/2017', 'DD/MM/YYYY')
            start.hour(r.startTime.hour)
            start.minute(r.startTime.minute)
            end.hour(r.endTime.hour)
            end.minute(r.endTime.minute)
            r.startTime = start
            r.endTime = end
          })
          this.setState({
            deviceType: json.data.deviceType.toString(),
            items: json.data.items,
            selectedSchool: json.data.schoolId,
            id: json.data.id,
            initialSchool: json.data.schoolId,
            initialDT: json.data.deviceType
          })
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
  confirm = () => {
    this.checkExist(this.completeEdit)
  }
  completeEdit = () => {
    let { selectedSchool, deviceType } = this.state
    if (!selectedSchool || selectedSchool === '0') {
      return this.setState({
        schoolError: true
      })
    }
    if (!deviceType || deviceType === '0') {
      return this.setState({
        deviceTypeError: true
      })
    }
    const items = JSON.parse(JSON.stringify(this.state.items))
    for (let i = 0, l = items.length; i < l; i++) {
      let r = items[i]
      if (r.timeValueError) {
        return
      }
      let start = moment(r.startTime),
        end = moment(r.endTime)
      if (start >= end) {
        r.timeValueError = true
        return this.setState({
          items: items
        })
      }
    }
    items.forEach((r, i) => {
      let startTime = {
        hour: moment(r.startTime).hour(),
        minute: moment(r.startTime).minute()
      }
      let endTime = {
        hour: moment(r.endTime).hour(),
        minute: moment(r.endTime).minute()
      }
      r.startTime = startTime
      r.endTime = endTime
      delete r.timeValueError
    })
    const body = {
      items: items,
      deviceType: parseInt(this.state.deviceType, 10),
      schoolId: parseInt(this.state.selectedSchool, 10)
    }
    let resource
    if (this.props.match.params.id) {
      body.id = parseInt(this.props.match.params.id.slice(1), 10)
      resource = '/api/time/range/water/update'
    } else {
      resource = '/api/time/range/water/add'
    }
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        /*--------redirect --------*/
        if (json.data) {
          Noti.hintSuccess(this.props.history, '/device/timeset')
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  cancel = () => {
    this.props.history.goBack()
  }
  add = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.push({
      startTime: moment('1/1/2017', 'DD/MM/YYYY'),
      endTime: moment('1/1/2017', 'DD/MM/YYYY')
    })
    this.setState({
      items: items
    })
  }
  abstract = () => {
    const items = JSON.parse(JSON.stringify(this.state.items))
    items.pop()
    this.setState({
      items: items
    })
  }
  handleStartTime = (v, i) => {
    let items = JSON.parse(JSON.stringify(this.state.items)),
      nextState = {}
    items[i].startTime = v
    nextState.items = items
    let start = v.valueOf(),
      end = moment(items[i].endTime).valueOf()
    if (start >= end) {
      items[i].timeValueError = true
    } else if (items[i].timeValueError) {
      items[i].timeValueError = false
    }
    this.setState(nextState)
  }
  handleEndTime = (v, i) => {
    let items = JSON.parse(JSON.stringify(this.state.items)),
      nextState = {}
    items[i].endTime = v
    nextState.items = items
    let end = v.valueOf(),
      start = moment(items[i].startTime).valueOf()
    if (start >= end) {
      items[i].timeValueError = true
    } else if (items[i].timeValueError) {
      items[i].timeValueError = false
    }

    this.setState(nextState)
  }
  changeSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let nextState = {}
    if (this.state.schoolError) {
      nextState.schoolError = false
    }
    nextState.selectedSchool = parseInt(v, 10)
    this.setState(nextState)
  }
  checkSchool = v => {
    if (!v || v === '0') {
      return this.setState({
        schoolError: true
      })
    }
    this.setState({
      schoolError: false
    })
    let { selectedSchool, deviceType } = this.state
    if (parseInt(selectedSchool, 10) && parseInt(deviceType, 10)) {
      this.checkExist(null)
    }
  }
  changeDevice = v => {
    if (!v) {
      return this.setState({
        deviceTypeError: true
      })
    }
    let nextState = {}
    if (this.state.deviceTypeError) {
      nextState.deviceTypeError = false
    }
    nextState.deviceType = v
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
    let { selectedSchool, deviceType } = this.state
    if (parseInt(selectedSchool, 10) && parseInt(deviceType, 10)) {
      this.checkExist(null)
    }
  }
  checkExist = callback => {
    let {
      selectedSchool,
      deviceType,
      id,
      initialSchool,
      initialDT
    } = this.state
    if (
      id &&
      parseInt(selectedSchool, 10) === initialSchool &&
      parseInt(deviceType, 10) === initialDT
    ) {
      if (callback) {
        callback()
      }
      return
    }
    let resource = '/time/range/water/check'
    const body = {
      schoolId: parseInt(selectedSchool, 10),
      deviceType: parseInt(deviceType, 10)
    }
    const cb = json => {
      if (json.error) {
        throw json.error.displayMessage || json.error
      } else {
        if (json.data.result) {
          Noti.hintLock(
            '操作出错',
            '当前学校已有该类型设备的供水时间设置，请勿重复添加'
          )
        } else {
          if (callback) {
            callback()
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  render() {
    let {
      id,
      deviceType,
      items,
      deviceTypeError,
      selectedSchool,
      schoolError
    } = this.state
    const times =
      items &&
      items.map((r, i) => {
        return (
          <div key={`time${i}`}>
            <TimePicker
              className="timepicker"
              allowEmpty={false}
              showSecond={false}
              value={moment(r.startTime)}
              onChange={e => {
                this.handleStartTime(e, i)
              }}
            />
            至
            <TimePicker
              className="timepicker"
              allowEmpty={false}
              showSecond={false}
              value={moment(r.endTime)}
              onChange={e => {
                this.handleEndTime(e, i)
              }}
            />
            {r.timeValueError ? (
              <span className="checkInvalid">结束时间不能早于开始时间！</span>
            ) : null}
          </div>
        )
      })
    return (
      <div className="infoList timeset">
        <ul>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              disabled={id}
              width={CONSTANTS.SELECTWIDTH}
              className={id ? 'disabled' : ''}
              selectedSchool={selectedSchool.toString()}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
            {schoolError ? (
              <span className="checkInvalid">学校不能为空！</span>
            ) : null}
          </li>

          <li>
            <p>设备类型:</p>
            <DeviceWithoutAll
              disabled={id}
              width={CONSTANTS.SELECTWIDTH}
              className={id ? 'disabled' : ''}
              selectedDevice={deviceType}
              changeDevice={this.changeDevice}
              checkDevice={this.checkDevice}
            />
            {deviceTypeError ? (
              <span className="checkInvalid">设备类型不能为空！</span>
            ) : null}
          </li>
          <li className="itemsWrapper">
            <p>供水时段:</p>
            <div>
              {times}
              <AddPlusAbs
                count={items.length}
                add={this.add}
                abstract={this.abstract}
              />
            </div>
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.cancel}>
            {this.props.location.state
              ? BACKTITLE[this.props.location.state.path]
              : '返回'}
          </Button>
        </div>
      </div>
    )
  }
}

export default TimesetInfo
