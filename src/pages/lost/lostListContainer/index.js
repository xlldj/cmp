import React from 'react'

import PhaseLine from '../../component/phaseLine'
import SchoolSelector from '../../component/schoolSelector'
import LostFoundList from './lostFoundList'
import BlackedList from './blackPeopleList'
import LostFoundDetail from './lostFoundDetail'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { lostFoundContainerPropsController } from './controller'

import CONSTANTS from '../../../constants'

const {
  LOST_LIST_PAGE_TAB,
  LOST_LIST_PAGE_TAB_LOSTFOUND,
  LOST_LIST_PAGE_TAB_BLACKEDLIST
} = CONSTANTS
const moduleName = 'lostModule'
const subModule = 'lostListContainer'
const authModule = 'setAuthenData'

class LostListContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  getContent = () => {
    const { tabIndex } = this.props
    if (tabIndex === LOST_LIST_PAGE_TAB_LOSTFOUND) {
      return <LostFoundList {...this.prop} />
    } else if (tabIndex === LOST_LIST_PAGE_TAB_BLACKEDLIST) {
      return <BlackedList />
    }
  }
  setProps = event => {
    const value = lostFoundContainerPropsController(
      this.state,
      this.props,
      event
    )
    if (value) {
      this.props.changeLost(subModule, value)
    }
  }
  render() {
    const { tabIndex, schoolId, showDetail } = this.props
    const selector = (
      <SchoolSelector
        key="schoolSelector"
        selectedSchool={schoolId}
        changeSchool={v =>
          this.setProps({ type: 'schoolId', value: { schoolId: v, page: 1 } })
        }
      />
    )
    return (
      <div className="panelWrapper">
        <PhaseLine
          staticPhase={LOST_LIST_PAGE_TAB}
          value={tabIndex}
          selectors={[selector]}
          changePhase={v =>
            this.setProps({ type: 'tabIndex', value: { tabIndex: v } })
          }
        />
        {this.getContent()}
        {showDetail ? <LostFoundDetail {...this.props} /> : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    schoolId: state[moduleName][subModule].schoolId,
    tabIndex: state[moduleName][subModule].tabIndex,
    showDetail: state[moduleName].lostFoundList.showDetail,
    forbiddenStatus: state[authModule].forbiddenStatus
  }
}

export default withRouter(
  connect(mapStateToProps, { changeLost })(LostListContainer)
)
