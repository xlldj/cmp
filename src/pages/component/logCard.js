import React from 'react'
import {Link} from 'react-router-dom'
import Popconfirm from 'antd/lib/popconfirm'

const LogCard = (props) => {
  return (
    <div className='card'>
      <div className='cardContent'>
        <div className='header'>
          <h3>{props.name}</h3>
          <p>{props.username}的任务</p>
        </div>
        <p>{props.brief}</p>
      </div>
      <div className='status'>
        <p>
          创建时间：{props.createTime}
        </p>
        <p>
          <Link to={props.detailAddr} >编辑</Link>
          <span className='ant-divider' />
          <Popconfirm title='确定要删除么?' onConfirm={props.delete} okText='确认' cancelText='取消'>
            <a href='#'>删除</a>
          </Popconfirm>
        </p>
      </div>
    </div>
  )
}

export default LogCard
