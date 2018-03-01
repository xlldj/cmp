import React from 'react'
import { Table, Button } from 'antd'

import PhaseLine from '../../component/phaseLine'
import CheckSelect from '../../component/checkSelect'
import Time from '../../../util/time'
import AjaxHandler from '../../../util/ajax'
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
    const { heaterStatus, schoolId } = this.props
    const selector1 = (
      <SchoolSelector
        key={'schoolSelector'}
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const heaterBlocks = {
      1: '热水机组1',
      2: '热水机组2'
    }
    return (
      <div className="taskPanelWrapper" ref="wrapper">
        <PhaseLine
          value={heaterStatus}
          staticPhase={HEATER_STATUS_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changeTab}
        />

        <div className="queryPanel">
          <div className="queryLine">
            <div className="block">
              <CheckSelect
                options={heaterBlocks}
                value={1}
                onClick={this.changeHeaterBlock}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  schoolId: state.changeHeater[subModule].schoolId,
  heaterStatus: state.changeHeater[subModule].heaterStatus
})

export default withRouter(
  connect(mapStateToProps, {
    changeHeater
  })(HeaterStatus)
)
