import React from 'react'

import { Button } from 'antd'

import UnitDeviceBlock from './unitDeviceBlock'
import TimeRangeLine from './timeRangeLine'
import HoriInput from '../../../component/horiInput'
import LabelInput from '../../../component/labelInput'
import CONSTANTS from '../../../../constants'
import AjaxHandler from '../../../../util/ajax'
import Noti from '../../../../util/noti'
import { deepCopy } from '../../../../util/copy'
import { checkObject } from '../../../../util/checkSame'
import { deleteEmptyKeyInObject } from '../../../../util/types'

const {
  WARMER_IN_UNIT,
  REPLY_IN_UNIT,
  REPLENISH_IN_UNIT,
  SOLAR_IN_UNIT,
  UNIT_DEVICE_STATUS,
  DEVICE_UNIT_ENABLE,
  DEVICE_UNIT_DISABLE
} = CONSTANTS
const TIMERANGES = []
const timeRange = {
  endTime: '',
  no: '',
  startTime: '',
  status: DEVICE_UNIT_DISABLE,
  height: '',
  temperature: '',
  remperatureDelta: ''
}
for (let i = 0; i < 4; i++) {
  let t = deepCopy(timeRange)
  t.no = i + 1
  TIMERANGES.push(deepCopy(timeRange))
}
const heaterLimitParam = {
  enterTemperature: '',
  exitTemperature: '',
  maxTime: '',
  temperatureDelta: ''
}
const waterCompensatorLimitParam = {
  temperatureDelta: '',
  waterLevelDelta: ''
}
const waterFeederLimitParam = {
  openStopWaterLevelDelta: '',
  returnWaterExitTemperatureDelta: '',
  returnWaterOpenStopTemperatureDelta: '',
  waterProtection: ''
}
const solarEnergyLimitParam = {
  openStopTemperatureDelta: '',
  waterTankTemperature: ''
}

