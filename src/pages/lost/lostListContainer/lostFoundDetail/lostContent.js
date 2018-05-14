import React, { Fragment } from 'react'
import { Popconfirm, Button } from 'antd'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import Noti from '../../../../util/noti'
import { defriend, deleteComment } from '../controller'
const { LOST_FOUND_STATUS_SHADOWED, LOSTTYPE } = CONSTANTS
class LostContent extends React.Component {
  getImgsContent = () => {
    const { data } = this.props
    const { images } = data
    let imagesContent =
      images &&
      images.map((image, index) => {
        return <img src={image} alt="图片加载失败" key={`image${index}`} />
      })
    return imagesContent
  }
  defriend = e => {
    const { data } = this.props
    const { userId, id } = data
    let level = 2
    defriend(userId, id, level, () => {
      Noti.hintSuccess(this.props.history, '/lost')
    })
  }
  deleteComment = e => {
    e.preventDefault()
    const { data } = this.props
    const { type, id } = data
    deleteComment(id, type, () => {
      Noti.hintSuccess(this.props.history, '/lost')
    })
  }
  blackUser = () => {}
  render() {
    const { data } = this.props
    console.log(data)
    const {
      title,
      user,
      mobile,
      userInBlackList,
      type,
      createTime,
      description,
      commentsCount,
      viewCount
    } = data
    let ImagesContent = this.getImgsContent()
    return (
      <Fragment>
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${title || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>发布用户:</label>
            <span>
              {mobile}
              {userInBlackList ? '(已拉黑)' : ''}
            </span>
          </li>
          <li>
            <label>用户昵称:</label>
            <span>{user}</span>
          </li>
          <li>
            <label>发布类型:</label>
            <span>
              {type ? (LOSTTYPE[type] ? LOSTTYPE[type] : '暂无') : '暂无'}
            </span>
          </li>
          <li>
            <label>发布时间:</label>
            <span>{createTime ? Time.getTimeStr(createTime) : '--'}</span>
          </li>
          <li>
            <label>发布图片:</label>
            <span>{ImagesContent ? ImagesContent : '--'}</span>
          </li>
          <li>
            <label>发布内容:</label>
            <span>{description ? description : '--'}</span>
          </li>
          <li>
            <label>评论数量:</label>
            <span>{commentsCount || ''}</span>
          </li>
          <li>
            <label>查看数量:</label>
            <span>{viewCount || ''}</span>
          </li>
        </ul>

        {data.status !== LOST_FOUND_STATUS_SHADOWED ? (
          <Popconfirm
            title="确认屏蔽此条失物招领?"
            onConfirm={this.deleteComment}
          >
            <Button type="primary" className="rightSeperator">
              屏蔽此条失物招领
            </Button>
          </Popconfirm>
        ) : null}
        {userInBlackList ? null : (
          <Popconfirm title="确认拉黑该发布用户？" onConfirm={this.defriend}>
            <Button type="primary">拉黑该发布用户</Button>
          </Popconfirm>
        )}
      </Fragment>
    )
  }
}
export default LostContent
