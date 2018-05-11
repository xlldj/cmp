import React from 'react'
import CommentContent from './commentContent'
import ReplyWrapper from './reply'

class Comment extends React.Component {
  render() {
    return (
      <div className="">
        <CommentContent />
        <ReplyWrapper />
      </div>
    )
  }
}
export default Comment
