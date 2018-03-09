import React from 'react'

import LiveStatus from './liveStatus'
import StatusConfig from './statusConfig'
import PhaseLine from '../../component/phaseLine'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import CheckSelect from '../../component/checkSelect'
import AjaxHandler from '../../../util/ajax'
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
        if (nextProps.machineUnits[0].id !== this.props.machineUnitId) {
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
  changeHeaterBlock = v => {}
  render() {
    const { tabIndex, schoolId, machineUnits } = this.props
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
                value={tabIndex}
                onClick={this.changeHeaterUnit}
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
