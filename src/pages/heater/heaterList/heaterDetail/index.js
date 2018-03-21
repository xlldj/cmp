import React, { Fragment } from 'react'
import 'rc-time-picker/assets/index.css'

import { Button, Checkbox } from 'antd'

import AjaxHandler from '../../../../util/ajax'
import MultiSelectModal from '../../../component/multiSelectModal'
import Noti from '../../../../util/noti'
import SchoolSelectWithoutAll from '../../../component/schoolSelectorWithoutAll'
import CONSTANTS from '../../../../constants'
import { deepCopy } from '../../../../util/copy'

const {
  HEATER_STATUS_REGISTERD,
  EFFECTIVE,
  EFFECTIVE_YES,
  EFFECTIVE_NO
} = CONSTANTS

class HeaterDetail extends React.PureComponent {
  constructor(props) {
    super(props)
    let waterTanks = [
      {
        area: '',
        height: '',
        no: 1,
        range: ''
      },
      {
        area: '',
        height: '',
        no: 2,
        range: ''
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
      waterHeater: '',
      replyWaterPump: '',
      backWaterPump: '',
      electricMeterRate: '',
      emissionReductionParam: '',
      replenishmentWaterPump: '',
      solarEnergy: 2,
      waterTanks,
      residences: [],
      supplyWaterPressureRange: '',
      residenceError: false,
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
    let ajax = AjaxHandler.fetch(resource, body, null)
    ajax.then(json => {
      if (json && json.data) {
        let { waterTanks } = this.state
        let wts_in_json = json.data.waterTanks
        console.log(json.data)
        wts_in_json.forEach((wt_in_json, i) => {
          let the_wt_in_state = waterTanks.findIndex(
            wt_in_state => wt_in_state.no === wt_in_json.no
          )
          if (the_wt_in_state !== -1) {
            waterTanks[the_wt_in_state] = deepCopy(wt_in_json)
          }
        })
        console.log(waterTanks)
        this.setState({ ...json.data, waterTanks }, () => {
          console.log(this.state.waterTanks)
          if (json.data.schoolId) {
            this.fetchBuildings()
          }
        })
      } else {
        this.setState({
          loading: false
        })
      }
    })
  }

  componentDidMount() {
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
    let { name, schoolId, residences } = this.state
    if (!schoolId || schoolId === '0') {
      return this.setState({
        schoolError: true
      })
    }
    if (!name) {
      return this.setState({
        nameError: true
      })
    }
    let selectedResidences =
      residences && residences.filter(r => r.selected === true)
    if (!selectedResidences || selectedResidences.length === 0) {
      return this.setState({
        residenceError: true
      })
    }
    this.postData()
  }
  postData = () => {
    let {
      status,
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
      supplyWaterPressureRange,
      solarEnergy,
      residences
    } = this.state
    // filter the wt whose params are set
    let waterTanks = this.state.waterTanks.filter(
      w => w.height && w.range && w.area && w.no
    )
    let buildingIds = residences.filter(r => r.selected === true).map(r => r.id)

    let body = {
      id,
      schoolId,
      name,
      imei,
      buildingIds,
      solarEnergy
    }
    if (electricMeterRate) {
      body.electricMeterRate = electricMeterRate
    }
    if (emissionReductionParam) {
      body.emissionReductionParam = emissionReductionParam
    }
    if (waterTanks && waterTanks.length > 0) {
      body.waterTanks = waterTanks
    }
    if (hotWaterModelId) {
      body.hotWaterModelId = hotWaterModelId
    }
    if (waterHeater) {
      body.waterHeater = waterHeater
    }
    if (backWaterPump) {
      body.backWaterPump = backWaterPump
    }
    if (replyWaterPump) {
      body.replyWaterPump = replyWaterPump
    }
    if (replenishmentWaterPump) {
      body.replenishmentWaterPump = replenishmentWaterPump
    }
    if (supplyWaterPressureRange) {
      body.supplyWaterPressureRange = supplyWaterPressureRange
    }
    let resource = '/api/machine/unit/register'
    if (status === HEATER_STATUS_REGISTERD) {
      body.id = id
      resource = '/api/machine/unit/update'
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        Noti.hintSuccessAndBack(this.props.history)
      }
    })
  }
  cancel = () => {
    this.props.history.goBack()
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
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        let { buildingIds } = this.state
        let { residences } = json.data
        buildingIds.forEach(b => {
          let r = residences.find(re => re.id === b)
          if (r) {
            r.selected = true
          }
        })
        this.setState({
          residences
        })
      }
    })
  }
  changeSchool = v => {
    if (!v) {
      return this.setState({
        schoolError: true
      })
    }
    let nextState = { schoolId: parseInt(v, 10) }
    if (this.state.schoolError) {
      nextState.schoolError = false
    }
    this.setState(nextState, this.fetchBuildings)
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
  }

  changeBuilding = (v, i) => {
    let buildingTimesets = deepCopy(this.state.buildingTimesets)
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
  setResidences = data => {
    let residences = deepCopy(data)
    let nextState = {
      residences,
      showBuildingSelect: false
    }
    let selectedResidence = residences.filter(r => r.selected === true)
    if (selectedResidence.length === 0) {
      nextState.residenceError = true
    } else if (this.state.residenceError) {
      nextState.residenceError = false
    }
    this.setState(nextState)
  }

  changename = e => {
    let v = e.target.value
    this.setState({
      name: v
    })
  }
  checkname = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        nameError: true,
        name: v
      })
    }
    if (this.state.nameError) {
      this.setState({
        nameError: false,
        name: v
      })
    }
  }
  changehotWaterModelId = e => {
    this.setState({
      hotWaterModelId: e.target.value
    })
  }
  changewaterHeater = e => {
    this.setState({
      waterHeater: parseInt(e.target.value, 10)
    })
  }
  changereplyWaterPump = e => {
    this.setState({
      replyWaterPump: parseInt(e.target.value, 10)
    })
  }
  changebackWaterPump = e => {
    this.setState({
      backWaterPump: parseInt(e.target.value, 10)
    })
  }
  changeelectricMeterRate = e => {
    this.setState({
      electricMeterRate: parseInt(e.target.value, 10)
    })
  }
  changeemissionReductionParam = e => {
    this.setState({
      emissionReductionParam: parseInt(e.target.value, 10)
    })
  }
  changereplenishmentWaterPump = e => {
    this.setState({
      replenishmentWaterPump: parseInt(e.target.value, 10)
    })
  }
  changesolarEnergy = e => {
    this.setState({
      solarEnergy: e.target.checked ? EFFECTIVE_YES : EFFECTIVE_NO
    })
  }
  changeWaterHeight = (e, i) => {
    let waterTanks = deepCopy(this.state.waterTanks)
    waterTanks[i].height = parseInt(e.target.value, 10)
    // waterTanks[i].height = e.target.value
    this.setState({
      waterTanks
    })
  }
  changeWaterRange = (e, i) => {
    let waterTanks = deepCopy(this.state.waterTanks)
    waterTanks[i].range = parseInt(e.target.value, 10)
    // waterTanks[i].height = e.target.value
    this.setState({
      waterTanks
    })
  }
  changeWaterArea = (e, i) => {
    let waterTanks = deepCopy(this.state.waterTanks)
    waterTanks[i].area = +e.target.value
    // waterTanks[i].height = e.target.value
    this.setState({
      waterTanks
    })
  }
  changesupplyWaterPressureRange = e => {
    this.setState({
      supplyWaterPressureRange: parseInt(e.target.value, 10)
    })
  }
  render() {
    let {
      imei,
      name,
      nameError,
      schoolId,
      schoolError,
      hotWaterModelId,
      waterHeater,
      replyWaterPump,
      replenishmentWaterPump,
      backWaterPump,
      electricMeterRate,
      emissionReductionParam,
      solarEnergy,
      showBuildingSelect,
      residences,
      residenceError,
      waterTanks,
      supplyWaterPressureRange
    } = this.state
    const waterTankItems =
      waterTanks &&
      waterTanks.map((water, index) => (
        <Fragment key={`frag${index}`}>
          <li key={index}>
            <p>水箱{index + 1}高度</p>
            <input
              type="number"
              value={water.height}
              onChange={e => this.changeWaterHeight(e, index)}
            />
          </li>
          <li key={index + 'range'}>
            <p>水位传感器{index + 1}量程</p>
            <input
              type="number"
              value={water.range}
              onChange={e => this.changeWaterRange(e, index)}
            />
          </li>
          <li key={`${index}area`}>
            <p>水箱{index + 1}面积</p>
            <input
              type="number"
              value={water.area}
              onChange={e => this.changeWaterArea(e, index)}
            />
          </li>
        </Fragment>
      ))

    const selectedResidence =
      residences && residences.filter(r => r.selected === true)
    const residenceItems =
      selectedResidence &&
      selectedResidence.map((resi, i) => <span key={resi.id}>{resi.name}</span>)
    return (
      <div className="infoList timeset">
        <ul>
          <li>
            <p>IMEI</p>
            <span>{imei}</span>
          </li>
          <li>
            <p>选择学校:</p>
            <SchoolSelectWithoutAll
              width={CONSTANTS.SELECTWIDTH}
              selectedSchool={schoolId.toString()}
              changeSchool={this.changeSchool}
              checkSchool={this.checkSchool}
            />

            {schoolError ? (
              <span className="checkInvalid">请至少选择一栋楼！</span>
            ) : null}
          </li>
          <li>
            <p>楼栋</p>
            <a className="mgr10" onClick={this.showBuildingSelect} href="">
              点击选择
            </a>
            {residenceItems}
            {residenceError ? (
              <span className="checkInvalid">请至少选择一栋楼！</span>
            ) : null}
          </li>
          <li>
            <p>名称</p>
            <input
              value={name}
              onChange={this.changename}
              onBlur={this.checkname}
            />
            {nameError ? (
              <span className="checkInvalid">请至少选择一栋楼！</span>
            ) : null}
          </li>
          <li>
            <p>热水机型号</p>
            <input
              value={hotWaterModelId}
              onChange={this.changehotWaterModelId}
            />
          </li>
          <li>
            <p>热水机数量</p>
            <input
              type="number"
              value={waterHeater}
              onChange={this.changewaterHeater}
            />
          </li>
          <li>
            <p>供水水泵数量</p>
            <input
              type="number"
              value={replyWaterPump}
              onChange={this.changereplyWaterPump}
            />
          </li>
          <li>
            <p>补水水泵数量</p>
            <input
              type="number"
              value={replenishmentWaterPump}
              onChange={this.changereplenishmentWaterPump}
            />
          </li>
          <li>
            <p>回水水泵数量</p>
            <input
              type="number"
              value={backWaterPump}
              onChange={this.changebackWaterPump}
            />
          </li>
          {waterTankItems}
          <li>
            <p>电表倍率</p>
            <input
              type="number"
              value={electricMeterRate}
              onChange={this.changeelectricMeterRate}
            />
          </li>
          <li>
            <p>减排参数</p>
            <input
              type="number"
              value={emissionReductionParam}
              onChange={this.changeemissionReductionParam}
            />
          </li>
          <li>
            <p>供水压力量程</p>
            <input
              type="number"
              value={supplyWaterPressureRange}
              onChange={this.changesupplyWaterPressureRange}
            />
          </li>
          <li>
            <p>是否存在太阳能</p>
            <Checkbox
              onChange={this.changesolarEnergy}
              checked={EFFECTIVE[solarEnergy]}
            />
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
          confirm={this.setResidences}
          show={showBuildingSelect}
          dataSource={residences}
          columns={this.buildingColumns}
        />
      </div>
    )
  }
}

export default HeaterDetail
