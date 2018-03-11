import React from 'react'

import HintBox from '../../../component/hintBox'
import CONSTANTS from '../../../../constants'

import warmer from '../../../assets/warmer.jpg'
import tank_0 from '../../../assets/tank_0.gif'
import waterpipe_s from '../../../assets/waterpipe_s.gif'
import waterpipe_m from '../../../assets/waterpipe_m.gif'
import thermometer from '../../../assets/thermometer.png'

const SWITCH_ENUM = {
  1: '开启',
  2: '关闭'
}
const { AREADATAS } = CONSTANTS

const Hint_Colors = {
  1: '#85c4ff',
  2: '#83d898',
  3: '#ffcc00'
}
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
  changeTab = v => {}
  changeHeaterUnit = v => {}
  setHintState = key => {
    console.log(key)
    this.setState({
      showingHintKey: key
    })
  }
  getTexts = key => {
    const { waterBackupState, waterSupplyState, waterInverseState } = this.state
    const Hint_Texts = {
      1: [
        { label: '补水温度', value: '18度' },
        {
          label: '补水',
          value: waterBackupState ? SWITCH_ENUM[waterBackupState] : '关闭'
        }
      ],
      2: [
        {
          label: '供水',
          value: waterSupplyState ? SWITCH_ENUM[waterSupplyState] : '关闭'
        }
      ],
      3: [
        { label: '回水温度', value: '18度' },
        {
          label: '回水',
          value: waterInverseState ? SWITCH_ENUM[waterInverseState] : '关闭'
        }
      ]
    }
    return Hint_Texts[key] || ''
  }
  render() {
    const { showingHintKey, pipeRuning } = this.state
    const areas =
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

    return (
      <div className="liveStatusWrapper">
        <div className="liveMapWrapper flexCenter horiCenter">
          <img src={warmer} alt="warmer" />
          <img src={tank_0} alt="tank" />
          <img
            src={pipeRuning ? waterpipe_m : waterpipe_s}
            alt="waterpipe"
            useMap="#waterPipeArea"
          />
          <map id="waterPipeArea" name="waterPipeArea">
            {areas}
          </map>
          <img src={thermometer} alt="thermometer" className="thermometer" />
          {showingHintKey ? (
            <HintBox
              textList={this.getTexts(showingHintKey)}
              className="waterpipeHint"
              color={Hint_Colors[showingHintKey]}
            />
          ) : null}
        </div>
      </div>
    )
  }
}

export default LiveStatus
