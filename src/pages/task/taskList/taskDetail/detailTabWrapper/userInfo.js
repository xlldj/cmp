import React, { Component } from 'react'
import detailTabHoc from './detailTabHoc'
import Time from '../../../../../util/time'
import CONSTANTS from '../../../../../constants'
import { fetchUserInfo } from '../../../../../actions'
import { connect } from 'react-redux'

class UserInfoWrapper extends Component {
  render() {
    const { data: committer } = this.props
    return (
      <ul className="detailList">
        <li>
          <label>手机型号:</label>
          <span>
            {committer && committer.mobileModel ? committer.mobileModel : ''}
          </span>
        </li>
        <li>
          <label>用户昵称:</label>
          <span>
            {committer && committer.nickName ? committer.nickName : ''}
          </span>
        </li>
        {committer && committer.sex ? (
          <li>
            <label>用户性别:</label>
            <span>{CONSTANTS.SEX[committer.sex]}</span>
          </li>
        ) : null}
        <li>
          <label>账户余额:</label>
          <span>{committer ? '¥' + (committer.balance || 0) : ''}</span>
        </li>
        <li>
          <label>注册时间:</label>
          <span>
            {committer && committer.createTime
              ? Time.getTimeStr(committer.createTime)
              : ''}
          </span>
        </li>
      </ul>
    )
  }
}
const fetchData = props => {
  const { creatorId } = props
  const body = {
    id: creatorId
  }
  fetchUserInfo(body)
}

const mapStateToProps = (state, ownProps) => ({
  data: state.userInfoModal.detail
})
export default connect(mapStateToProps, null)(
  detailTabHoc(UserInfoWrapper, fetchData, ['creatoreId'])
)
