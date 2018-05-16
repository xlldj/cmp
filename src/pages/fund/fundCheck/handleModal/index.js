import React, { Component, Fragment } from 'react'
import { Modal, Button, Radio } from 'antd'
import CONSTANTS from '../../../../constants'

import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import { changeFund } from '../../action'
import { settleOrder } from '../controller'
import { safeGet } from '../../../../util/types'
const moduleName = 'fundModule'
const subModule = 'fundCheck'
const modalName = 'fundCheckModal'
const {
  FUND_CHECK_REASON_NOREMOTE,
  FUND_CHECK_REASON_NOLOCAL,
  FUND_CHECK_NOLOCAL_HANDLE_TEXT
} = CONSTANTS

const RadioGroup = Radio.Group

class HandleModal extends Component {
  state = {
    settleLog: '',
    empty: false,
    flatAccount: 1
  }
  changeBalance = e => {
    this.setState({ flatAccount: e.target.value })
  }
  changeLog = e => {
    this.setState({ settleLog: e.target.value })
  }

  closeModal = e => {
    this.props.changeFund(subModule, { showHandleModal: false })
  }
  confirmFinish = e => {
    const { selectedDetailId } = this.props
    const { settleLog, flatAccount } = this.state
    const mistakeReason = safeGet(
      this.props,
      'detail.fundsMistake.mistakeReason'
    )
    const noBalanceOption =
      mistakeReason === FUND_CHECK_REASON_NOLOCAL ||
      mistakeReason === FUND_CHECK_REASON_NOREMOTE
    if (settleLog.length === 0) {
      return this.setState({
        empty: true
      })
    }
    const body = {
      id: selectedDetailId,
      settleLog: settleLog.trim(),
      flatAccount: flatAccount === 1 ? true : false
    }
    if (noBalanceOption) {
      delete body.flatAccount
    }
    settleOrder(body)
  }
  render() {
    const { settleLog, flatAccount, empty } = this.state
    const mistakeReason = safeGet(
      this.props,
      'detail.fundsMistake.mistakeReason'
    )
    const noBalanceOption =
      mistakeReason === FUND_CHECK_REASON_NOLOCAL ||
      mistakeReason === FUND_CHECK_REASON_NOREMOTE
    return (
      <Modal
        wrapClassName="modal finish"
        visible={true}
        width={450}
        title="立即处理"
        onCancel={this.closeModal}
        footer={null}
        okText=""
      >
        <div className="info">
          <ul style={{ backgroundColor: 'white', padding: '0px' }}>
            <li>
              {noBalanceOption ? (
                <Fragment>
                  <p>是否平账:</p>
                  <RadioGroup onChange={this.changeBalance} value={flatAccount}>
                    <Radio value={1}>是</Radio>
                    <Radio value={2}>否</Radio>
                  </RadioGroup>
                </Fragment>
              ) : (
                <span>{FUND_CHECK_NOLOCAL_HANDLE_TEXT}</span>
              )}
            </li>
            <li className="itemsWrapper">
              <p>处理方式记录:</p>
              <textarea
                value={settleLog}
                className="longText"
                onChange={this.changeLog}
                placeholder="200字以内"
              />
              {empty ? (
                <span className="checkInvalid">内容不能为空！</span>
              ) : null}
            </li>
          </ul>
          <div
            className="btnArea"
            style={{ backgroundColor: 'white', paddingTop: '0px' }}
          >
            <Button onClick={this.confirmFinish} type="primary">
              确认
            </Button>
            <Button onClick={this.closeModal}>返回</Button>
          </div>
        </div>
      </Modal>
    )
  }
}
const mapStateToProps = state => {
  return {
    selectedDetailId: state[moduleName][subModule].selectedDetailId,
    detail: state[modalName].detail
  }
}
export default withRouter(connect(mapStateToProps, { changeFund })(HandleModal))
