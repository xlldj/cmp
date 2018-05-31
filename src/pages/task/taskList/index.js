import React from 'react'
import { Button } from 'antd'

import TaskListQuery from './query'
import TaskTable from './table'

import PhaseLine from '../../component/phaseLine'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import { checkObject } from '../../../util/checkSame'
import Noti from '../../../util/noti'
import TaskDetail from './taskDetail/index.js'
import BuildTask from './buildTask'
import notworking from '../../assets/notworking.jpg'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import {
  changeTask,
  setUserInfo,
  changeOnline,
  fetchTaskList
} from '../../../actions'
import { taskListContainerPropsController } from './controller.js'
import { safeGet } from '../../../util/types'
const moduleName = 'taskModule'
const subModule = 'taskListContainer'
const modalName = 'taskModal'
const detailSubModule = 'taskDetail'

const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}
const ALLTAG = {
  1: false,
  2: true
}
const {
  TAB_TO_REDUX_NAME,
  TASK_PENDING,
  TASK_ASSIGNED,
  TASK_ACCEPTED,
  TASK_REFUSED,
  TASK_FINISHED,
  TASK_LIST_PAGE_TABS
} = CONSTANTS
const STATUS_LIST = {
  1: [TASK_PENDING],
  2: [TASK_ASSIGNED, TASK_ACCEPTED, TASK_REFUSED],
  3: [TASK_FINISHED]
}

const SIZE = CONSTANTS.PAGINATION
/*------后端接受的all为true/false,必传，post之前将0，1转为true/false---------*/
/*------后端接受的pending为int，不传为所有，我用0表示不传---------------------*/
/*------rule表示顺序或倒序，1为倒序，默认值----------------------------------*/
/*------sourcetype不传表示所有，我用0代替，1为体现，2为维修-------------------*/

