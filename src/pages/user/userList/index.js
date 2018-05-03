import React from 'react'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import SchoolSelectorWithoutAll from '../../component/schoolSelectorWithoutAll'

import PhaseLine from '../../component/phaseLine'
import UserTable from './userTable'
import UserAnalyze from './userAnalyze'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser } from '../../../actions'

const subModule = 'userList'

const {
  USER_LIST_TAB_TABLE,
  USER_LIST_TAB_ANALYZE,
  USER_LIST_PAGE_TABS
} = CONSTANTS

class UserListView extends React.Component {
  componentWillReceiveProps(nextProps) {
    // 如果切换到消费分析页，且学校为全部，更改为第一个学校。
    let { tabIndex, schoolId, schools } = nextProps
    let newSchoolId = schools && schools[0] && schools[0].id
    if (
      tabIndex !== this.props.tabIndex &&
      tabIndex === USER_LIST_TAB_ANALYZE &&
      schoolId === 'all'
    ) {
      this.props.changeUser(subModule, {
        schoolId: newSchoolId
      })
    }
  }

  changeSchool = value => {
    let { schoolId, tabIndex } = this.props
    if (value === schoolId) {
      return
    }
    let nextProps = { schoolId: value }
    if (tabIndex === USER_LIST_TAB_TABLE) {
      nextProps.list_page = 1
    } else if (tabIndex === USER_LIST_TAB_ANALYZE) {
      nextProps.analyze_page = 1
    }
    this.props.changeUser(subModule, nextProps)
  }
  changePhase = value => {
    const v = +value
    let { tabIndex } = this.props
    if (tabIndex !== v) {
      this.props.changeUser(subModule, { tabIndex: v })
    }
  }
  getContent = tabIndex => {
    if (tabIndex === USER_LIST_TAB_ANALYZE) {
      return <UserAnalyze {...this.props} />
    } else {
      return <UserTable {...this.props} />
    }
  }
  render() {
    const { tabIndex, schoolId } = this.props
    const selector1 =
      tabIndex === USER_LIST_TAB_ANALYZE ? (
        <SchoolSelectorWithoutAll
          key="schoolSelectorWithoutAll"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      ) : (
        <SchoolSelector
          key="schoolSelector"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      )
    const tabContent = this.getContent(tabIndex)

    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={tabIndex}
          staticPhase={USER_LIST_PAGE_TABS}
          selectors={[selector1]}
          changePhase={this.changePhase}
        />

        {tabContent}
      </div>
    )
  }
}

const mapStateToTableProps = (state, ownProps) => ({
  tabIndex: state.userModule[subModule].tabIndex,
  schoolId: state.userModule[subModule].schoolId,

  list_userTransfer: state.userModule[subModule].list_userTransfer,
  list_selectKey: state.userModule[subModule].list_selectKey,
  list_page: state.userModule[subModule].list_page,

  analyze_day: state.userModule[subModule].analyze_day,
  analyze_startTime: state.userModule[subModule].analyze_startTime,
  analyze_endTime: state.userModule[subModule].analyze_endTime,
  analyze_deviceType: state.userModule[subModule].analyze_deviceType,
  analyze_selectKey: state.userModule[subModule].analyze_selectKey,

  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToTableProps, {
    changeUser
  })(UserListView)
)
