import React, { Fragment } from 'react'
import { Popconfirm, Button, InputNumber } from 'antd'
import PopConfirmSelect from '../../../../pages/component/popConfirmSelect'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import Noti from '../../../../util/noti'
import { withRouter } from 'react-router-dom'
import { defriend, deleteComment } from '../controller'
const {
  LOST_FOUND_STATUS_SHADOWED,
  LOSTTYPE,
  LOST_BLACK_TIME_SELECTOPTIONS,
  LOST_BLACK_TIME_SELECTED
} = CONSTANTS
class LostContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loseBlackTime: LOST_BLACK_TIME_SELECTED
    }
  }
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
  defriend = () => {
    const { data } = this.props
    const { userId, id } = data
    const { loseBlackTime } = this.state
    const level = loseBlackTime
    defriend(userId, id, level, id)
  }
  changeOpt = v => {
    this.setState({
      loseBlackTime: v
    })
  }
  deleteComment = () => {
    const { data } = this.props
    const { type, id } = data
    deleteComment(id, type, id)
  }
  blackUser = () => {}
  goToUserInfo = userId => {
    this.props.history.push({
      pathname: `/user/userInfo/:${userId}`
    })
  }
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
      viewCount,
      userId
    } = data
    let ImagesContent = this.getImgsContent()
    const { loseBlackTime } = this.state
    return (
      <Fragment>
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${title || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>发布用户:</label>
            <span onClick={() => this.goToUserInfo(userId)}>
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
          <PopConfirmSelect
            confirmOk={this.defriend}
            selectOptions={LOST_BLACK_TIME_SELECTOPTIONS}
            selectedId={loseBlackTime}
            changeOpt={this.changeOpt}
            allTitle="选择拉黑时常"
            contentConfirm={
              <Button type="primary" className="rightSeperator">
                拉黑该发布用户
              </Button>
            }
          />
        )}
      </Fragment>
    )
  }
}
export default withRouter(LostContent)
