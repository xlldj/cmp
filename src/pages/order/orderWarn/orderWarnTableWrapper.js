import React from 'react'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelectorWithoutAll'

import WarnTable from './warnTable'
import WarnSetView from './warnSet.js'

import PhaseLine from '../../component/phaseLine'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeOrder } from '../../../actions'
const subModule = 'orderWarn'
const mapStateToProps1 = (state, ownProps) => {
  return {
    schoolId: state.orderModule[subModule].schoolId,
    page: state.orderModule[subModule].warnset_page
  }
}

let WarnSet = withRouter(
  connect(mapStateToProps1, {
    changeOrder
  })(WarnSetView)
)
const { ORDER_WARN_TABS, ORDER_WARN_PAGE_TABS } = CONSTANTS

class OrderWarn extends React.Component {
  componentDidMount() {
    this.props.hide(false)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }

  changeSchool = value => {
    let { schoolId, tabIndex } = this.props
    if (value === schoolId) {
      return
    }
    let nextProps = { schoolId: value }
    if (tabIndex === 1) {
      nextProps.page = 1
    } else {
      nextProps.warnset_page = 1
    }
    this.props.changeOrder(subModule, nextProps)
  }
  changePhase = v => {
    console.log(v)
    let { tabIndex } = this.props
    if (tabIndex !== v) {
      this.props.changeOrder(subModule, { tabIndex: v })
    }
  }
  render() {
    const { tabIndex, schoolId } = this.props
    const selector1 = (
      <SchoolSelector
        key="schoolSelector"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )

    return (
      <div className="panelWrapper orderWarnWrapper" ref="wrapper">
        <PhaseLine
          value={+tabIndex}
          staticPhase={ORDER_WARN_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changePhase}
        />

        {tabIndex === ORDER_WARN_TABS.WARNTABLE ? <WarnTable /> : <WarnSet />}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    tabIndex: state.orderModule[subModule].tabIndex,
    schoolId: state.orderModule[subModule].schoolId
  }
}

export default withRouter(
  connect(mapStateToProps, {
    changeOrder
  })(OrderWarn)
)
