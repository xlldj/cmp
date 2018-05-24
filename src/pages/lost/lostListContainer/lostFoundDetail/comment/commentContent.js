import React from 'react'
import CONSTANTS from '../../../../../constants'
import { Popconfirm } from 'antd'
import { Link } from 'react-router-dom'
import PopConfirmSelect from '../../../../../pages/component/popConfirmSelect'
import { defriend, deleteCommentOrLostinfo } from '../../controller'
import { notEmpty } from '../../../../../util/types'
import Time from '../../../../../util/time'
const {
  LOST_FOUND_STATUS_SHADOWED,
  LOST_REPLY,
  LOST_BLACK_TIME_SELECTOPTIONS,
  LOST_BLACK_TIME_SELECTED
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
    deleteCommentOrLostinfo(id, type, commentParentId)
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
    const {
      comment,
      type,
      forbiddenStatus,
      commentUserId,
      commentUserMobile,
      commentNickName,
      commentUserInBlack
    } = this.props
    const { loseBlackTime } = this.state
    return (
      <div className="commentItem">
        <span>
          <Link className="softLink" to={`/user/userInfo/:${comment.userId}`}>
            {comment.userMobile}({comment.userNickname})
            {comment.userInBlackList ? <span>(已被拉黑)</span> : null}
          </Link>
          {type === LOST_REPLY ? (
            <span>
              <span className="balckFont">回复</span>
              <Link
                className="softLink"
                to={`/user/userInfo/:${
                  comment.replyToUserId ? comment.replyToUserId : commentUserId
                }`}
              >
                {comment.replyToUserMobile
                  ? comment.replyToUserMobile
                  : commentUserMobile}({comment.replyToUserNickname
                  ? comment.replyToUserNickname
                  : commentNickName})
                {comment.replyToUserId ? (
                  <span>
                    {comment.replyToUserInBlackList ? (
                      <span>(已被拉黑)</span>
                    ) : null}
                  </span>
                ) : (
                  <span>
                    {commentUserInBlack ? <span>(已被拉黑)</span> : null}
                  </span>
                )}
              </Link>
            </span>
          ) : null}
          :
        </span>
        <span>{comment.content}</span>
        <span>
          {notEmpty(comment.createTime)
            ? Time.getTimeStr(comment.createTime)
            : ''}
        </span>

        <span className="noRightMargin">
          {comment.userInBlackList ? (
            '该用户已被拉黑'
          ) : forbiddenStatus.DEACTIVE_USER ? null : (
            <PopConfirmSelect
              confirmOk={e => this.defriend(comment.id, comment.userId)}
              selectOptions={LOST_BLACK_TIME_SELECTOPTIONS}
              selectedId={loseBlackTime}
              changeOpt={this.changeOpt}
              allTitle="选择拉黑时长"
              contentConfirm={<span className="blue_font">拉黑</span>}
            />
          )}
        </span>
        <span className="ant-divider" />
        <span className="noRightMargin">
          {comment.status === LOST_FOUND_STATUS_SHADOWED ? (
            `(该评论已被${comment.delUserNickname}删除)`
          ) : forbiddenStatus.DELETE_LOST_COMMENT ? null : (
            <Popconfirm
              title="确认删除此条信息吗?"
              onConfirm={e => this.deleteComment(comment.id)}
            >
              <span className="blue_font">删除</span>
            </Popconfirm>
          )}
        </span>
      </div>
    )
  }
}
export default CommentContent
