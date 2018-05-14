import React from 'react'
import CommentContent from './commentContent'
import Reply from './reply'
import { checkObject } from '../../../../../util/checkSame'
import CONSTANTS from '../../../../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchCommentsList } from '../../../action'
const modalName = 'lostModal'
const { LOST_COMMENT, COMMENT_SIZE_THRESHOLD } = CONSTANTS

class Comment extends React.Component {
  componentDidMount() {
    this.sendFetch()
  }
  componentWillReceiveProps(nextProps) {
    if (checkObject(this.props, nextProps, ['selectedDetailId'])) {
      return
    }
    this.sendFetch(nextProps)
  }
  showMoreComment() {}
  sendFetch(props) {
    props = props || this.props
    const { selectedDetailId, commentsSize = 10 } = props
    const body = {
      id: selectedDetailId,
      from: 1,
      commentsSize,
      repliesSize: 2
    }

    props.fetchCommentsList(body)
  }
  render() {
    const { comments, commentParentId } = this.props
    console.log(comments)
    return (
      <div className="commentsContent">
        {comments.map(comment => (
          <div className="commentWrapper" key={comment.id}>
            <CommentContent
              key={`commentContent${comment.id}`}
              type={LOST_COMMENT}
              comment={comment}
              commentParentId={commentParentId}
              {...this.props}
            />
            {comment.replies.length ? (
              <Reply
                key={`reply${comment.id}`}
                replies={comment.replies}
                repliesCount={comment.repliesCount}
                commentId={comment.id}
                cpmmentParentId={commentParentId}
              />
            ) : null}
          </div>
        ))}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  debugger
  return {
    comments: state[modalName].comments,
    commentsSize: state[modalName].detail.commentsCount,
    commentParentId: state[modalName].detail.id,
    commentsLoading: state[modalName].commentsLoading
  }
}

export default withRouter(
  connect(mapStateToProps, { fetchCommentsList })(Comment)
)
