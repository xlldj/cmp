import React, { Fragment } from 'react'
import { Button } from 'antd'
import CONSTANTS from '../../../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../action'
const subModule = 'fundCheck'

const {
  FUND_CHECK_STATUS_HANDLING,
  FUND_CHECK_METHOD_MANUAL,
  FUNDTYPE
} = CONSTANTS

class FundCheckContent extends React.Component {
  openModal = () => {
    this.props.changeFund(subModule, { showHandleModal: true })
  }
  render() {
    const { detail, noRight2Handle } = this.props
    const { fundsMistake, platformOrder, thirdOrder } = detail
    const { orderType = 1, settleMethod, settleStatus, schoolName } =
      fundsMistake || {}
    const isHandleStatusNotOver = settleStatus === FUND_CHECK_STATUS_HANDLING
    const isTypeManual = settleMethod === FUND_CHECK_METHOD_MANUAL
    return (
      <Fragment>
        <h3 className="detailPanel-content-title">
          <span className="rightSeperator">{`${schoolName || ''}`}</span>
        </h3>
        <ul className="detailList">
          <li>
            <label>账单类型:</label>
            <span>{FUNDTYPE[orderType]}</span>
          </li>
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
      </Fragment>
    )
  }
}
export default withRouter(connect(null, { changeFund })(FundCheckContent))
