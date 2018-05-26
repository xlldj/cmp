import React from 'react'
import Time from '../../../../util/time'
import CONSTANTS from '../../../../constants'
const { TASK_HANDLE_BUILD } = CONSTANTS

const ProcessLogs = props => {
  const { logs } = props
  const processLogs =
    logs &&
    logs.map((l, i) => {
      let { id, createTime, assignName, processorName, content, type } = l
      let message = ''
      switch (type) {
        case TASK_HANDLE_BUILD:
          message = '创建工单'
          break
        case CONSTANTS.TASK_HANDLE_REASSIGN:
          message =
            '转接工单' +
            (assignName ? `给${assignName}` : '') +
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
        default:
          message = ''
      }
      return (
        <li key={`li${id}`}>
          <label key={`label${id}`} className="column">
            {createTime ? Time.getTimeStr(createTime) : ''}
          </label>
          <span key={`processor${id}`} className="column">
            {processorName}
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