class TaskList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showBuild: false
    }
  }

  setProps = event => {
    const { listLoading, detailLoading } = this.props
    if (listLoading || detailLoading) {
      return
    }
    const value = taskListContainerPropsController(
      this.state,
      this.props,
      event
    )
    if (value) {
      this.props.changeTask(subModule, value)
    }
  }
  componentDidMount() {
    this.props.hide(false)

    const { user, showDetail } = this.props
    const { isCs, csOnline } = user || {}
    if (isCs && !csOnline) {
      // 如果从订单预警跳过来，而且当前为客服，且未上线，则关掉详情。
      if (showDetail) {
        this.setProps({ type: 'toggleDetail', value: { showDetail: false } })
      }
      return
    }
    this.sendTaskListFetch()
  }
  sendTaskListFetch = props => {
    props = props || this.props
    let { tabIndex, schoolId, mine } = props
    const reduxStateName = TAB_TO_REDUX_NAME[tabIndex]
    const currentReduxState = props[reduxStateName]
    const { type, day, startTime, endTime, selectKey, page } = currentReduxState
    // 从订单预警的工单跳转过来
    const queryId = safeGet(props, 'location.state.id')
    const body = {
      page: page,
      size: SIZE,
      all: ALLTAG[mine],
      statusList: STATUS_LIST[tabIndex]
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (day !== 'all') {
      body.day = day
    }
    if (startTime && endTime) {
      body.startTime = startTime
      body.endTime = endTime
    }
    if (selectKey) {
      body.selectKey = selectKey
    }
    // console.log(type)
    if (type !== 'all') {
      body.type = type
    }
    // 从指定工单跳转过来
    if (queryId) {
      body.idList = [queryId]
    }
    props.fetchTaskList(body)
  }
  componentWillReceiveProps(nextProps) {
    try {
      // 比较属性中的值决定是否要重新获取数据。
      // 如果客服从下线变为上线，也去重新获取数据。
      if (
        !checkObject(this.props, nextProps, [
          'tabIndex',
          'schoolId',
          'mine',
          'pendingList',
          'handlingList',
          'finishedList'
        ]) ||
        (nextProps.user.csOnline && !this.props.user.csOnline)
      ) {
        this.sendTaskListFetch(nextProps)
      }
      this.props = nextProps
    } catch (e) {
      console.log(e)
    }
  }

  changePhase = v => {
    const { tabIndex } = this.props
    if (tabIndex !== v) {
      this.setProps({ type: 'tabIndex', value: { tabIndex: +v } })
    }
  }
  changeSchool = v => {
    const { schoolId, tabIndex } = this.props
    if (v === schoolId) {
      return
    }
    this.setProps({ type: 'schoolId', value: { schoolId: v } })
    this.props.changeTask(TAB_TO_REDUX_NAME[tabIndex], {
      page: 1
    })
  }
  changeAll = v => {
    const { mine, tabIndex } = this.props
    if (v !== mine) {
      this.props.changeTask(subModule, {
        mine: v
      })
    }
    this.props.changeTask(TAB_TO_REDUX_NAME[tabIndex], {
      page: 1
    })
  }
  changeToRepair = () => {
    this.setState({
      showBuild: true
    })
  }
  buildTask = () => {
    this.setState({
      showBuild: true
    })
    this.props.changeTask(detailSubModule, {
      isChangeRepair: false
    })
  }
  cancelBuildTask = () => {
    this.setState({
      showBuild: false
    })
    this.props.changeTask('taskDetail', {
      isHaveBackTask: false,
      backTaskId: null
    })
  }
  buildTaskSuccess = () => {
    Noti.hintOk('操作成功', '创建工单成功')
    this.setState({
      showBuild: false
    })
    this.sendTaskListFetch()
  }
  changeOnline = e => {
    this.props.changeOnline()
  }

  render() {
    const {
      tabIndex,
      schoolId,
      mine,
      showDetail,
      user,
      forbiddenStatus
    } = this.props
    const { isCs, csOnline } = user
    const { showBuild } = this.state

    const selector1 = (
      <SchoolSelector
        key="schoolSelector"
        className="select-item"
        selectedSchool={schoolId}
        changeSchool={this.changeSchool}
      />
    )
    const selector2 = (
      <BasicSelectorWithoutAll
        key="mineSelector"
        className="select-item"
        selectedOpt={mine}
        staticOpts={TARGETS}
        changeOpt={this.changeAll}
      />
    )
    return (
      <div className="taskPanelWrapper" ref="wrapper">
        {isCs && !csOnline ? (
          <div className="loadingMask offlineWrapper">
            <div className="offline">
              <img src={notworking} alt="offline" />
              <span>未进入工作状态</span>
              <Button size="small" type="primary" onClick={this.changeOnline}>
                点击上班
              </Button>
            </div>
          </div>
        ) : null}
        <PhaseLine
          value={tabIndex}
          staticPhase={TASK_LIST_PAGE_TABS}
          selectors={[selector1, selector2]}
          changePhase={this.changePhase}
        >
          <div className="block">
            {forbiddenStatus.BUILD_TASK ? null : (
              <Button
                type="primary"
                className="rightBtn"
                onClick={this.buildTask}
              >
                创建工单
              </Button>
            )}
          </div>
        </PhaseLine>
        <TaskListQuery {...this.props} />
        <TaskTable {...this.props} />
        {showDetail ? (
          <TaskDetail changeToRepair={this.changeToRepair} />
        ) : null}
        {showBuild ? (
          <BuildTask
            cancel={this.cancelBuildTask}
            success={this.buildTaskSuccess}
          />
        ) : null}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  tabIndex: state[moduleName][subModule].tabIndex,
  schoolId: state[moduleName][subModule].schoolId,
  mine: state[moduleName][subModule].mine,
  pendingList: state[moduleName].pendingList,
  handlingList: state[moduleName].handlingList,
  finishedList: state[moduleName].finishedList,
  showDetail: state[moduleName][subModule].showDetail,
  listLoading: state[modalName].listLoading,
  total: state[modalName].total,
  detailLoading: state[modalName].detailLoading,
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  user: state.setUserInfo
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo,
    changeOnline,
    fetchTaskList
  })(TaskList)
)
