import React from 'react'
import CONSTANTS from '../../../../../constants'
import { Popconfirm } from 'antd'
import { Link } from 'react-router-dom'
import PopConfirmSelect from '../../../../../pages/component/popConfirmSelect'
import { defriend, deleteComment } from '../../controller'
const {
  LOST_FOUND_STATUS_SHADOWED,
  LOST_REPLY,
  LOST_BLACK_TIME_SELECTOPTIONS,
  LOST_BLACK_TIME_SELECTED,
  LOST_COMMENT
} = CONSTANTS
class CommentContent extends React.Component {
  state = {
    showDefriendModal: false,
    loseBlackTime: LOST_BLACK_TIME_SELECTED
  }
  defriend = (id, userId) => {
    let { commentParentId } = this.props
    const { loseBlackTime } = this.state
    defriend(userId, id, loseBlackTime, commentParentId)
  }
  deleteComment = id => {
    let { type, commentParentId } = this.props
    if (type === LOST_REPLY) {
      type = 4
    }
    if (type === LOST_COMMENT) {
      type = 3
    }
    deleteComment(id, type, commentParentId)
  }
  changeOpt = v => {
    this.setState({
      loseBlackTime: v
    })
  }
  goToUserInfo = userId => {
    this.props.history.push({
      pathname: `/user/userInfo/:${userId}`
    })
  }
  render() {
    const { comment, type, forbiddenStatus } = this.props
    const { loseBlackTime } = this.state
    return (
      <div className="commentItem">
        <span>
          <Link
            className="blueFont softLink"
            to={`/user/userInfo/:${comment.userId}`}
          >
            {comment.userMobile}({comment.userNickname})
            {comment.userInBlackList ? <span>(已被拉黑)</span> : null}
          </Link>
          {type === LOST_REPLY ? (
            <span>
              <span className="balckFont">回复</span>
              <Link
                className="blueFont softLink"
                to={`/user/userInfo/:${comment.userId}`}
              >
                {comment.replyToUserMobile}({comment.replyToUserNickname})
                <span>(已被拉黑)</span>
                ) : null}
              </Link>
            </span>
          ) : null}
          :
        </span>
        <span>{comment.content}</span>

        {comment.userInBlackList ? (
          <span>该用户已被拉黑</span>
        ) : (
          <span>
            {forbiddenStatus.DEACTIVE_USER ? null : (
              <PopConfirmSelect
                confirmOk={e => this.defriend(comment.id, comment.userId)}
                selectOptions={LOST_BLACK_TIME_SELECTOPTIONS}
                selectedId={loseBlackTime}
                changeOpt={this.changeOpt}
                allTitle="选择拉黑时常"
                contentConfirm={<span className="blue_font">拉黑</span>}
              />
            )}
          </span>
        )}
        {comment.status === LOST_FOUND_STATUS_SHADOWED ? (
          <span className="">(该评论已被{comment.delUserNickname}删除)</span>
        ) : (
          <span>
            {forbiddenStatus.DELETE_COMMENT ? null : (
              <Popconfirm
                title="确认删除此条信息吗?"
                onConfirm={e => this.deleteComment(comment.id)}
              >
                <span className="blue_font">删除</span>
              </Popconfirm>
            )}
          </span>
        )}
      </div>
    )
  }
}
export default CommentContent
