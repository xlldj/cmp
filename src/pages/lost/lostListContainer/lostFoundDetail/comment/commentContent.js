import React from 'react'
import CONSTANTS from '../../../../../constants'
import { defriend, deleteComment } from '../../controller'
const { LOST_FOUND_STATUS_SHADOWED, LOST_REPLY } = CONSTANTS

class CommentContent extends React.Component {
  state = {
    showDefriendModal: false
  }
  defriend = (e, userId) => {
    e.preventDefault()
    defriend(userId)
  }
  deleteComment = (e, id) => {
    e.preventDefault()
    deleteComment(id)
  }
  render() {
    const { comment, type } = this.props
    return (
      <div className="">
        <span>
          {comment.userMobile}({comment.userNickname})
          {type === LOST_REPLY ? <span>回复xxx</span> : null}
        </span>
        {comment.userInBlackList ? (
          <span>拉黑详情:该用户已被谁拉黑</span>
        ) : (
          <a onClick={e => this.defriend(e, comment.userId)}>拉黑</a>
        )}
        {comment.status === LOST_FOUND_STATUS_SHADOWED ? (
          <span>该用户已被谁删除</span>
        ) : (
          <a onClick={e => this.deleteComment(e, comment.id)}>删除</a>
        )}
      </div>
    )
  }
}

export default CommentContent
