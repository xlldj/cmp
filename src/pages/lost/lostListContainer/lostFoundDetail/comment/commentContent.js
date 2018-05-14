import React from 'react'
import CONSTANTS from '../../../../../constants'
import { Popconfirm, InputNumber } from 'antd'
import PopConfirmSelect from '../../../../../pages/component/popConfirmSelect'
import { defriend, deleteComment } from '../../controller'
import { withRouter } from 'react-router-dom'
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
  componentWillReceiveProps(nextprops) {
    debugger
  }
  defriend = (e, userId) => {
    e.preventDefault()
    let { commentParentId } = this.props
    defriend(userId, null, 2, commentParentId)
  }
  deleteComment = (e, id) => {
    e.preventDefault()
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
    const { comment, type } = this.props
    const { loseBlackTime } = this.state
    return (
      <div className="commentItem">
        <span className="blueFont">
          <span onClick={() => this.goToUserInfo(comment.userId)}>
            {comment.userMobile}({comment.userNickname})
            {comment.userInBlackList ? <span>(已被拉黑)</span> : null}
          </span>
          {type === LOST_REPLY ? (
            <span>
              <span className="balckFont">回复</span>
              <span onClick={() => this.goToUserInfo(comment.replyToUserId)}>
                {comment.replyToUserMobile}({comment.replyToUserNickname})
                {comment.replyToUserInBlackList ? (
                  <span>(已被拉黑)</span>
                ) : null}
              </span>
            </span>
          ) : null}
          :
        </span>
        <span>{comment.content}</span>
        {comment.userInBlackList ? (
          <span>该用户已被拉黑</span>
        ) : (
          <PopConfirmSelect
            confirmOk={e => this.defriend(e, comment.id, comment.userId)}
            selectOptions={LOST_BLACK_TIME_SELECTOPTIONS}
            selectedId={loseBlackTime}
            changeOpt={this.changeOpt}
            allTitle="选择拉黑时常"
            contentConfirm={<span className="blue_font">拉黑</span>}
          />
        )}
        {comment.status === LOST_FOUND_STATUS_SHADOWED ? (
          <span className="">(该评论已被{comment.delUserNickname}删除)</span>
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
