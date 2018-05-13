/* this is a version with different timeset for different building of same school */
import React, { Fragment } from 'react'
import moment from 'moment'

import { Button, TimePicker } from 'antd'

import AjaxHandler from '../../../util/ajax'
import Noti from '../../../util/noti'
import AddPlusAbs from '../../component/addPlusAbs'
import SchoolSelectWithoutAll from '../../component/schoolSelectorWithoutAll'
// import DeviceWithoutAll from '../../component/deviceWithoutAll'
import CONSTANTS from '../../../constants'
import BasicSelector from '../../component/basicSelectorWithoutAll'

const { DEVICE_TYPE_HEATER } = CONSTANTS
const OPTIONS = {
  1: '热水器'
}

const BACKTITLE = {
  fromInfoSet: '返回学校信息设置'
}
const initialBuildingTimeset = {
  buildingId: '',
  items: [
    { startTime: moment('1/1/2017 0:0'), endTime: moment('1/1/2017 23:59') }
  ]
}
const initailTimeset = {
  startTime: moment('1/1/2017 0:0'),
  endTime: moment('1/1/2017 23:59')
}

class TimesetInfo extends React.Component {
  constructor(props) {
    super(props)
    let deviceType = '0',
      items = [
        { startTime: moment('1/1/2017 0:0'), endTime: moment('1/1/2017 23:59') }
      ]
    let deviceTypeError = false,
      selectedSchool = '',
      schoolError = false
    let id = 0
    this.state = {
      deviceType,
      items,
      deviceTypeError,
      selectedSchool,
      schoolError,
      id,
      building: '',
      initialBD: '',
      buildingData: {},
      buildingError: false,
      buildingTimesets: [],
      disabledSchDev: false, // 从上线设置进入供水时间设置
      hasOption: false // Only 'heater' has timeset, check if the school has 'heater' service online.
    }
  }

