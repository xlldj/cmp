import React from 'react'
import { Button, Dropdown, Pagination, Menu, Popconfirm } from 'antd'
import CONSTANTS from '../../../../constants'
import { checkObject } from '../../../../util/checkSame'
import { connect } from 'react-redux'
import {
  changeTask,
  changeOrder,
  changeDevice,
  changeFund,
  relateTask,
  csRemind,
  cancelRelate
} from '../../../../actions'
import Time from '../../../../util/time'
import moment from '../../../../util/myMoment'
const { TAB2HINT, NORMAL_DAY_7, roleModalName } = CONSTANTS
const subModule = 'taskDetail'

class HandleBtn extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showFinishModal: false,
      remTime: -1,
      timer: null
    }
    this.reassignMenu = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={2}>
          <span className="menuItem">维修员</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )
    this.reassignWithoutRepairman = (
      <Menu selectable={false} onClick={this.reassign}>
        <Menu.Item key={1}>
          <span className="menuItem">客服</span>
        </Menu.Item>
        <Menu.Item key={3}>
          <span className="menuItem">研发人员</span>
        </Menu.Item>
      </Menu>
    )
    this.resetTime = () => {
      let { remTime } = this.state
      if (remTime < 0) {
        return
      }
      this.setState({
        remTime: parseInt(remTime, 10) - 1
      })
      console.log(this.state.remTime)
      this.timer = setTimeout(this.resetTime, 1000 * 60)
    }
  }
  componentDidMount() {
    this.setTime()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['data'])) {
      return
    }
    this.setTime(nextProps)
  }
  componentWillUnmount() {
    clearTimeout(this.timer)
  }
  setTime = props => {
    props = props || this.props
    const { data } = props
    let { csRemindTime } = data
    let diffTime = csRemindTime
      ? moment().diff(moment(csRemindTime), 'minutes')
      : -1
    let time =
      diffTime >= 0 && diffTime <= 30 ? 30 - parseInt(diffTime, 10) : -1
    this.setState(
      {
        remTime: time
      },
      this.resetTime
    )
  }

  reassign = m => {
    try {
      const { key } = m
      // open different modal according to role
      const modalStateName = roleModalName[key]
      const value = {}
      value[modalStateName] = true
      this.props.changeTask(subModule, value)
    } catch (e) {
      console.log(e)
    }
  }
  finishTask = () => {
    this.props.changeTask('taskDetail', { showFinishModal: true })
  }
  changeComplaintPage = page => {
    this.props.changeTask('taskDetail', { complaintPage: page })
  }
  changeFeedbackPage = page => {
    this.props.changeTask('taskDetail', { feedbackPage: page })
  }
  goToMore = e => {
    e.preventDefault()
    try {
      const { data: detail, currentTab } = this.props
      const { deviceType, creatorId, residenceId, userMobile } = detail
      if (currentTab === 2) {
        this.props.changeOrder('orderList', {
          tabIndex: 1,
          page: 1,
          day: NORMAL_DAY_7, // last 7 days
          userType: 'all',
          startTime: '',
          endTime: '',
          schoolId: 'all',
          deviceType: 'all',
          status: 'all',
          selectKey: '',
          selectedRowIndex: -1,
          selectedDetailId: -1,
          showDetail: false
        })
        this.props.history.push({
          pathname: '/order/list',
          state: { path: 'fromTask', userId: creatorId }
        })
      } else if (currentTab === 3) {
        this.props.changeDevice('repair', {
          page: 1,
          schoolId: 'all',
          deviceType: 'all',
          status: 'all'
        })
        this.props.history.push({
          pathname: '/device/repair',
          state: { path: 'fromTask', userId: creatorId }
        })
      } else if (currentTab === 5) {
        this.props.changeOrder('orderList', {
          tabIndex: 1,
          page: 1,
          day: NORMAL_DAY_7, // last 7 days
          userType: 'all',
          startTime: '',
          endTime: '',
          schoolId: 'all',
          status: 'all',
          selectKey: '',
          selectedRowIndex: -1,
          selectedDetailId: -1,
          showDetail: false,
          deviceType: deviceType ? deviceType.toString() : 'all'
        })
        this.props.history.push({
          pathname: '/order/list',
          state: {
            path: 'fromTask',
            deviceType: deviceType,
            residenceId: residenceId
          }
        })
      } else if (currentTab === 6) {
        this.props.changeDevice('repair', {
          page: 1,
          schoolId: 'all',
          deviceType: 'all',
          status: 'all'
        })
        this.props.history.push({
          pathname: '/device/repair',
          state: {
            path: 'fromTask',
            deviceType: deviceType,
            residenceId: residenceId
          }
        })
      } else if (currentTab === 7) {
        this.props.changeFund('fundList', {
          page: 1,
          selectKey: userMobile ? userMobile.toString() : '',
          // type: 'all', // deprecated @2018/4/10
          status: 'all',
          schoolId: 'all',
          startTime: Time.get7DaysAgoStart(),
          endTime: Time.getTodayEnd()
        })
        this.props.history.push({
          pathname: '/fund/list',
          state: { path: 'fromTask', mobile: userMobile }
        })
      }
    } catch (e) {
      console.log(e)
    }
  }
  relateTarget = (id, targeId) => {
    const body = {
      sourceId: id,
      targeId: targeId
    }
    this.props.relateTask(body, this.props.sendFetch)
  }
  cancelRelate = id => {
    const body = {
      id: id
    }
    this.props.cancelRelate(body, this.props.sendFetch)
  }
  csRemind = id => {
    const body = {
      id: id
    }
    this.props.csRemind(body)
  }
  goToTask = id => {
    this.props.changeTask('taskListContainer', {
      selectedDetailId: id
    })
    const { data } = this.props
    const { id: BackTaskId } = data
    this.props.changeTask('taskDetail', {
      isHaveBackTask: true,
      backTaskId: BackTaskId
    })
  }
  ToRepair = () => {
    this.props.changeToRepair()
    this.props.changeTask('taskDetail', {
      isChangeRepair: true
    })
  }

  render() {
    const {
      data,
      forbiddenStatus,
      currentTab,
      complaintPage,
      feedbackPage,
      complaintTotal,
      feedbackTotal
    } = this.props
    const {
      status,
      type,
      handleLimit,
      relateTargetId,
      relatable,
      related,
      csRemindAble,
      id
    } = data
    const { remTime } = this.state

    return (
      <div className="handleBtn">
        {/* only show when 'status' is not finished and has right to handle. */}
        {status !== CONSTANTS.TASK_FINISHED && !forbiddenStatus.HANDLE_TASK ? (
          <div>
            {handleLimit !== true ? (
              <Dropdown
                overlay={
                  type === CONSTANTS.TASK_TYPE_REPAIR
                    ? this.reassignMenu
                    : this.reassignWithoutRepairman
                }
              >
                <Button type="primary">转接</Button>
              </Dropdown>
            ) : null}
            {handleLimit !== true ? (
              <Button type="primary" onClick={this.finishTask}>
                完结
              </Button>
            ) : null}
            {relatable ? (
              <Popconfirm
                title={
                  <span>
                    确定要关联到<a
                      onClick={() => this.goToTask(relateTargetId)}
                    >
                      工单{relateTargetId}
                    </a>
                  </span>
                }
                onConfirm={e => {
                  this.relateTarget(id, relateTargetId)
                }}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary">关联</Button>
              </Popconfirm>
            ) : null}
            {(type === CONSTANTS.TASK_TYPE_COMPLAINT ||
              type === CONSTANTS.TASK_TYPE_FEEDBACK) &&
            handleLimit !== true ? (
              <Popconfirm
                title="确定要转为报修工单吗"
                onConfirm={e => {
                  this.ToRepair()
                }}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary">转报修工单</Button>
              </Popconfirm>
            ) : null}
            {related ? (
              <Popconfirm
                title={
                  <span>
                    确定要取消关联<a
                      onClick={() => this.goToTask(relateTargetId)}
                    >
                      工单{relateTargetId}
                    </a>
                  </span>
                }
                onConfirm={e => {
                  this.cancelRelate(id)
                }}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary">取消关联</Button>
              </Popconfirm>
            ) : null}
            {csRemindAble ? (
              <Popconfirm
                title={'确定要催单吗？'}
                onConfirm={e => {
                  this.csRemind(id)
                }}
                okText="确认"
                cancelText="取消"
              >
                <Button type="primary" disabled={remTime > 0}>
                  {remTime > 0 ? (
                    <span>重新催单(剩余{remTime}分钟)</span>
                  ) : (
                    '催单'
                  )}
                </Button>
              </Popconfirm>
            ) : null}
          </div>
        ) : (
          <span>{/* span used to seize a seat */}</span>
        )}
        {currentTab === 2 ||
        currentTab === 3 ||
        currentTab === 5 ||
        currentTab === 6 ||
        currentTab === 7 ? (
          <div>
            <span className="hint">({TAB2HINT[currentTab]})</span>
            <a href="" onClick={this.goToMore}>
              查看更多
            </a>
          </div>
        ) : null}
        {currentTab === 8 || currentTab === 9 ? (
          <div>
            <Pagination
              current={currentTab === 8 ? complaintPage : feedbackPage}
              pageSize={CONSTANTS.TASK_DETAIL_LIST_LENGTH}
              total={currentTab === 8 ? complaintTotal : feedbackTotal}
              onChange={
                currentTab === 8
                  ? this.changeComplaintPage
                  : this.changeFeedbackPage
              }
            />
          </div>
        ) : null}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => ({
  complaintPage: state.taskModule.taskDetail.complaintPage,
  feedbackPage: state.taskModule.taskDetail.feedbackPage,
  complaintTotal: state.taskModule.taskDetail.complaintTotal,
  feedbackTotal: state.taskModule.taskDetail.feedbackTotal
})
export default connect(mapStateToProps, {
  changeTask,
  changeFund,
  changeOrder,
  changeDevice,
  relateTask,
  cancelRelate,
  csRemind
})(HandleBtn)
