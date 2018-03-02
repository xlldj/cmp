import React from 'react'

import LiveStatus from './liveStatus'
import PhaseLine from '../../component/phaseLine'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeHeater } from '../../../actions'
const subModule = 'heaterStatus'
const { HEATER_STATUS_PAGE_TABS } = CONSTANTS

class HeaterStatus extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  changeTab = v => {}
  changeHeaterBlock = v => {}
  render() {
    const { tabIndex, schoolId } = this.props
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    return (
      <div>
        <PhaseLine
          value={tabIndex}
          staticPhase={HEATER_STATUS_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changeTab}
        />

        {tabIndex === 1 ? <LiveStatus hide={this.props.hide} /> : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.heaterModule[subModule].schoolId,
  tabIndex: state.heaterModule[subModule].tabIndex
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater
  })(HeaterStatus)
)
