import React from 'react'
import { Table, Button } from 'antd'

import PendingList from './pendingList'
import HandlingList from './handlingList'
import FinishedList from './finishedList'

import PhaseLine from '../../component/phaseLine'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import SchoolSelector from '../../component/schoolSelector'
import BasicSelectorWithoutAll from '../../component/basicSelectorWithoutAll'
import { checkObject } from '../../../util/checkSame'
import TaskDetail from './taskDetail'
import BuildTask from './buildTask'
import Noti from '../../../util/noti'
import notworking from '../../assets/notworking.jpg'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeTask, setUserInfo, changeOnline } from '../../../actions'
const moduleName = 'taskModule'
const moduleName = 'taskListContainer'
const subModule = 'taskList'

const TARGETS = {
  1: '我的任务',
  2: '所有客服任务'
}
const ALLTAG = {
  1: false,
  2: true
}
const {
  TASK_LIST_TAB_PENDING,
  TASK_LIST_TAB_HANDLING,
  TASK_LIST_TAB_FINISHED,
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
  static propTypes = {
    taskList: PropTypes.object.isRequired,
    forbiddenStatus: PropTypes.object.isRequired
  }
  constructor(props) {
    super(props)
    this.state = {
      showBuild: false
    }
  }
  fetchData = body => {
    let resource = '/api/work/sheet/list'
    const cb = json => {
      /* set a timer of 5 minutes, fetch the data again when timer fires */
      if (this.ti) {
        clearTimeout(this.ti)
        this.ti = null
      }
      this.ti = setTimeout(this.refetch, 5 * 60 * 1000)

      let nextState = {}
      if (json.error) {
        throw new Error(json.error)
      } else {
        let workSheets = json.data.workSheets
        nextState.dataSource = workSheets
        nextState.total = json.data.total
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  refetch = () => {
    let { all, assigned, sourceType, pending, page, schoolId } = this.props
    const body = {
      page: page,
      size: SIZE,
      assigned: assigned
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (all === '1') {
      body.all = false
    } else {
      body.all = true
    }
    if (pending !== 'all') {
      body.pending = parseInt(pending, 10)
    }
    if (sourceType !== 'all') {
      body.sourceType = parseInt(sourceType, 10)
    }
    this.fetchData(body)
  }
  componentDidMount() {
    this.props.hide(false)
    this.syncStateToProps()

    // add click event
    let root = document.getElementById('root')
    root.addEventListener('click', this.closeDetail, false)

    const { user, showDetail } = this.props
    const { isCs, csOnline } = user || {}
    if (isCs && !csOnline) {
      // if jumped from order/warn, and customer is offline, hide detail.
      if (showDetail) {
        this.props.changeTask(subModule, {
          showDetail: false
        })
      }
      return
    }
  }
  sendTaskListFetch = props => {
    props = props || this.props
    let {
      tabIndex,
      schoolId,
      mine,
      pendingList,
      handlingList,
      finishedList
    } = props
    const reduxStateName = TAB_TO_REDUX_NAME[tabIndex]
    const currentReduxState = props[reduxStateName]
    const { type, day, startTime, endTime, selectKey, page } = currentReduxState
    const body = {
      page: page,
      size: SIZE,
      all: ALLTAG[mine],
      statusList: STATUS_LIST[tabIndex]
    }
    if (schoolId !== 'all') {
      body.schoolId = parseInt(schoolId, 10)
    }
    if (day !== 0) {
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
    if (type) {
      body.type = type
    }
    this.fetchTasks(body)
  }
  closeDetail = e => {
    // e.preventDefault()
    // e.stopPropagation()
    if (!this.props.taskList.showDetail) {
      return
    }
    console.log('happen')
    let target = e.target
    let detailWrapper = this.refs.detailWrapper
    if (detailWrapper.contains(target)) {
      console.log('contain')
      return
    }
    if (this.props.taskList.showDetail) {
      this.props.changeTask(subModule, {
        showDetail: false,
        selectedRowIndex: -1,
        selectedDetailId: -1,
        details: {}
      })
    }
  }
  componentWillUnmount() {
    this.props.hide(true)
    let root = document.getElementById('root')
    root.removeEventListener('click', this.closeDetail, false)
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
      this.props.changeTask(subModule, { tabIndex: v })
    }
  }
  changeSchool = v => {
    const { schoolId, tabIndex } = this.props
    if (v === schoolId) {
      return
    }
    this.props.changeTask(subModule, {
      schoolId: v
    })
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

  buildTask = () => {
    this.setState({
      showBuild: true
    })
  }
  cancelBuildTask = () => {
    this.setState({
      showBuild: false
    })
  }
  changeOnline = e => {
    this.props.changeOnline()
  }
  getContents = () => {
    const { tabIndex, forbiddenStatus } = this.props
    if (tabIndex === TASK_LIST_TAB_PENDING) {
      return <PendingList forbiddenStatus={forbiddenStatus} />
    } else if (tabIndex === TASK_LIST_TAB_HANDLING) {
      return <HandlingList forbiddenStatus={forbiddenStatus} />
    } else if (tabIndex === TASK_LIST_TAB_FINISHED) {
      return <FinishedList forbiddenStatus={forbiddenStatus} />
    }
    return
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
        {this.getContents()}
        {showDetail ? <TaskDetail /> : null}
        {showBuild ? <BuildTask /> : null}
      </div>
    )
  }
}

// export default TaskList

const mapStateToProps = (state, ownProps) => ({
  tabIndex: state[moduleName][subModule].tabIndex,
  schoolId: state[moduleName][subModule].schoolId,
  mine: state[moduleName][subModule].mine,
  pendingList: state[moduleName].pendingList,
  handlingList: state[moduleName].handlingList,
  finishedList: state[moduleName].finishedList,
  showDetail: state[moduleName][subModule].showDetail,
  forbiddenStatus: state.setAuthenData.forbiddenStatus,
  user: state.setUserInfo
})

export default withRouter(
  connect(mapStateToProps, {
    changeTask,
    setUserInfo,
    changeOnline
  })(TaskList)
)
