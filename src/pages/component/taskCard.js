import React from 'react'
import { Link } from 'react-router-dom'
import { Badge } from 'antd'

const LEVEL = {
  NORMAL: '普通',
  PRIORITY: '优先',
  URGENT: '紧急'
}

const TaskCard = props => {
  return (
    <div className="card">
      <div className="cardContent">
        <div className="header">
          <h3>
            {props.type}：{props.name}
          </h3>
          <p className="username">{props.username}的任务</p>
        </div>
        <p>
          用户申请时间：<span className="time">{props.createTime}</span>
        </p>
        <p>
          用户等待时间：<span className="time">{props.waitTime}</span>
        </p>
      </div>
      <div className="status">
        <p>
          <Badge
            status={props.assigned ? 'success' : 'error'}
            text={props.statusIntro}
          />
          <div className="seperator" />
          {props.hintCount &&
            (props.hintCount > 0 ? (
              <Badge status="error" text={`用户提醒${props.hintCount}次`} />
            ) : null)}
          {props.level &&
            props.level !== 'NORMAL' && (
              <div className={`${props.level} level`}>{LEVEL[props.level]}</div>
            )}
          <div className="seperator" />
          {props.assignPassed && <span>{props.assignPassed}</span>}
        </p>
        <p>
          <Link to={{ pathname: props.detailAddr, state: 'fromTask' }}>
            查看详情
          </Link>
        </p>
      </div>
    </div>
  )
}

export default TaskCard
