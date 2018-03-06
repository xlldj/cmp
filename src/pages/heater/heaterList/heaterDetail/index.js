/* this is a version with different timeset for different building of same school */
import React, { Fragment } from 'react'
import moment from 'moment'
import TimePicker from 'rc-time-picker'
import 'rc-time-picker/assets/index.css'

import { Button, Checkbox } from 'antd'

// import AjaxHandler from '../../../../util/ajax'
import AjaxHandler from '../../../../mock/ajax'
import MultiSelectModal from '../../../component/multiSelectModal'
import Noti from '../../../../util/noti'
import AddPlusAbs from '../../../component/addPlusAbs'
import SchoolSelectWithoutAll from '../../../component/schoolSelectorWithoutAll'
// import DeviceWithoutAll from '../../component/deviceWithoutAll'
import CONSTANTS from '../../../../constants'
import BasicSelector from '../../../component/basicSelectorWithoutAll'

const { DEVICE_TYPE_HEATER } = CONSTANTS
const OPTIONS = {
  1: '热水器'
}

class HeaterDetail extends React.Component {
  constructor(props) {
    super(props)
    let waterTanks = [
      {
        area: 0,
        height: 0,
        no: 0,
        range: 0
      },
      {
        area: 0,
        height: 0,
        no: 0,
        range: 0
      }
    ]
    this.state = {
      id: '',
      imei: '',
      imeiError: false,
      schoolId: '',
      schoolError: false,
      buildingIds: [],
      name: '',
      nameError: false,
      hotWaterModelId: '',
      waterHeater: 0,
      replyWaterPump: 0,
      backWaterPump: 0,
      electricMeterRate: '',
      emissionReductionParam: '',
      replenishmentWaterPump: '',
      solarEnergy: false,
      inverter: false,
      waterTanks,
      buildings: [],
      showBuildingSelect: false
    }
    this.buildingColumns = [
      {
        title: '楼栋',
        dataIndex: 'name',
        width: '75%'
      }
    ]
  }
  fetchData = () => {
    let { id } = this.state
    let body = { id }
    let resource = '/api/machine/unit/one'
    let ajax = AjaxHandler.ajax(resource, body, null)
    ajax.then(json => {
      console.log(json)
      this.setState(json.data, () => {
        if (json.data.schoolId) {
          this.fetchBuildings()
        }
      })
    })
  }

  componentDidMount() {
    console.log('mount')
    this.props.hide(false)
    if (this.props.match.params.id) {
      let id = parseInt(this.props.match.params.id.slice(1), 10)
      this.setState(
        {
          id
        },
        this.fetchData
      )
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
  fetchBuildings = () => {
    let { schoolId } = this.state
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
        let buildings = {}
        data.forEach(r => {
          buildings[r.id] = r.name
        })
        this.setState({
          buildings: buildings
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
  showBuildingSelect = e => {
    e.preventDefault()
    this.setState({
      showBuildingSelect: true
    })
  }
  closeBuildingSelect = () => {
    this.setState({
      showBuildingSelect: false
    })
  }

  render() {
    let {
      id,
      imei,
      name,
      schoolId,
      hotWaterModelId,
      waterHeater,
      replyWaterPump,
      replenishmentWaterPump,
      backWaterPump,
      electricMeterRate,
      emissionReductionParam,
      solarEnergy,
      inverter,
      showBuildingSelect,
      buildings,
      waterTanks
    } = this.state
    const waterTankItems =
      waterTanks &&
      waterTanks.map((water, index) => (
        <Fragment>
          <li>
            <p>水箱{index + 1}高度</p>
            <input
              value={water.height}
              onChange={this.changeWaterHeight}
              onBlur={this.checkWaterHeight}
            />
          </li>
          <li>
            <p>水位传感器{index + 1}量程</p>
            <input
              value={water.range}
              onChange={this.changeWaterRange}
              onBlur={this.checkWaterRange}
            />
          </li>
          <li>
            <p>水箱{index + 1}面积</p>
            <input
              value={water.area}
              onChange={this.changeWaterArea}
              onBlur={this.checkWaterArea}
            />
          </li>
        </Fragment>
      ))

    return (
      <div className="infoList timeset">
        <ul>
          <li>
            <p>IMEI</p>
            <input
              value={imei}
              onChange={this.changeImei}
              onBlur={this.checkImei}
            />
          </li>
          <li>
            <p>楼栋</p>
            <a className="mgr10" onClick={this.showBuildingSelect} href="">
              点击选择
            </a>
          </li>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              disabled={id}
              width={CONSTANTS.SELECTWIDTH}
              className={id ? 'disabled' : ''}
              selectedSchool={schoolId.toString()}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />
          </li>
          <li>
            <p>名称</p>
            <input
              value={name}
              onChange={this.changeImei}
              onBlur={this.checkImei}
            />
          </li>
          <li>
            <p>热水机型号</p>
            <input
              value={hotWaterModelId}
              onChange={this.changehotWaterModelId}
              onBlur={this.checkhotWaterModelId}
            />
          </li>
          <li>
            <p>热水机数量</p>
            <input
              value={waterHeater}
              onChange={this.changewaterHeater}
              onBlur={this.checkwaterHeater}
            />
          </li>
          <li>
            <p>供水水泵数量</p>
            <input
              value={replyWaterPump}
              onChange={this.changereplyWaterPump}
              onBlur={this.checkreplyWaterPump}
            />
          </li>
          <li>
            <p>补水水泵数量</p>
            <input
              value={replenishmentWaterPump}
              onChange={this.changereplenishmentWaterPump}
              onBlur={this.checkreplenishmentWaterPump}
            />
          </li>
          <li>
            <p>回水水泵数量</p>
            <input
              value={backWaterPump}
              onChange={this.changebackWaterPump}
              onBlur={this.checkbackWaterPump}
            />
          </li>
          {waterTankItems}
          <li>
            <p>电表倍率</p>
            <input
              value={electricMeterRate}
              onChange={this.changeelectricMeterRate}
              onBlur={this.checkelectricMeterRate}
            />
          </li>
          <li>
            <p>减排参数</p>
            <input
              value={emissionReductionParam}
              onChange={this.changeemissionReductionParam}
              onBlur={this.checkemissionReductionParam}
            />
          </li>
          <li>
            <p>是否存在太阳能</p>
            <Checkbox onChange={this.changesolarEnergy} value={solarEnergy} />
          </li>
          <li>
            <p>是否存在变频器</p>
            <Checkbox onChange={this.changeinverter} value={inverter} />
          </li>
        </ul>

        <div className="btnArea">
          <Button type="primary" onClick={this.confirm}>
            确认
          </Button>
          <Button onClick={this.cancel}>返回</Button>
        </div>

        <MultiSelectModal
          closeModal={this.closeBuildingSelect}
          confirm={this.setBuildings}
          show={showBuildingSelect}
          dataSource={buildings}
          columns={this.buildingColumns}
        />
      </div>
    )
  }
}

export default HeaterDetail
