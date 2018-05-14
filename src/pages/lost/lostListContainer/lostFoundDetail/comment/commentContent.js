import React from 'react'
import CONSTANTS from '../../../../../constants'
import { Popconfirm } from 'antd'
import Noti from '../../../../../util/noti'
import { defriend, deleteComment } from '../../controller'
const { LOST_FOUND_STATUS_SHADOWED, LOST_REPLY } = CONSTANTS
class CommentContent extends React.Component {
  state = {
    showDefriendModal: false
  }
  defriend = (e, userId) => {
    e.preventDefault()
    defriend(userId, null, 2, () => {
      Noti.hintSuccess(this.props.history, '/lost')
    })
  }
  deleteComment = (e, id) => {
    e.preventDefault()
    const { type } = this.props
    deleteComment(id, type, () => {
      Noti.hintSuccess(this.props.history, '/lost')
    })
  }
  render() {
    const { comment, type } = this.props
    return (
      <div className="commentItem">
        <span className="blueFont">
          {comment.userMobile}({comment.userNickname})
          {type === LOST_REPLY ? (
            <span>
              <span className="balckFont">回复</span>
              {comment.replyToUserMobile}({comment.replyToUserNickname})
            </span>
          ) : null}
          :
        </span>
        <span>{comment.content}</span>
        {comment.userInBlackList ? (
          <span>(该用户已被拉黑)</span>
        ) : (
          <Popconfirm
            title="确认拉黑此条信息吗?"
            onConfirm={e => this.defriend(e, comment.userId)}
          >
            <span>拉黑</span>
          </Popconfirm>
        )}
        {comment.status === LOST_FOUND_STATUS_SHADOWED ? (
          <span className="blue_font">(该评论已被删除)</span>
        ) : (
          <Popconfirm
            title="确认删除此条信息吗?"
            onConfirm={e => this.deleteComment(e, comment.id)}
          >
            <span className="blue_font">删除</span>
          </Popconfirm>
        )}
      </div>
    )
  }
}

export default CommentContent
