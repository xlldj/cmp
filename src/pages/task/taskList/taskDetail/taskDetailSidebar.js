import React, { Component, Fragment } from 'react'
import { Button } from 'antd'
import Time from '../../../../util/time'
import Noti from '../../../../util/noti'
import AjaxHandler from '../../../../util/ajax'
import CONSTANTS from '../../../../constants'

class TaskDetailSidebar extends Component {
  state = {
    message: '',
    messageError: false
  }
  changeMessage = e => {
    this.setState({
      message: e.target.value,
      messageError: false
    })
  }
  confirmPostMessage = (id, userMobile) => {
    console.log('posting message')
    // debugger
    let { message, posting } = this.state
    if (posting) {
      return
    }
    let m = message.trim()
    if (!m || m.length > 200) {
      return this.setState({
        messageError: true
      })
    }
    let resource = '/work/order/handle'
    const body = {
      id: id,
      content: m,
      type: CONSTANTS.TASK_HANDLE_SENDMESSAGE
    }
    const cb = json => {
      this.setState({
        posting: false,
        message: ''
      })
      if (json.data) {
        Noti.hintOk('操作成功', '已成功发送消息')
      }
      // keep detail and check if need to fetch list
      this.keepAndUpdate(id)
    }
    this.setState({
      posting: true
    })
    AjaxHandler.ajax(resource, body, cb, null, {
      clearPosting: true,
      thisObj: this
    })
  }
  render() {
    const { message, messageError } = this.state
    const {
      data,
      queryId,
      selectedDetailId,
      handleLimit,
      forbiddenStatus
    } = this.props
    const {
      id,
      createTime,
      status,
      userMobile,
      type,
      creatorName,
      assignName
    } =
      data || {}
    const statusClass = status === CONSTANTS.TASK_FINISHED ? '' : 'shalowRed'
    return (
      <div className="taskDetail-sidebar">
        <h3>工单信息</h3>
        <ul className="detailList">
          <li>
            <label>工单编号:</label>
            <span>{id}</span>
          </li>
          <li>
            <label>发起人:</label>
            <span>{creatorName}</span>
          </li>
          {status !== CONSTANTS.TASK_PENDING ? (
            <li>
              <label>受理人:</label>
              <span>{assignName}</span>
            </li>
          ) : null}
          <li>
            <label>创建时间:</label>
            <span>{createTime ? Time.getTimeStr(createTime) : ''}</span>
          </li>
          {status !== CONSTANTS.TASK_FINISHED ? (
            <li>
              <label>等待时间:</label>
              <span>{createTime ? Time.getSpan(createTime) : null}</span>
            </li>
          ) : null}
          <li>
            <label>当前状态:</label>
            <span className={statusClass}>
              {status ? CONSTANTS.TASKSTATUS[status] : ''}
            </span>
          </li>
          {queryId && +queryId === selectedDetailId ? (
            <Button
              style={{ marginTop: '20px' }}
              type="primary"
              onClick={this.back}
            >
              返回
            </Button>
          ) : null}
        </ul>

        {/* if not 'repair' type, not finished, has right to send message, show send message block. */}
        {type !== CONSTANTS.TASK_TYPE_REPAIR &&
        status !== CONSTANTS.TASK_FINISHED &&
        handleLimit !== true &&
        !forbiddenStatus.HANDLE_TASK ? (
          <div className="taskMessage">
            <h3>客服消息</h3>
            <textarea
              value={message}
              onChange={this.changeMessage}
              placeholder="可在此处发送客服消息给用户, 不超过200字"
            />
            <Button
              onClick={() => {
                this.confirmPostMessage(id, userMobile)
              }}
              type="primary"
            >
              发送
            </Button>
            {messageError ? (
              <span className="checkInvalid">消息应为1到200个字！</span>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }
}

export default TaskDetailSidebar
