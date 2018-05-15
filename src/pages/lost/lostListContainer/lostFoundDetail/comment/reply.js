import React from 'react'
import CONSTANTS from '../../../../../constants'
import CommentContent from './commentContent'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { fetchRepliesList } from '../../../action'
import { deepCopy } from '../../../../../util/copy'
const { LOST_REPLY, COMMENT_SIZE_THRESHOLD } = CONSTANTS
const modalName = 'lostModal'
class Reply extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isShowAll: true
    }
  }
  componentWillReceiveProps(nextProps) {}
  showMoreComment = () => {
    const { commentId } = this.props
    const body = {
      id: commentId
    }
    this.props.fetchRepliesList(body)
    this.setState({
      isShowAll: false
    })
  }
  render() {
    const { replies, repliesCount, allReplies, commentId } = this.props
    const { isShowAll } = this.state
    return (
      <div className="replyWrapper">
        {replies &&
          isShowAll &&
          replies.map(reply => (
            <CommentContent
              key={reply.id}
              type={LOST_REPLY}
              comment={deepCopy(reply)}
              {...this.props}
            />
          ))}
        {repliesCount > COMMENT_SIZE_THRESHOLD && isShowAll ? (
          <a onClick={this.showMoreComment}>共{repliesCount}回复，点击展开</a>
        ) : null}
        {allReplies && !isShowAll
          ? allReplies[commentId]
            ? allReplies[commentId].map(reply => (
                <CommentContent
                  key={reply.id}
                  type={LOST_REPLY}
                  comment={deepCopy(reply)}
                  {...this.props}
                />
              ))
            : null
          : null}
      </div>
    )
  }
}
const mapStateToProps = (state, ownProps) => {
  return {
    allReplies: state[modalName].replies,
    allRepliesLoading: state[modalName].allRepliesLoading,
    ...ownProps
  }
}

export default withRouter(connect(mapStateToProps, { fetchRepliesList })(Reply))
