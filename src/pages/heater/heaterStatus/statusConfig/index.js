import React from 'react'

import PhaseLine from '../../../component/phaseLine'
import CONSTANTS from '../../../../constants'
import AjaxHandler from '../../../../util/ajax'
import { checkObject } from '../../../../util/checkSame'

const subModule = 'heaterStatus'
const {
  HEATER_STATUS_PAGE_TABS,
  HEATER_STATUS_REGISTERD,
  PAGINATION: SIZE
} = CONSTANTS

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
  fetchConfigOfMachine = key => {}
  fetchConfigOfMachine = props => {
    let { machineUnitId } = props || this.props
    const body = {
      id: machineUnitId
    }
    const resource = '/machine/unit/config/one'
    AjaxHandler.fetch(resource, body).then(json => {
      console.log(json)
      if (json && json.data) {
        this.setState(json.data)
      }
    })
  }
  changeTab = v => {}
  changeHeaterBlock = v => {}
  render() {
    const { machineUnitId, machineUnits } = this.props

    return <div />
  }
}

export default StatusConfig
