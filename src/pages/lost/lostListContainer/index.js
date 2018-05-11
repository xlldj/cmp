import React from 'react'

import PhaseLine from '../../component/phaseLine'
import SchoolSelector from '../../component/schoolSelector'
import LostFoundList from '../lostFoundList'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { changeSchool, changePhase } from './controller'

import CONSTANTS from '../../../constants'

const { LOST_LIST_PAGE_TAB, LOST_LIST_PAGE_TAB_LOSTFOUND } = CONSTANTS
const moduleName = 'lostModule'
const subModule = 'lostListContainer'

class LostListContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  render() {
    const { tabIndex, schoolId } = this.props
    const selector = (
      <SchoolSelector
        key="schoolSelector"
        selectedSchool={schoolId}
        changeSchool={v => changeSchool(this.props, v)}
      />
    )
    return (
      <div>
        <PhaseLine
          staticPhase={LOST_LIST_PAGE_TAB}
          value={tabIndex}
          selectors={[selector]}
          changePhase={v => changePhase(this.props, v)}
        />
        {tabIndex === LOST_LIST_PAGE_TAB_LOSTFOUND ? <LostFoundList /> : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName][subModule].schoolId,
    tabIndex: state[moduleName][subModule].tabIndex
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(LostListContainer)
)
