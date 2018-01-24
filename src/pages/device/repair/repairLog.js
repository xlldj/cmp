import React from 'react'
import { Link } from 'react-router-dom'

import { Button } from 'antd'

import Time from '../../../util/time'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../component/constants'
import Noti from '../../../util/noti'

const REPAIRSTATUS = CONSTANTS.REPAIRSTATUS

class RepairLog extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {},
      id: 0,
      username: '',
      repairs: []
    }
  }
  fetchRepairs = id => {
    let resource = '/repair/list'
    const body = {
      userId: id || this.state.id,
      status: [1, 2, 3, 4, 6, 7]
    }
    const cb = json => {
      if (json.data) {
        this.setState({
          repairs: json.data.repairDevices
        })
      } else {
        Noti.hintServiceError(json.error ? json.error.displayMessage : '')
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }
  componentDidMount() {
    this.props.hide(false)
    let id = parseInt(this.props.match.params.id.slice(1), 10)
    let username = this.props.location.state.username
    this.setState({
      id: parseInt(id, 10),
      username: username
    })

    this.fetchRepairs(id)
  }
  componentWillUnmount() {
    this.props.hide(true)
  }
  back = () => {
    this.props.history.goBack()
  }
  render() {
    let { id, repairs, username } = this.state
    const repairItems = repairs.map((record, index) => (
      <div className="repairSlot" key={`div${index}`}>
        <ul key={`ul${index}`}>
          <li key={index}>
            <p key={`status${index}`}>维修状态:</p>
            <span key={`repairStatus${index}`} className="padR20">
              {REPAIRSTATUS[record.status]}
            </span>
            <Link
              key={`link${index}`}
              to={{
                pathname: `/device/repair/repairInfo/:${record.id}`,
                state: { path: 'fromRepairLog' }
              }}
            >
              查看详情
            </Link>
          </li>
          {record.status !== 1 ? (
            <li key={`person${index}`}>
              <p key={`pp${index}`}>维修人员:</p>
              {record.assignName}
            </li>
          ) : null}
          {record.status === 7 ? (
            <li key={`finish${index}`}>
              <p key={`finishp${index}`}>维修完成时间</p>
              {Time.getTimeStr(record.finishTime)}
            </li>
          ) : (
            <li key={`createtime${index}`}>
              <p key={`creatp${index}`}>用户申请时间:</p>
              {Time.getTimeStr(record.createTime)}
            </li>
          )}
          {record.status === 7 ? null : (
            <li key={`waitingtime${index}`}>
              <p key={`waitp${index}`}>用户等待时间:</p>
              {Time.getSpan(record.createTime)}
            </li>
          )}
        </ul>
      </div>
    ))

    const repairsLog = (
      <div className="infoBlock noPadding">
        <h3>报修记录</h3>
        <div className="repairLogs">{repairItems}</div>
      </div>
    )
    return (
      <div className="infoBlockList deviceInfo">
        <div className="infoBlock noPadding">
          <h3>用户</h3>
          <div className="repairLogs">
            <div className="repairSlot">
              <ul>
                <li>
                  <p>{username}</p>
                  <Link
                    to={{
                      pathname: `/user/userInfo/:${id}`,
                      state: { path: 'fromRepairLog' }
                    }}
                  >
                    查看用户详情
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {repairs && repairs.length > 0 ? repairsLog : null}

        <div className="btnArea">
          <Button onClick={this.back}>返回</Button>
        </div>
      </div>
    )
  }
}

export default RepairLog
