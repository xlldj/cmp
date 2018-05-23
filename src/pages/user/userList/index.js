import React from 'react'
import { Button } from 'antd'

import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import SchoolSelectorWithoutAll from '../../component/schoolSelectorWithoutAll'

import PhaseLine from '../../component/phaseLine'
import UserTable from './userTable'
import UserAnalyze from './userAnalyze'
import FoxconnList from './foxconnList'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeUser, changeOrder } from '../../../actions'

const subModule = 'userList'

const {
  USER_LIST_TAB_TABLE,
  USER_LIST_TAB_ANALYZE,
  USER_LSIT_TAB_FOXCONN,
  USER_LIST_PAGE_TAB_USERS,
  USER_LIST_PAGE_TAB_FOXCONN,
  USER_LIST_PAGE_TAB_ANALYZE,
  USER_LIST_FOX,
  USER_LIST_ANALYZE
} = CONSTANTS

class UserListView extends React.Component {
  componentDidMount() {
    this.resetTabIndexIfNeeded()
  }
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
  resetTabIndexIfNeeded = () => {
    const { forbiddenStatus, tabIndex } = this.props
    const {
      USER_LIST_GET,
      FOX_USER_LIST,
      USER_CONSUME_ANALYZE
    } = forbiddenStatus
    const hasRight2SeeOrderList = !(
      USER_LIST_GET &&
      FOX_USER_LIST &&
      USER_CONSUME_ANALYZE
    )
    if (hasRight2SeeOrderList) {
      // 有查看订单列表的权限，如果当前tabIndex不一致，更改之
      if (!USER_LIST_GET && tabIndex !== USER_LIST_TAB_TABLE) {
        this.props.changeUser(subModule, {
          tabIndex: USER_LIST_TAB_TABLE
        })
        return
      } else if (!FOX_USER_LIST) {
        this.props.changeUser(subModule, {
          tabIndex: USER_LIST_FOX
        })
      } else if (!USER_CONSUME_ANALYZE) {
        this.props.changeUser(subModule, {
          tabIndex: USER_LIST_ANALYZE
        })
      }
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
      nextProps.buildingIds = 'all'
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
    } else if (tabIndex === USER_LIST_TAB_TABLE) {
      return <UserTable {...this.props} />
    } else {
      return <FoxconnList {...this.props} />
    }
  }
  getSelectors = () => {
    const { tabIndex, schoolId } = this.props
    if (tabIndex === USER_LIST_TAB_ANALYZE) {
      return (
        <SchoolSelectorWithoutAll
          key="schoolSelectorWithoutAll"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      )
    } else if (tabIndex === USER_LIST_TAB_TABLE) {
      return (
        <SchoolSelector
          key="schoolSelector"
          selectedSchool={schoolId}
          changeSchool={this.changeSchool}
        />
      )
    } else {
      return null
    }
  }
  toFoxconnUserImport = e => {
    this.props.history.push({
      pathname: '/user/foxconn'
    })
  }
  render() {
    const { tabIndex, forbiddenStatus } = this.props
    const tabs = []
    if (!forbiddenStatus.USER_LIST_GET) {
      tabs.push(USER_LIST_PAGE_TAB_USERS)
    }
    if (!forbiddenStatus.FOX_USER_LIST) {
      tabs.push(USER_LIST_PAGE_TAB_FOXCONN)
    }
    if (!forbiddenStatus.USER_CONSUME_ANALYZE) {
      tabs.push(USER_LIST_PAGE_TAB_ANALYZE)
    }
    const selector1 = this.getSelectors()
    const tabContent = this.getContent(tabIndex)

    return (
      <div className="panelWrapper" ref="wrapper">
        <PhaseLine
          value={tabIndex}
          staticPhase={tabs}
          selectors={[selector1]}
          changePhase={this.changePhase}
        >
          {tabIndex === USER_LSIT_TAB_FOXCONN &&
          !forbiddenStatus.IMPORT_USERS ? (
            <Button
              type="primary"
              onClick={this.toFoxconnUserImport}
              style={{ marginRight: '20px' }}
            >
              导入员工信息
            </Button>
          ) : null}
        </PhaseLine>

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

  foxconn_selectKey: state.userModule[subModule].foxconn_selectKey,
  foxconn_page: state.userModule[subModule].foxconn_page,
  foxconn_auth: state.userModule[subModule].foxconn_auth,

  analyze_day: state.userModule[subModule].analyze_day,
  analyze_startTime: state.userModule[subModule].analyze_startTime,
  analyze_endTime: state.userModule[subModule].analyze_endTime,
  analyze_deviceType: state.userModule[subModule].analyze_deviceType,
  analyze_selectKey: state.userModule[subModule].analyze_selectKey,
  analyze_page: state.userModule[subModule].analyze_page,
  buildingsOfSchoolId: state.buildingsSet.buildingsOfSchoolId,
  buildingIds: state.userModule[subModule].buildingIds,

  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  schools: state.setSchoolList.schools
})

export default withRouter(
  connect(mapStateToTableProps, {
    changeUser,
    changeOrder
  })(UserListView)
)
