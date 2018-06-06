import React from 'react'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
const { TASK_HANDLE_BUILD } = CONSTANTS

const ProcessLogs = props => {
  const { logs } = props
  const goToTask = id => {
    props.changeTask('taskListContainer', {
      selectedDetailId: id
    })
    const { data } = props
    const { id: BackTaskId } = data
    props.changeTask('taskDetail', {
      isHaveBackTask: true,
      backTaskId: BackTaskId
    })
  }
  const processLogs =
    logs &&
    logs.map((l, i) => {
      let {
        id,
        createTime,
        assignName,
        processorName,
        content,
        type,
        assignId,
        assignRoleName,
        processorRoleName
      } = l
      let message = ''
      switch (type) {
        case TASK_HANDLE_BUILD:
          message = '创建工单'
          break
        case CONSTANTS.TASK_HANDLE_REASSIGN:
          message =
            '转接工单' +
            (assignName
              ? `给${
                  assignRoleName
                    ? assignRoleName + ':' + assignName
                    : assignName
                }`
              : '') +
            (content ? ` 备注信息: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_ACCEPT:
          message = (assignName ? assignName : '') + '接受工单'
          break
        case CONSTANTS.TASK_HANDLE_REFUSE:
          message = '拒绝工单' + (content ? ` 拒绝原因: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_SENDMESSAGE:
          message =
            '发送客服消息给用户: ' + (content ? ` 客服消息: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_FINISH:
          message = '完结工单' + (content ? ` 备注信息: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_RELATE: {
          let goTask = ''
          if (assignId) {
            goTask = <a onClick={() => goToTask(assignId)}>: 编号{assignId} </a>
          }
          message = <span>关联工单{goTask}</span>
          break
        }
        case CONSTANTS.TASK_HANDLE_CANCELRELATE:
          let goTask = ''
          if (assignId) {
            goTask = <a onClick={() => goToTask(assignId)}>: 编号{assignId} </a>
          }
          message = <span>取消关联工单{goTask}</span>
          break
        case CONSTANTS.TASK_HANDLE_AUTOMATIC:
          message = '自动分配' + (content ? ` 备注信息: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_CSREMIND:
          message = '催单' + (content ? ` 备注信息: ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_SETTARGET:
          message = '设置标签' + (content ? ` : ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_REPAIRPART:
          message = '选择维修配件' + (content ? ` : ${content}` : '')
          break
        case CONSTANTS.TASK_HANDLE_CHANGETASK:
          message = '转换工单为报修工单'
          break
        default:
          message = ''
      }
      return (
        <li key={`li${id}`}>
          <label key={`label${id}`} className="column">
            {createTime ? Time.getTimeStr(createTime) : ''}
          </label>
          <span key={`processor${id}`} className="column">
            {processorRoleName
              ? processorRoleName + ':' + processorName
              : processorName}
          </span>
          <span key={`content${id}`} className="column">
            {message}
          </span>
        </li>
      )
    })

  return logs && logs.length > 0 ? (
    <div className="processLogs">
      <h3>处理日志</h3>
      <ul className="columnsWrapper">{processLogs}</ul>
    </div>
  ) : null
}

export default ProcessLogs