  fetchData = body => {
    let resource = '/api/time/range/water/one'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
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
          let nextState = {
            deviceType: json.data.deviceType.toString(),
            items: json.data.items,
            selectedSchool: json.data.schoolId
              ? json.data.schoolId.toString()
              : '',
            id: json.data.id,
            initialSchool: json.data.schoolId,
            initialDT: json.data.deviceType,
            hasOption: true // always has 'heater' when edit.
          }
          if (json.data.buildingTimesets) {
            json.data.buildingTimesets.forEach((building, index) => {
              let items = building.items
              items.forEach((r, i) => {
                let start = moment('1/1/2017', 'DD/MM/YYYY'),
                  end = moment('1/1/2017', 'DD/MM/YYYY')
                start.hour(r.startTime.hour)
                start.minute(r.startTime.minute)
                end.hour(r.endTime.hour)
                end.minute(r.endTime.minute)
                r.startTime = start
                r.endTime = end
              })
            })
            nextState.buildingTimesets = json.data.buildingTimesets
          }
          console.log(nextState)
          this.setState(nextState)
          if (json.data.schoolId) {
            this.fetchBuildings(json.data.schoolId)
            this.fetchDeviceTypes(json.data.schoolId)
          }
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.props.hide(false)
    let data = this.props.location.query
    if (data) {
      let { schoolId, deviceType } = data
      this.setState({
        selectedSchool: schoolId,
        deviceType: deviceType.toString(),
        disabledSchDev: true
      })
      this.fetchDeviceTypes(schoolId)
    }
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
    for (let i = 0; i < items.length; i++) {
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

    const buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    for (let i = 0; i < buildingTimesets.length; i++) {
      let r = buildingTimesets[i]
      if (!r.buildingId) {
        r.buildingError = true
        return this.setState({
          buildingTimesets: buildingTimesets
        })
      }
      for (let j = 0; j < r.items.length; j++) {
        let item = r.items[j]
        let start = moment(item.startTime),
          end = moment(item.endTime)
        if (start >= end) {
          item.timeValueError = true
          return this.setState({
            buildingTimesets: buildingTimesets
          })
        }
      }
    }
    let buildingIds = {},
      dups = []
    buildingTimesets.forEach((r, i) => {
      if (buildingIds[r.buildingId]) {
        dups.push(i)
      } else {
        buildingIds[r.buildingId] = 1
      }
    })
    if (dups.length > 0) {
      dups.reverse().forEach(r => {
        buildingTimesets.splice(r, 1)
      })
    }
    this.checkExist(this.postData)
    // this.postData()
  }
  postData = () => {
    let { selectedSchool, deviceType } = this.state
    const items = JSON.parse(JSON.stringify(this.state.items))
    const buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
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
      deviceType: parseInt(deviceType, 10),
      schoolId: parseInt(selectedSchool, 10)
    }
    if (buildingTimesets.length > 0) {
      buildingTimesets.forEach(r => {
        if (r.items.length > 0) {
          r.items.forEach(item => {
            let startTime = {
              hour: moment(item.startTime).hour(),
              minute: moment(item.startTime).minute()
            }
            let endTime = {
              hour: moment(item.endTime).hour(),
              minute: moment(item.endTime).minute()
            }
            item.startTime = startTime
            item.endTime = endTime
            delete item.timeValueError
          })
        }
        r.buildingId = parseInt(r.buildingId, 10)
        delete r.buildingError
      })
      body.buildingTimesets = buildingTimesets
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
      startTime: moment('1/1/2017 0:0'),
      endTime: moment('1/1/2017 23:59')
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
  fetchBuildings = id => {
    let schoolId = parseInt(id, 10)
    const body = {
      page: 1,
      size: 1000,
      schoolId: schoolId,
      residenceLevel: 1
    }
    let resource = '/api/residence/list'
    const cb = json => {
      try {
        let data = json.data.residences
        let buildingData = {}
        data.forEach(r => {
          buildingData[r.id] = r.name
        })
        this.setState({
          buildingData: buildingData
        })
      } catch (e) {
        console.log(e)
      }
    }
    AjaxHandler.ajax(resource, body, cb)
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
    this.fetchBuildings(v)
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
        if (json.data.businesses.includes(DEVICE_TYPE_HEATER)) {
          this.setState({
            hasOption: true
          })
        } else if (this.state.hasOption) {
          this.setState({
            hasOption: false
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
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
    /*let {selectedSchool, deviceType} = this.state
    if (parseInt(selectedSchool, 10) && parseInt(deviceType, 10)) {
      this.checkExist(null)
    }*/
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
    /*let {selectedSchool, deviceType} = this.state
    if (parseInt(selectedSchool, 10) && parseInt(deviceType, 10)) {
      this.checkExist(null)
    }*/
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
  addBuildingTimeset = () => {
    let buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    buildingTimesets.push(initialBuildingTimeset)
    this.setState({
      buildingTimesets: buildingTimesets
    })
  }
  removeBuildingTimeset = () => {
    let buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    buildingTimesets.pop()
    this.setState({
      buildingTimesets: buildingTimesets
    })
  }
  handleBuildingStartTime = (v, i, index) => {
    // 'i' is the index for buildingTimeset Block
    // 'index' is the index of 'items' of each timeset in buildingTimesets
    let buildingTimesets = JSON.parse(
        JSON.stringify(this.state.buildingTimesets)
      ),
      nextState = {}
    buildingTimesets[i].items[index].startTime = v
    nextState.buildingTimesets = buildingTimesets
    let start = v.valueOf(),
      end = moment(buildingTimesets[i].items[index].endTime).valueOf()
    if (start >= end) {
      buildingTimesets[i].items[index].timeValueError = true
    } else if (buildingTimesets[i].items[index].timeValueError) {
      buildingTimesets[i].items[index].timeValueError = false
    }
    this.setState(nextState)
  }
  handleBuildingEndTime = (v, i, index) => {
    // 'i' is the index for buildingTimeset Block
    // 'index' is the index of 'items' of each timeset in buildingTimesets
    let buildingTimesets = JSON.parse(
        JSON.stringify(this.state.buildingTimesets)
      ),
      nextState = {}
    buildingTimesets[i].items[index].endTime = v
    let end = v.valueOf(),
      start = moment(buildingTimesets[i].items[index].startTime).valueOf()
    console.log(start)
    console.log(end)
    if (start >= end) {
      buildingTimesets[i].items[index].timeValueError = true
    } else if (buildingTimesets[i].items[index].timeValueError) {
      buildingTimesets[i].items[index].timeValueError = false
    }
    nextState.buildingTimesets = buildingTimesets
    this.setState(nextState)
  }
  changeBuilding = (v, i) => {
    let buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    buildingTimesets[i].buildingId = v
    buildingTimesets[i].buildingError = false
    this.setState({
      buildingTimesets: buildingTimesets
    })
  }
  addTimeset2Building = i => {
    let buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    buildingTimesets[i].items.push(initailTimeset)
    this.setState({
      buildingTimesets: buildingTimesets
    })
  }
  abstractTimeset2Building = i => {
    let buildingTimesets = JSON.parse(
      JSON.stringify(this.state.buildingTimesets)
    )
    buildingTimesets[i].items.pop()
    this.setState({
      buildingTimesets: buildingTimesets
    })
  }

  render() {
    let {
      id,
      deviceType,
      items,
      deviceTypeError,
      selectedSchool,
      schoolError,
      buildingData,
      buildingTimesets,
      hasOption,
      disabledSchDev
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
              style={{ width: '60px' }}
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

    const buildingTimes =
      buildingTimesets &&
      buildingTimesets.map((r, i) => {
        let times =
          r.items &&
          r.items.map((time, index) => (
            <div key={`time${i}${index}`}>
              <TimePicker
                className="timepicker"
                allowEmpty={false}
                showSecond={false}
                value={moment(time.startTime)}
                onChange={e => {
                  this.handleBuildingStartTime(e, i, index)
                }}
              />
              至
              <TimePicker
                className="timepicker"
                allowEmpty={false}
                showSecond={false}
                value={moment(time.endTime)}
                onChange={e => {
                  this.handleBuildingEndTime(e, i, index)
                }}
              />
              {time.timeValueError ? (
                <span key={`timeerror${i}${index}`} className="checkInvalid">
                  结束时间不能早于开始时间！
                </span>
              ) : null}
            </div>
          ))
        return (
          <Fragment key={`wrapper${i}`}>
            <li key={`building${i}`}>
              <p>选择楼栋:</p>
              <BasicSelector
                width={CONSTANTS.SELECTWIDTH}
                staticOpts={buildingData}
                selectedOpt={r.buildingId}
                changeOpt={v => this.changeBuilding(v, i)}
              />
              {r.buildingError ? (
                <span key={`buildingerror${i}`} className="checkInvalid">
                  楼栋不能为空！
                </span>
              ) : null}
            </li>
            <li className="itemsWrapper" key={`buildingtime${i}`}>
              <p key={`p${i}`}>楼栋供水时间:</p>
              <div>
                {times}
                <AddPlusAbs
                  count={r.items.length}
                  add={() => this.addTimeset2Building(i)}
                  abstract={() => this.abstractTimeset2Building(i)}
                />
              </div>
            </li>
          </Fragment>
        )
      })
    console.log(selectedSchool)

    return (
      <div className="infoList timeset">
        <ul>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              disabled={id || disabledSchDev}
              width={CONSTANTS.SELECTWIDTH}
              className={id || disabledSchDev ? 'disabled' : ''}
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
            <BasicSelector
              disabled={id || disabledSchDev}
              width={CONSTANTS.SELECTWIDTH}
              className={id || disabledSchDev ? 'disabled' : ''}
              staticOpts={hasOption ? OPTIONS : {}}
              selectedOpt={deviceType}
              changeOpt={this.changeDevice}
            />
            {deviceTypeError ? (
              <span className="checkInvalid">设备类型不能为空！</span>
            ) : null}
          </li>
          <li className="itemsWrapper">
            <p>学校供水时段:</p>
            <div>
              {times}
              <AddPlusAbs
                count={items.length}
                add={this.add}
                abstract={this.abstract}
              />
            </div>
          </li>
          {buildingTimes}

          <li className="itemsWrapper">
            <p />
            {selectedSchool && hasOption ? (
              <Button type="primary" onClick={this.addBuildingTimeset}>
                增加楼栋设置
              </Button>
            ) : null}
            {buildingTimesets.length > 0 ? (
              <Button type="primary" onClick={this.removeBuildingTimeset}>
                删除楼栋设置
              </Button>
            ) : null}
          </li>
          {buildingTimesets.length > 0 ? (
            <li>
              <p />
              <span>
                单独给某栋楼设置供水时段后，则这栋楼按单独设置的为准。
              </span>
            </li>
          ) : null}
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
