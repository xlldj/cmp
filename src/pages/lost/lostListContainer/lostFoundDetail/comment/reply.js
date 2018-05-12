import React from 'react'
import CONSTANTS from '../../../../../constants'
import CommentContent from './commentContent'
const { LOST_REPLY } = CONSTANTS

class Reply extends React.Component {
  render() {
    const { replies } = this.props
    return (
      <div className="replyWrapper">
        {replies &&
          replies.map(reply => (
            <CommentContent key={reply.id} type={LOST_REPLY} comment={reply} />
          ))}
      </div>
    )
  }
}

export default Reply
