import React from 'react'
import { Button } from 'antd'
import PhaseLine from '../../component/phaseLine'
import SchoolSelector from '../../component/schoolSelector'
import LostFoundList from './lostFoundList'
import BlackedList from './blackPeopleList'
import LostFoundDetail from './lostFoundDetail'
import EnableComment from './enableComment'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeLost } from '../action'
import { lostFoundContainerPropsController } from './controller'

import CONSTANTS from '../../../constants'

const {
  LOST_LIST_PAGE_TAB_LOSTFOUND,
  LOST_LIST_PAGE_TAB_BLACKEDLIST,
  LOST_LIST_TAB_LOSTFOUND,
  LOST_LIST_TAB_BLACKLIST,
  LOST_LIST_TAB_ENABLECOMMENT,
  LOST_LIST_PAGE_TAB_ENABLECOMMENT
} = CONSTANTS
const moduleName = 'lostModule'
const subModule = 'lostListContainer'
const authModule = 'setAuthenData'

class LostListContainer extends React.Component {
  tabs = []
  componentDidMount() {
    this.setTabs()
    this.resetTabIndex()
  }
  setTabs = () => {
    debugger
    const { forbiddenStatus } = this.props
    const {
      LOST_FOUND_LIST,
      LOST_BLACKED_USER_LIST,
      LOST_COMMENT_ENABLE_LIST
    } = forbiddenStatus
    const tabs = []
    if (!LOST_FOUND_LIST) {
      tabs.push(LOST_LIST_TAB_LOSTFOUND)
    }
    if (!LOST_BLACKED_USER_LIST) {
      tabs.push(LOST_LIST_TAB_BLACKLIST)
    }
    if (!LOST_COMMENT_ENABLE_LIST) {
      tabs.push(LOST_LIST_TAB_ENABLECOMMENT)
    }
    this.tabs = tabs
  }
  resetTabIndex = () => {
    const { tabIndex, forbiddenStatus } = this.props
    const {
      LOST_FOUND_LIST,
      LOST_BLACKED_USER_LIST,
      LOST_COMMENT_ENABLE_LIST
    } = forbiddenStatus
    const hasRight2SeeLostList = !(
      LOST_FOUND_LIST &&
      LOST_BLACKED_USER_LIST &&
      LOST_COMMENT_ENABLE_LIST
    )
    if (hasRight2SeeLostList) {
      // 有查看订单列表的权限，无需进一步操作
      if (!LOST_FOUND_LIST && tabIndex !== LOST_LIST_PAGE_TAB_LOSTFOUND) {
        this.setProps({
          type: 'tabIndex',
          value: { tabIndex: LOST_LIST_PAGE_TAB_LOSTFOUND }
        })
      } else if (!LOST_BLACKED_USER_LIST) {
        this.props.changeLost(subModule, {
          tabIndex: LOST_LIST_PAGE_TAB_BLACKEDLIST
        })
      } else if (!LOST_COMMENT_ENABLE_LIST) {
        this.props.changeLost(subModule, {
          tabIndex: LOST_LIST_PAGE_TAB_ENABLECOMMENT
        })
      }
    }
  }
  getContent = () => {
    const { tabIndex, forbiddenStatus } = this.props
    if (tabIndex === LOST_LIST_PAGE_TAB_LOSTFOUND) {
      return <LostFoundList forbiddenStatus={forbiddenStatus} />
    } else if (tabIndex === LOST_LIST_PAGE_TAB_BLACKEDLIST) {
      return <BlackedList />
    } else if (tabIndex === LOST_LIST_PAGE_TAB_ENABLECOMMENT) {
      return <EnableComment />
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
  showEnableCommentModal = () => {
    this.props.changeLost('enableComment', { showEnableCommentModal: true })
  }
  render() {
    const { tabIndex, schoolId, showDetail } = this.props
    const selector =
      tabIndex === LOST_LIST_PAGE_TAB_ENABLECOMMENT ? null : (
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
          staticPhase={this.tabs}
          value={tabIndex}
          selectors={[selector]}
          changePhase={v =>
            this.setProps({ type: 'tabIndex', value: { tabIndex: v } })
          }
        >
          {tabIndex === LOST_LIST_PAGE_TAB_ENABLECOMMENT ? (
            <Button
              type="primary"
              style={{ marginRight: '30px' }}
              onClick={this.showEnableCommentModal}
            >
              评论上线设置
            </Button>
          ) : null}
        </PhaseLine>
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
