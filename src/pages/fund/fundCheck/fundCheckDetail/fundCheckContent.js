import React from 'react'
import { Button, Badge } from 'antd'
import CONSTANTS from '../../../../constants'
import Time from '../../../../util/time'
import { notEmpty } from '../../../../util/types'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../action'
const subModule = 'fundCheck'
const STATUS_CLASSNAME = {
  1: 'error', // 未处理
  2: 'success'
}

const {
  FUND_CHECK_STATUS_HANDLING,
  FUND_CHECK_METHOD_MANUAL,
  FUNDTYPE,
  FUND_CHECK_MISTAKE_TYPES,
  FUND_MISTAKE_METHOD,
  FUND_MISTAKE_STATUS,
  FUND_CHECK_MISTAKES
} = CONSTANTS

class FundCheckContent extends React.Component {
  openModal = () => {
    this.props.changeFund(subModule, { showHandleModal: true })
  }
  render() {
    const { detail, noRight2Handle } = this.props
    const { fundsMistake } = detail
    const {
      orderType = 1,
      settleMethod,
      settleStatus,
      schoolName,
      mistakeReason,
      mistakeAmount,
      settleUserName,
      settleTime,
      mistakeType,
      settleLog
    } =
      fundsMistake || {}
    const isHandleStatusNotOver = settleStatus === FUND_CHECK_STATUS_HANDLING
    const isTypeManual = settleMethod === FUND_CHECK_METHOD_MANUAL
    return (
      <div className="detailPanel-contentBlock">
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${schoolName || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>账单类型:</label>
            <span>{FUNDTYPE[orderType]}</span>
          </li>
          <li>
            <label>异常类型:</label>
            <span>{FUND_CHECK_MISTAKE_TYPES[mistakeType]}</span>
          </li>
          <li>
            <label>异常原因:</label>
            <span>
              {notEmpty(mistakeReason)
                ? FUND_CHECK_MISTAKES[mistakeReason]
                : '--'}
            </span>
          </li>
          <li>
            <label>异常金额:</label>
            <span className="shallowRed">
              {notEmpty(mistakeAmount) ? `¥${mistakeAmount}` : '--'}
            </span>
          </li>
          {isHandleStatusNotOver ? null : (
            <li>
              <label>处理方式:</label>
              <span>{FUND_MISTAKE_METHOD[settleMethod]}</span>
            </li>
          )}
          <li>
            <label>处理状态:</label>
            <Badge
              text={FUND_MISTAKE_STATUS[settleStatus]}
              status={STATUS_CLASSNAME[settleStatus]}
            />
          </li>
          <li>
            <label>处理人员:</label>
            <span>{settleUserName}</span>
          </li>
          <li>
            <label>处理时间:</label>
            <span>
              {notEmpty(settleTime) ? Time.getTimeStr(settleTime) : ''}
            </span>
          </li>
          <li className="wrapBlock">
            <label>处理方式记录:</label>
            <span className="wrapText">{settleLog}</span>
          </li>
          {/* {isHandleStatusNotOver ? null : (
            <li className="wrapBlock">
              <label>处理方式记录:</label>
              <span className="wrapText">{settleLog}</span>
            </li>
          )} */}
        </ul>

        {isHandleStatusNotOver && isTypeManual && !noRight2Handle ? (
          <Button
            type="primary"
            className="rightSeperator"
            onClick={this.openModal}
          >
            立即处理
          </Button>
        ) : null}
      </div>
    )
  }
}
export default withRouter(connect(null, { changeFund })(FundCheckContent))
