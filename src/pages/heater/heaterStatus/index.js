import React from 'react'

import LiveStatus from './liveStatus'
import StatusConfig from './statusConfig'
import PhaseLine from '../../component/phaseLine'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'
import CheckSelect from '../../component/checkSelect'
import { checkObject } from '../../../util/checkSame'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater, fetchHeaterList } from '../../../actions'
const subModule = 'heaterStatus'
const { HEATER_STATUS_PAGE_TABS, HEATER_STATUS_REGISTERD } = CONSTANTS

class HeaterStatus extends React.Component {
  componentDidMount() {
    this.props.hide(false)
    const body = {
      page: 1,
      size: 10000,
      status: HEATER_STATUS_REGISTERD
    }
    let { schoolId } = this.props
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    this.props.fetchHeaterList(body, subModule)
  }
  componentWillReceiveProps(nextProps) {
    if (
      checkObject(nextProps, this.props, [
        'schoolId',
        'machineUnitId',
        'machineUnits'
      ])
    ) {
      return
    }
    if (!checkObject(nextProps, this.props, ['schoolId'])) {
      // If 'schoolId' changed, refetch heater units agian. Always set page to 1.
      const body = {
        page: 1,
        size: 10000,
        status: HEATER_STATUS_REGISTERD
      }
      let { schoolId } = nextProps
      if (schoolId !== 'all') {
        body.schoolId = parseInt(schoolId, 10)
      }
      this.props.fetchHeaterList(body, subModule)
    } else if (!checkObject(nextProps, this.props, ['machineUnits'])) {
      // check if nextProps.machineUnits[0].id === this.props.machineUnitId
      if (
        nextProps.machineUnits &&
        nextProps.machineUnits[0] &&
        nextProps.machineUnits[0].id
      ) {
        // if (nextProps.machineUnits[0].id !== this.props.machineUnitId) {
        if (nextProps.machineUnits.indexOf(this.props.machineUnitId) === -1) {
          this.props.changeHeater(subModule, {
            machineUnitId: nextProps.machineUnits[0].id
          })
        }
      }
    }
  }
  changeTab = v => {
    this.props.changeHeater(subModule, {
      tabIndex: parseInt(v, 10)
    })
  }
  changeSchool = v => {
    this.props.changeHeater(subModule, {
      schoolId: parseInt(v, 10)
    })
  }
  changeMachineUnitId = v => {
    this.props.changeHeater(subModule, {
      machineUnitId: parseInt(v, 10)
    })
  }
  render() {
    const { tabIndex, schoolId, machineUnitId, machineUnits } = this.props
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const heaterBlocks = {}
    machineUnits && machineUnits.forEach(m => (heaterBlocks[m.id] = m.name))
    return (
      <div>
        <PhaseLine
          value={tabIndex}
          staticPhase={HEATER_STATUS_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changeTab}
        />
        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <CheckSelect
                options={heaterBlocks}
                noOptionTitle="无机组"
                value={machineUnitId}
                onClick={this.changeMachineUnitId}
              />
            </div>
          </div>
        </div>

        {tabIndex === 1 ? (
          <LiveStatus hide={this.props.hide} {...this.props} />
        ) : (
          <StatusConfig hide={this.props.hide} {...this.props} />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.heaterModule[subModule].schoolId,
  tabIndex: state.heaterModule[subModule].tabIndex,
  machineUnitId: state.heaterModule[subModule].machineUnitId,
  machineUnits: state.heaterModule[subModule].dataSource
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater,
    fetchHeaterList
  })(HeaterStatus)
)
