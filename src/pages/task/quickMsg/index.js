import React from 'react'
import { Button } from 'antd'
import PhaseLine from '../../component/phaseLine'
import CONSTANTS from '../../../constants/index'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { quickMsgPropsController } from './controller'
import { changeTask } from '../action'
import QuickMsgListTable from './quickTypeList/index'
import QuickMsgListContainer from './quickMsgList/index'
import QuickInfo from './quickMsgList/quickInfo'
import QuickTypeInfo from './quickTypeList/quickTypeInfo'
const moduleName = 'taskModule'
const subModule = 'quickMsg'
const subModuleMsg = 'quickMsgList'
const subModuleType = 'quickType'
const modalName = 'quickTypeModal'
const {
  QUICK_MSG_TAB_LIST,
  QUICK_MSG_TAB_TYPE,
  QUICK_MSG_LIST_TAB,
  QUICK_MSG_TYPE_TAB
} = CONSTANTS
class QuickMsgContainer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }
  componentDidMount() {
    this.props.hide(false)
  }
  setProps = event => {
    const { listLoading, detailLoading } = this.props
    if (listLoading || detailLoading) {
      return
    }
    const value = quickMsgPropsController(this.state, this.props, event)
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  getContent = () => {
    const { tabIndex } = this.props
    if (tabIndex === QUICK_MSG_TAB_LIST) {
      return <QuickMsgListContainer />
    }
    if (tabIndex === QUICK_MSG_TAB_TYPE) {
      return <QuickMsgListTable />
    }
  }
  addQuickMsg = () => {
    this.props.changeTask(subModuleMsg, {
      isShowQuickInfo: true,
      quickInfoTitle: '添加快捷消息',
      editMsg: false
    })
  }
  addQuickType = () => {
    this.props.changeTask(subModuleType, {
      isShowQuickTypeInfo: true,
      editTypeInfo: false,
      quickTypeInfoTitle: '添加消息类型'
    })
  }
  closeQuickInfo = () => {
    this.props.changeTask(subModuleMsg, {
      isShowQuickInfo: false
    })
  }
  closeQuickTypeInfo = () => {
    this.props.changeTask(subModuleType, {
      isShowQuickTypeInfo: false
    })
  }
  getTabs = () => {
    const { forbiddenStatus } = this.props
    const { QUICK_TYPE_LIST_GET, QUICK_MSG_LIST_GET } = forbiddenStatus
    let tabs = []
    if (!QUICK_MSG_LIST_GET) {
      tabs.push(QUICK_MSG_LIST_TAB)
    } else {
      this.props.changeTask({
        tabIndex: QUICK_MSG_TAB_TYPE
      })
    }
    if (!QUICK_TYPE_LIST_GET) {
      tabs.push(QUICK_MSG_TYPE_TAB)
    }
    return tabs
  }
  render() {
    const {
      tabIndex,
      isShowQuickInfo,
      isShowQuickTypeInfo,
      forbiddenStatus
    } = this.props
    const { ADD_EDIT_DEL_QUICKMSG, ADD_EDIT_DEL_QUICKMSGTYPE } = forbiddenStatus
    return (
      <div className="panelWrapper">
        <PhaseLine
          staticPhase={this.getTabs()}
          value={tabIndex}
          changePhase={v =>
            this.setProps({ type: 'tabIndex', value: { tabIndex: v } })
          }
        >
          {tabIndex === QUICK_MSG_TAB_LIST && !ADD_EDIT_DEL_QUICKMSG ? (
            <Button
              type="primary"
              style={{ marginRight: '30px' }}
              onClick={this.addQuickMsg}
            >
              添加快捷消息
            </Button>
          ) : null}
          {tabIndex === QUICK_MSG_TAB_TYPE && !ADD_EDIT_DEL_QUICKMSGTYPE ? (
            <Button
              type="primary"
              style={{ marginRight: '30px' }}
              onClick={this.addQuickType}
            >
              添加消息类型
            </Button>
          ) : null}
        </PhaseLine>
        {this.getContent()}
        {isShowQuickInfo ? (
          <QuickInfo {...this.props} closeQuickInfo={this.closeQuickInfo} />
        ) : null}
        {isShowQuickTypeInfo ? (
          <QuickTypeInfo
            {...this.props}
            closeQuickTypeInfo={this.closeQuickTypeInfo}
          />
        ) : null}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  tabIndex: state[moduleName][subModule].tabIndex,
  isShowQuickInfo: state[moduleName][subModuleMsg].isShowQuickInfo,
  quickInfoTitle: state[moduleName][subModuleMsg].quickInfoTitle,
  editMsg: state[moduleName][subModuleMsg].editMsg,
  selectedMsg: state[moduleName][subModuleMsg].selectedMsg,
  isShowQuickTypeInfo: state[moduleName][subModuleType].isShowQuickTypeInfo,
  quickTypeInfoTitle: state[moduleName][subModuleType].quickTypeInfoTitle,
  editTypeInfo: state[moduleName][subModuleType].editTypeInfo,
  selectedType: state[moduleName][subModuleType].selectedType,
  selectRecord: state[moduleName][subModuleMsg].selectRecord,
  selectTypeRecord: state[moduleName][subModuleType].selectRecord,
  quickTypeList: state[modalName].list
})
export default withRouter(
  connect(mapStateToProps, { changeTask })(QuickMsgContainer)
)
