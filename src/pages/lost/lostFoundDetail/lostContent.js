import React from 'react'
import { Popconfirm, Button } from 'antd'
import CONSTANTS from '../constants'
const { LOST_FOUND_STATUS_SHADOWED } = CONSTANTS

class LostContent extends React.Component {
  render() {
    const { data } = this.props
    const { title, user, userInBlackList } = data
    return (
      <div className="detailPanel-content">
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${title || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>发布用户:</label>
            <span>{user}</span>
          </li>
          <li>
            <label>设备ID:</label>
            <span>{data.macAddress || '暂无'}</span>
          </li>
        </ul>

        {data.status !== LOST_FOUND_STATUS_SHADOWED ? (
          <Popconfirm title="" onConfirm={this.openModal}>
            <Button className="rightSeperator">屏蔽此条失物招领</Button>
          </Popconfirm>
        ) : null}
        {userInBlackList ? null : (
          <Button type="primary" onClick={this.blackUser}>
            拉黑该发布用户
          </Button>
        )}
      </div>
    )
  }
}
export default LostContent
