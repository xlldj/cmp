import React from 'react'

import HintBox from '../../../component/hintBox'
import VerticalProgress from '../../../component/verticalProgress'
import CONSTANTS from '../../../../constants'
import AjaxHandler from '../../../../util/ajax'
import { checkObject } from '../../../../util/checkSame'
import { safeGet } from '../../../../util/types'

import warmer from '../../../assets/warmer.jpg'
import tank_0 from '../../../assets/tank_0.gif'
import tank_30 from '../../../assets/tank_30.gif'
import tank_50 from '../../../assets/tank_50.gif'
import tank_70 from '../../../assets/tank_70.gif'
import tank_90 from '../../../assets/tank_90.gif'
import waterpipe_s from '../../../assets/waterpipe_s.gif'
import waterpipe_m from '../../../assets/waterpipe_m.gif'
import thermometer from '../../../assets/thermometer.png'

const tankImgs = {
  1: tank_0,
  3: tank_30,
  5: tank_50,
  7: tank_70,
  9: tank_90
}
const tempDeno = '℃'
const {
  AREADATAS,
  HINT_COMMON,
  HINT_TANK,
  HINT_WARMER,
  Hint_Class_Name,
  Hint_Colors,
  STATE_NAMES,
  HEATER_STATUS,
  SWITCH_ENUM,
  Hint_Wrapper_Class_Name
} = CONSTANTS

class LiveStatus extends React.Component {
  state = {
    showingHintKey: 0,
    waterInverseHint: false, // yellow hint of waterpipe
    waterBackupHint: false, // blue hint of waterpipe
    waterSupplyHint: false, // red hint of waterpipe
    tankStatusHint: false, // status hint of tank
    warmerStausHint: false // status hint of warmer
  }
  componentDidMount() {
    this.props.hide(false)
    let { machineUnitId } = this.props
    if (machineUnitId) {
      this.fetchMachineStatus()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['machineUnitId'])) {
      return
    }
    this.fetchMachineStatus(nextProps)
  }
  fetchMachineStatus = props => {
    let { machineUnitId } = props || this.props
    const body = { machineUnitId }
    let resource = '/api/machine/unit/status'
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        this.setState(json.data)
      }
    })
  }
  setHintState = key => {
    console.log(key)
    this.setState({
      showingHintKey: key
    })
  }

  getTexts = (key, data = {}) => {
    const Hint_Texts = {
      1: [
        {
          label: `补水${data.no}温度`,
          value: data.temperature ? data.temperature + tempDeno : ''
        },
        {
          label: `补水${data.no}`,
          value: data.status !== undefined ? SWITCH_ENUM[data.status] : '关闭'
        }
      ],
      2: [
        {
          label: `供水${data.no}`,
          value: data.status !== undefined ? SWITCH_ENUM[data.status] : '关闭'
        }
      ],
      3: [
        {
          label: `回水${data.no}温度`,
          value: data.temperature ? `${data.temperature}${tempDeno}` : ''
        },
        {
          label: `回水${data.no}`,
          value: data.status !== undefined ? SWITCH_ENUM[data.status] : '关闭'
        }
      ],
      4: [
        {
          label: '机器号',
          value: data.no
        },
        {
          label: '状态',
          value: HEATER_STATUS[data.status]
            ? HEATER_STATUS[data.status]
            : '未知'
        }
      ],
      99: [
        {
          label: '实际水温',
          value: data.temperature ? data.temperature + tempDeno : ''
        },
        {
          label: '设定水位',
          value: data.settingWaterLevel ? `${data.settingWaterLevel}%` : ''
        },
        {
          label: '实际水位',
          value: data.realWaterLevel ? `${data.realWaterLevel}%` : ''
        }
      ]
    }
    return Hint_Texts[key] || ''
  }
  getHintBoxes = key => {
    const stateName = STATE_NAMES[key]
    let results =
      this.state[stateName] &&
      this.state[stateName].map(data => (
        <HintBox
          key={data.no}
          textList={this.getTexts(key, data)}
          className={Hint_Class_Name[key]}
          color={Hint_Colors[key]}
        />
      ))
    return results
  }
  getTankImgKey = level => {
    if (!level) {
      return 1
    }
    console.log(level)
    if (0 < level && level < 30) {
      return 3
    } else if (level < 50) {
      return 5
    } else if (level < 70) {
      return 7
    } else if (level < 90) {
      return 9
    }
    return 1
  }
  render() {
    const {
      showingHintKey,
      pipeRuning,
      envTemperature,
      dailyWaterSupply,
      dailyElectricityUse,
      currentWaterVolume,
      waterTankStatuses
    } = this.state
    const pipeAreas =
      AREADATAS &&
      AREADATAS.map(data => (
        <area
          key={data.key}
          alt={data.alt}
          shape={data.shape}
          coords={data.trail}
          onMouseOver={() => this.setHintState(data.key)}
        />
      ))
    const commonData = [
      { label: '环境温度', value: envTemperature || '未知' },
      {
        label: '当日补水量',
        value: dailyWaterSupply || ''
      },
      {
        label: '当日用电量',
        value: dailyElectricityUse || ''
      },
      {
        label: '当前水量',
        value: currentWaterVolume
      }
    ]
    const commonStat = (
      <HintBox
        textList={commonData}
        className="commonHint"
        color={Hint_Colors[HINT_COMMON]}
      />
    )
    // 'redThermoLevel' in the temerature level upon tank
    const redThermoLevel = safeGet(waterTankStatuses, '0.temperature')
    // 'blueThermoLevel' is the actual water level
    const blueThermoLevel = safeGet(waterTankStatuses, '0.realWaterLevel')

    const hintboxes = this.getHintBoxes(showingHintKey)
    const tankImgKey = this.getTankImgKey(
      safeGet(waterTankStatuses, '0.realWaterLevel')
    )

    return (
      <div className="liveStatusWrapper">
        <div className="liveMapWrapper flexCenter horiCenter">
          <img src={warmer} alt="warmer" useMap="#warmerArea" />
          <map name="warmerArea" id="warmerArea">
            <area
              alt="warmer"
              shape="poly"
              coords="37, 144, 150, 144, 180, 223, 180, 300, 0, 300, 0, 220"
              onMouseOver={() => this.setHintState(HINT_WARMER)}
            />
          </map>
          <img
            className="tankImg"
            src={tankImgs[tankImgKey]}
            alt="tank"
            onMouseMove={e => this.setHintState(HINT_TANK)}
          />
          <img
            src={pipeRuning ? waterpipe_m : waterpipe_s}
            alt="waterpipe"
            useMap="#waterPipeArea"
          />
          <map id="waterPipeArea" name="waterPipeArea">
            {pipeAreas}
          </map>
          <img src={thermometer} alt="thermometer" className="thermometer" />
          <VerticalProgress
            className="redThermo"
            progress={redThermoLevel ? redThermoLevel : 0}
            innerColor="#ff5555"
          />
          <VerticalProgress
            className="blueThermo"
            progress={blueThermoLevel ? blueThermoLevel : 0}
            innerColor="#85c4ff"
          />
          {showingHintKey ? (
            <div className={Hint_Wrapper_Class_Name[showingHintKey]}>
              {hintboxes}
            </div>
          ) : null}
          {commonStat}
        </div>
      </div>
    )
  }
}

export default LiveStatus