class StatusConfig extends React.Component {
  state = {
    loading: false
  }
  componentDidMount() {
    this.props.hide(false)
    let { machineUnitId } = this.props
    if (machineUnitId) {
      this.fetchConfigOfMachine()
    }
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(nextProps, this.props, ['machineUnitId'])) {
      return
    }
    this.fetchConfigOfMachine(nextProps)
  }
  fetchConfigOfMachine = props => {
    let { machineUnitId } = props || this.props
    const body = {
      id: parseInt(machineUnitId, 10)
    }
    const resource = '/machine/unit/config/one'
    AjaxHandler.fetch(resource, body).then(json => {
      console.log(json)
      if (json && json.data) {
        let { machines } = json.data
        machines.forEach(m => {
          if (!m.machineTimeRanges) {
            m.machineTimeRanges = TIMERANGES
          } else if (m.machineTimeRanges.length < 4) {
            while (m.machineTimeRanges.length < 4) {
              let tr = deepCopy(timeRange)
              tr.no = m.machineTimeRanges.length + 1
              m.machineTimeRanges.push(tr)
            }
          }
          // if is warmer, add or update 'heaterLimitParam'
          if (m.type === WARMER_IN_UNIT && !m.heaterLimitParam) {
            m.heaterLimitParam = deepCopy(heaterLimitParam)
          } else if (m.type === REPLY_IN_UNIT && !m.waterFeederLimitParam) {
            m.waterFeederLimitParam = deepCopy(waterFeederLimitParam)
          } else if (
            m.type === REPLENISH_IN_UNIT &&
            !m.waterCompensatorLimitParam
          ) {
            m.waterCompensatorLimitParam = deepCopy(waterCompensatorLimitParam)
          } else if (m.type === SOLAR_IN_UNIT && !m.solarEnergyLimitParam) {
            m.solarEnergyLimitParam = deepCopy(solarEnergyLimitParam)
          }
        })
        this.setState(json.data)
      }
    })
  }
  changeStartTime = (v, id, i) => {
    console.log(v, id, i)

    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      tr.startTime = v
      if (tr.error) {
        let complete = this.checkTimeItemComplete(tr, machine.type)
        tr.error = !complete
      }
      this.setState({
        machines
      })
    }
  }
  changeEndTime = (v, id, i) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      tr.endTime = v
      if (tr.error) {
        let complete = this.checkTimeItemComplete(tr, machine.type)
        tr.error = !complete
      }
      this.setState({
        machines
      })
    }
  }
  changeTemp = (e, id, i) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      tr.temperature = e.target.value
      if (tr.error) {
        let complete = this.checkTimeItemComplete(tr, machine.type)
        tr.error = !complete
      }
      this.setState({
        machines
      })
    }
  }
  changeHeight = (e, id, i) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      tr.height = e.target.value
      if (tr.error) {
        let complete = this.checkTimeItemComplete(tr, machine.type)
        tr.error = !complete
      }
      this.setState({
        machines
      })
    }
  }

  changeDeviceInUnitStatus = (checked, id, i) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      let complete = this.checkTimeItemComplete(tr, machine.type)
      if (!complete) {
        tr.error = true
      } else {
        tr.status = checked ? DEVICE_UNIT_ENABLE : DEVICE_UNIT_DISABLE
        tr.error = false
      }
      this.setState({
        machines
      })
    }
  }
  changeTempDelta = (e, id, i) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      let tr = machine.machineTimeRanges[i]
      tr.temperatureDelta = e.target.value
      if (tr.error) {
        let complete = this.checkTimeItemComplete(tr, machine.type)
        tr.error = !complete
      }
      this.setState({
        machines
      })
    }
  }
  changeEnterTemp = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.heaterLimitParam.enterTemperature = v
      this.setState({
        machines
      })
    }
  }
  changeMaxTime = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.heaterLimitParam.maxTime = v
      this.setState({
        machines
      })
    }
  }
  changeExitTemperature = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.heaterLimitParam.exitTemperature = v
      this.setState({
        machines
      })
    }
  }
  changeWarmerTempDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.heaterLimitParam.temperatureDelta = v
      this.setState({
        machines
      })
    }
  }
  changeWaterProtection = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterFeederLimitParam.waterProtection = v
      this.setState({
        machines
      })
    }
  }
  changeWaterLevelSwitchDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterFeederLimitParam.openStopWaterLevelDelta = v
      this.setState({
        machines
      })
    }
  }
  changeWaterTempSwitchDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterFeederLimitParam.returnWaterOpenStopTemperatureDelta = v
      this.setState({
        machines
      })
    }
  }
  changeWaterExitTempDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterFeederLimitParam.returnWaterExitTemperatureDelta = v
      this.setState({
        machines
      })
    }
  }
  changeWaterLevelDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterCompensatorLimitParam.waterLevelDelta = v
      this.setState({
        machines
      })
    }
  }
  changeTemperatureDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.waterCompensatorLimitParam.temperatureDelta = v
      this.setState({
        machines
      })
    }
  }
  changeOpenStopTemperatureDelta = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.solarEnergyLimitParam.openStopTemperatureDelta = v
      this.setState({
        machines
      })
    }
  }
  changeWaterTankTemperature = (v, id) => {
    let machines = deepCopy(this.state.machines)
    let machine = machines.find(m => m.id === id)
    if (machine) {
      machine.solarEnergyLimitParam.waterTankTemperature = v
      this.setState({
        machines
      })
    }
  }
  checkTimeItemComplete = (t, type) => {
    let complete = true
    switch (type) {
      case WARMER_IN_UNIT:
        complete = t.temperature && t.startTime && t.endTime
        break
      case REPLY_IN_UNIT:
        complete = t.startTime && t.endTime
        break
      case REPLENISH_IN_UNIT:
        complete = t.startTime && t.endTime && t.height && t.temperature
        break
      case SOLAR_IN_UNIT:
        complete =
          t.startTime && t.endTime && t.temperature && t.temperatureDelta
        break
      default:
        break
    }
    return complete
  }
  confirm = () => {
    let machines = deepCopy(this.state.machines)
    for (let i = 0, l = machines.length; i < l; i++) {
      let m = machines[i]
      if (m.machineTimeRanges) {
        for (let j = 0, ll = m.machineTimeRanges.length; j < ll; j++) {
          let t = m.machineTimeRanges[j]
          if (t.status === DEVICE_UNIT_ENABLE) {
            let complete = this.checkTimeItemComplete(t, m.type)
            if (!complete) {
              t.error = true
              Noti.hintLock(
                '提交出错',
                '当前已开启的时间选项中有未填完的信息！'
              )
              return this.setState({ machines })
            }
          }
        }
      }
    }
    this.handleData()
  }
  handleData = () => {
    let machines = deepCopy(this.state.machines)
    // delete useless timeranges
    machines.forEach(m => {
      if (m.machineTimeRanges) {
        for (let l = m.machineTimeRanges.length, i = l - 1; i >= 0; i--) {
          let tr = m.machineTimeRanges[i]
          if (tr.status === DEVICE_UNIT_DISABLE) {
            m.machineTimeRanges.splice(i, 1)
          } else {
            delete tr.error
          }
        }
        // sequence the timeRange 'no', incase there are 1, 2 without 3. Which will cause trouble when fetch data again.
        // When m.machineTimeRanges < 4, I will fill its length to 4. And each has a 'no' in order.
        m.machineTimeRanges.forEach((tr, i) => {
          deleteEmptyKeyInObject(tr)
          tr.no = i + 1
          // if tr.startTime is set by input, it will be a string. Or else it will be a number.
          tr.startTime =
            typeof tr.startTime === 'string'
              ? Date.parse(tr.startTime)
              : tr.startTime
          tr.endTime =
            typeof tr.endTime === 'string' ? Date.parse(tr.endTime) : tr.endTime
        })
      }
      if (m.machineTimeRanges.length === 0) {
        delete m.machineTimeRanges
      }
    })
    // delete useless params and trim
    machines.forEach(m => this.deleteParams(m))
    this.postMessage(machines)
  }
  postMessage = machines => {
    let { machineUnitId, schoolId } = this.props
    const resource = '/api/machine/unit/config/update'
    const body = {
      machines,
      machineUnitId,
      schoolId: parseInt(schoolId, 10)
    }
    AjaxHandler.fetch(resource, body).then(json => {
      if (json && json.data) {
        Noti.hintOk('提交成功', '该设置已提交给服务器')
      }
    })
  }
  deleteParams = m => {
    let param
    switch (m.type) {
      case WARMER_IN_UNIT:
        param = m.heaterLimitParam
        param.enterTemperature = parseInt(param.enterTemperature, 10)
        param.exitTemperature = parseInt(param.exitTemperature, 10)
        param.maxTime = parseInt(param.maxTime, 10)
        param.temperatureDelta = parseInt(param.temperatureDelta, 10)
        deleteEmptyKeyInObject(param)
        if (Object.keys(param).length === 0) {
          delete m.heaterLimitParam
        }
        break
      case REPLY_IN_UNIT:
        param = m.waterFeederLimitParam
        param.openStopWaterLevelDelta = parseInt(
          param.openStopWaterLevelDelta,
          10
        )
        param.returnWaterExitTemperatureDelta = parseInt(
          param.returnWaterExitTemperatureDelta,
          10
        )
        param.returnWaterOpenStopTemperatureDelta = parseInt(
          param.returnWaterOpenStopTemperatureDelta,
          10
        )
        param.waterProtection = parseInt(param.waterProtection, 10)
        deleteEmptyKeyInObject(param)
        if (Object.keys(param).length === 0) {
          delete m.waterFeederLimitParam
        }
        break
      case REPLENISH_IN_UNIT:
        param = m.waterCompensatorLimitParam
        param.temperatureDelta = parseInt(param.temperatureDelta, 10)
        param.waterLevelDelta = parseInt(param.waterLevelDelta, 10)
        deleteEmptyKeyInObject(param)
        if (Object.keys(param).length === 0) {
          delete m.waterCompensatorLimitParam
        }
        break
      case SOLAR_IN_UNIT:
        param = m.solarEnergyLimitParam
        param.openStopTemperatureDelta = parseInt(
          param.openStopTemperatureDelta,
          10
        )
        param.waterTankTemperature = parseInt(param.waterTankTemperature, 10)
        deleteEmptyKeyInObject(param)
        if (Object.keys(param).length === 0) {
          delete m.solarEnergyLimitParam
        }
        break
      default:
        break
    }
  }

  render() {
    const { machines } = this.state
    const warmers = machines && machines.filter(m => m.type === WARMER_IN_UNIT)
    const warmerItems =
      warmers &&
      warmers.map((w, ind) => {
        const timeRanges = w.machineTimeRanges.map((t, i) => (
          <TimeRangeLine
            className="row"
            key={t.no || i + 1}
            label={`第${i + 1}时段`}
            startTime={t.startTime || ''}
            endTime={t.endTime || ''}
            checked={t.status ? UNIT_DEVICE_STATUS[t.status] : false}
            toggleSwitch={checked =>
              this.changeDeviceInUnitStatus(checked, w.id, i)
            }
            changeStartTime={v => this.changeStartTime(v, w.id, i)}
            changeEndTime={v => this.changeEndTime(v, w.id, i)}
            showErrorHint={t.error}
          >
            <span className="seperator">加热温度</span>
            <input
              type="number"
              className="shortInput"
              value={t.temperature || ''}
              onChange={e => this.changeTemp(e, w.id, i)}
            />
          </TimeRangeLine>
        ))
        return (
          <UnitDeviceBlock key={w.id || ind + 1} title={w.name || '热水机'}>
            {timeRanges}
            <div className="rows">
              <label>化霜:</label>
              <div>
                <HoriInput
                  title="投入温度"
                  type="number"
                  value={w.heaterLimitParam.enterTemperature || ''}
                  onChange={v => this.changeEnterTemp(v, w.id)}
                  deno="℃"
                />
                <HoriInput
                  title="最大时间"
                  type="number"
                  value={w.heaterLimitParam.maxTime || ''}
                  onChange={v => this.changeMaxTime(v, w.id)}
                  deno="分钟"
                />
                <HoriInput
                  type="number"
                  title="退出温度"
                  value={w.heaterLimitParam.exitTemperature || ''}
                  onChange={v => this.changeExitTemperature(v, w.id)}
                  deno="℃"
                />
              </div>
            </div>
            <div className="row">
              <LabelInput
                className="row"
                title="压缩机启停温差"
                value={w.heaterLimitParam.temperatureDelta}
                onChange={v => this.changeWarmerTempDelta(v, w.id)}
                deno="%"
              />
            </div>
          </UnitDeviceBlock>
        )
      })
    const replys = machines && machines.filter(m => m.type === REPLY_IN_UNIT)
    const replyItems =
      replys &&
      replys.map((w, ind) => {
        const timeRanges = w.machineTimeRanges.map((t, i) => (
          <TimeRangeLine
            className="row"
            key={t.no || i + 1}
            label={`第${i + 1}时段`}
            startTime={t.startTime || ''}
            endTime={t.endTime || ''}
            checked={t.status ? UNIT_DEVICE_STATUS[t.status] : false}
            toggleSwitch={e => this.changeDeviceInUnitStatus(e, w.id, i)}
            showErrorHint={t.error}
          />
        ))
        return (
          <UnitDeviceBlock key={w.id || ind + 1} title={w.name || '供水'}>
            {timeRanges}
            <LabelInput
              className="row"
              title="缺水保护"
              value={w.waterFeederLimitParam.waterProtection}
              onChange={v => this.changeWaterProtection(v, w.id)}
              deno="%"
            />
            <LabelInput
              className="row"
              title="启停水位差"
              value={w.waterFeederLimitParam.openStopWaterLevelDelta}
              onChange={e => this.changeWaterLevelSwitchDelta(e, w.id)}
              deno="%"
            />
            <LabelInput
              className="row"
              title="回水开停温差"
              value={
                w.waterFeederLimitParam.returnWaterOpenStopTemperatureDelta
              }
              onChange={e => this.changeWaterTempSwitchDelta(e, w.id)}
              deno="℃"
            />
            <LabelInput
              className="row"
              title="回水退出温差"
              value={w.waterFeederLimitParam.returnWaterExitTemperatureDelta}
              onChange={e => this.changeWaterExitTempDelta(e, w.id)}
              deno="℃"
            />
          </UnitDeviceBlock>
        )
      })
    const compensators =
      machines && machines.filter(m => m.type === REPLENISH_IN_UNIT)
    const compensatorsItems =
      compensators &&
      compensators.map((w, ind) => {
        const timeRanges = w.machineTimeRanges.map((t, i) => (
          <TimeRangeLine
            className="row"
            key={t.no || i + 1}
            label={`第${i + 1}时段`}
            startTime={t.startTime || ''}
            endTime={t.endTime || ''}
            checked={t.status ? UNIT_DEVICE_STATUS[t.status] : false}
            toggleSwitch={checked =>
              this.changeDeviceInUnitStatus(checked, w.id, i)
            }
            changeStartTime={v => this.changeStartTime(v, w.id, i)}
            changeEndTime={v => this.changeEndTime(v, w.id, i)}
            showErrorHint={t.error}
          >
            <span className="seperator">高度</span>
            <input
              type="number"
              className="shortInput"
              value={t.height || ''}
              onChange={e => this.changeHeight(e, w.id, i)}
            />
            <span className="seperator">温度</span>
            <input
              type="number"
              className="shortInput"
              value={t.temperature || ''}
              onChange={e => this.changeTemp(e, w.id, i)}
            />
          </TimeRangeLine>
        ))
        return (
          <UnitDeviceBlock key={w.id || ind + 1} title={w.name || '热水机'}>
            {timeRanges}
            <LabelInput
              className="row"
              title="水位差"
              value={w.waterCompensatorLimitParam.waterLevelDelta}
              onChange={e => this.changeWaterLevelDelta(e, w.id)}
              deno="%"
            />
            <LabelInput
              className="row"
              title="温度差"
              value={w.waterCompensatorLimitParam.temperatureDelta}
              onChange={e => this.changeTemperatureDelta(e, w.id)}
              deno="%"
            />
          </UnitDeviceBlock>
        )
      })

    const solars = machines && machines.filter(m => m.type === SOLAR_IN_UNIT)
    const solarItems =
      solars &&
      solars.map((w, ind) => {
        const timeRanges = w.machineTimeRanges.map((t, i) => (
          <TimeRangeLine
            className="row"
            key={t.no || i + 1}
            label={`第${i + 1}时段`}
            startTime={t.startTime || ''}
            endTime={t.endTime || ''}
            checked={t.status ? UNIT_DEVICE_STATUS[t.status] : false}
            toggleSwitch={checked =>
              this.changeDeviceInUnitStatus(checked, w.id, i)
            }
            changeStartTime={v => this.changeStartTime(v, w.id, i)}
            changeEndTime={v => this.changeEndTime(v, w.id, i)}
            showErrorHint={t.error || false}
          >
            <span className="seperator">启动温差</span>
            <input
              type="number"
              className="shortInput"
              value={t.temperatureDelta || ''}
              onChange={e => this.changeTempDelta(e, w.id, i)}
            />
            <span className="seperator">水箱最高温度</span>
            <input
              type="number"
              className="shortInput"
              value={t.temperature || ''}
              onChange={e => this.changeTemp(e, w.id, i)}
            />
          </TimeRangeLine>
        ))
        return (
          <UnitDeviceBlock
            className="noBdr"
            key={w.id || ind + 1}
            title={w.name || '太阳能'}
          >
            {timeRanges}
            <LabelInput
              className="row"
              title="启停温差"
              value={w.solarEnergyLimitParam.openStopTemperatureDelta}
              onChange={v => this.changeOpenStopTemperatureDelta(v, w.id)}
              deno="℃"
            />
            <LabelInput
              className="row"
              title="水箱温度"
              value={w.solarEnergyLimitParam.waterTankTemperature}
              onChange={v => this.changeWaterTankTemperature(v, w.id)}
              deno="℃"
            />
          </UnitDeviceBlock>
        )
      })
    return (
      <div className="heaterStatusConfig">
        <div className="heaterStatusConfigSet scrollBar">
          {warmerItems}
          {replyItems}
          {compensatorsItems}
          {solarItems}
          <div className="btnArea">
            <Button type="primary" onClick={this.confirm}>
              提交设置
            </Button>
          </div>
        </div>
        <div className="heaterStatusAiSet">
          <Button type="primary">一键配置机组参数</Button>
        </div>
      </div>
    )
  }
}

export default StatusConfig
