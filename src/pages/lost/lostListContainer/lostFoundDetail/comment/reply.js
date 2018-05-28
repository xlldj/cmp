import React from 'react'
import { Spin } from 'antd'
import CONSTANTS from '../../../../../constants'
import CommentContent from './commentContent'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchRepliesList } from '../../../action'
import { deepCopy } from '../../../../../util/copy'
const { LOST_REPLY, COMMENT_SIZE_THRESHOLD } = CONSTANTS
class Reply extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShowAll: true
    }
  }
  showMoreComment = () => {
    const { comment } = this.props
    const body = {
      id: comment.id,
      from: COMMENT_SIZE_THRESHOLD,
      size: comment.repliesCount - COMMENT_SIZE_THRESHOLD
    }
    this.props.fetchRepliesList(body)
    this.setState({
      isShowAll: false
    })
  }
  render() {
    const { comment } = this.props
    const {
      repliesCount,
      loadingMore,
      allRepliesLoaded,
      userId: commentUserId,
      userMobile: commentUserMobile,
      userNickname: commentNickName,
      userInBlackList: commentUserInBlack
    } = comment
    const loadMore = loadingMore ? (
      <Spin />
    ) : (
      <a onClick={this.showMoreComment}>共{repliesCount}回复，点击展开</a>
    )
    return (
      <div className="replyWrapper">
        {comment.replies.map(reply => (
          <CommentContent
            key={reply.id}
            type={LOST_REPLY}
            comment={deepCopy(reply)}
            forbiddenStatus={this.props.forbiddenStatus}
            commentUserInBlack={commentUserInBlack}
            commentUserId={commentUserId}
            commentUserMobile={commentUserMobile}
            commentNickName={commentNickName}
          />
        ))}
        {allRepliesLoaded ? null : loadMore}
      </div>
    )
  }
}

export default withRouter(connect(null, { fetchRepliesList })(Reply))
