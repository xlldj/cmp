import React from 'react'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal } from 'antd'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import Time from '../../../util/time'
import Noti from '../../../util/noti'
import LoadingMask from '../../component/loadingMask'
import closeBtn from '../../assets/close.png'

const { DEVICETYPE } = CONSTANTS
const STATUSCLASS = {
  1: 'warning',
  2: 'success',
  4: ''
}

class OrderInfo extends React.Component {
  constructor(props) {
    super(props)
    const data = {
      createTime: 4534534534543,
      deviceId: 0,
      deviceLocation: '',
      macAddress: '',
      deviceType: 1,
      id: 0,
      orderNo: '',
      paymentType: '',
      schoolId: 0,
      schoolName: '',
      status: 1,
      waterUsage: 0,
      consume: 0,
      posting: false
    }
    this.state = {
      data: data,
      modalClosable: true,
      modalVisible: false,
      modalMessage: ''
    }
  }
  fetchData = props => {
    let { id } = props || this.props
    const body = { id }
    let resource = '/api/order/details'
    const cb = json => {
      if (json.error) {
        throw new Error(json.error.displayMessage || json.error)
      } else {
        if (json.data) {
          this.setState({
            data: json.data
          })
        }
      }
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  componentDidMount() {
    this.fetchData()
  }
  back = () => {
    this.props.history.goBack()
  }
  confirmSettle = () => {
    this.setState({
      posting: true
    })
    let resource = '/order/chargeback'
    let reason = `由于${
      this.state.modalMessage
    }，此单已做退单处理，你可以前往消费记录中查看，有一笔免费的订单。`
    const body = {
      id: this.state.id,
      reason: reason
    }
    const cb = json => {
      const nextState = {
        posting: false
      }
      if (json.error) {
        Noti.hintServiceError(json.error.displayMessage)
      } else if (json.data && json.data.result) {
        Noti.hintSuccessWithoutSkip()
        nextState.modalVisible = false
        nextState.modalMessage = ''
        this.fetchData({
          id: this.state.id
        })
      }
      this.setState(nextState)
    }
    AjaxHandler.ajax(resource, body, cb)
  }

  modalConfirmed = () => {
    let { modalMessage, modalMessageError, posting } = this.state
    if (posting) {
      return
    }

    if (!modalMessage) {
      return this.setState({
        modalMessageError: true
      })
    }
    if (modalMessageError) {
      this.setState({
        modalMessageError: false
      })
    }
    this.confirmSettle()
  }
  modalCanceled = () => {
    this.setState({
      modalVisible: false,
      modalMessage: '',
      modalMessageError: false
    })
  }
  modalBlured = e => {
    let v = e.target.value.trim()
    if (!v) {
      return this.setState({
        modalMessageError: true
      })
    }
    if (this.state.modalMessageError) {
      this.setState({
        modalMessageError: false,
        modalMessage: v
      })
    }
  }
  openModal = () => {
    this.setState({
      modalVisible: true
    })
  }
  modalMessageChange = e => {
    let v = e.target.value
    this.setState({
      modalMessage: v
    })
  }
  render() {
    let { data, modalClosable, detailLoading } = this.state
    const { schoolName, deviceLocation, prepay, orderNo, deviceType } =
      data || {}
    console.log(this.props)

    const popTitle = (
      <p className="popTitle">
        退单后该笔订单的预付金额和代金券都将返还给用户，确定要退单么?
      </p>
    )

    return (
      <div className="detailPanelWrapper slideLeft" ref="detailWrapper">
        {detailLoading ? (
          <div className="task-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}

        <div className="detailPanel-header">
          <h3>定单详情</h3>
          <button className="closeBtn" onClick={this.close}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="detailPanel-content">
          <h3 className="detailPanel-content-title">
            {`${schoolName || ''}${deviceLocation || ''}`}
          </h3>
          <ul className="detailList">
            <li>
              <label>订单号:</label>
              <span>{orderNo}</span>
            </li>
            <li>
              <label>设备类型</label>
              <span>{DEVICETYPE[deviceType] || '未知'}</span>
            </li>
            <li>
              <label>设备ID</label>
              <span>{data.macAddress || '暂无'}</span>
            </li>
          </ul>
          <ul className="detailList">
            <li>
              <label>用户手机:</label>
              <span className="padR20">{data.mobile || '暂无'}</span>
              <Link
                to={{
                  pathname: `/user/userInfo/:${data.userId}`,
                  state: { path: 'fromOrder' }
                }}
              >
                查看用户详情
              </Link>
            </li>
            <li>
              <label>预付金额</label>
              <span>{prepay || '未知'}</span>
            </li>
            {data.status !== 1 ? (
              <li>
                <label>实际消费</label>
                <span className="shalowRed">{`${data.consume}`}</span>
              </li>
            ) : null}
            {data.bonusAmount ? (
              <li>
                <p>代金券抵扣:</p>
                <span>{data.bonusAmount}</span>
              </li>
            ) : null}
            {data.actualDebit ? (
              <li>
                <p>实际扣款</p>
                <span>{data.actualDebit}</span>
              </li>
            ) : null}
            {data.status !== 1 && data.odd ? (
              <li>
                <p>找零金额:</p>
                <span>{data.odd ? data.odd : '未知'}</span>
              </li>
            ) : null}
            {data.status !== 1 ? (
              <li>
                <p>结账方式:</p>
                {data.checkoutByOther ? '代结账' : '自结账'}
              </li>
            ) : null}
          </ul>
          <ul className="detailList">
            <li>
              <p>开始时间:</p>
              {Time.getTimeStr(data.createTime)}
            </li>
            {data.status !== 1 ? (
              <li>
                <p>结束时间:</p>
                {data.finishTime ? Time.getTimeStr(data.finishTime) : ''}
              </li>
            ) : null}
            <li>
              <p>使用状态:</p>
              <span className={STATUSCLASS[data.status]}>
                {CONSTANTS.ORDERSTATUS[data.status]}
              </span>
            </li>

            {data.status !== 4 ? (
              <li>
                <p />
                <Popconfirm title={popTitle} onConfirm={this.openModal}>
                  <Button>退单</Button>
                </Popconfirm>
              </li>
            ) : null}
            {data.status === 4 ? (
              <li>
                <p>退单操作人:</p>
                <span>{data.chargebackExecutor}</span>
              </li>
            ) : null}
            {data.status === 4 ? (
              <li>
                <p>退单原因:</p>
                <span>{data.chargebackReason}</span>
              </li>
            ) : null}
            {data.status === 4 && data.chargebackMoney ? (
              <li>
                <p>退还金额:</p>
                <span>{data.chargebackMoney}</span>
              </li>
            ) : null}
            {data.status === 4 && data.chargebackBonus ? (
              <li>
                <p>退还代金券:</p>
                <span>{data.chargebackBonus}</span>
              </li>
            ) : null}
          </ul>
        </div>

        <Modal
          title="退单"
          visible={this.state.modalVisible}
          onOk={this.modalConfirmed}
          onCancel={this.modalCanceled}
          maskClosable={modalClosable}
          className="popupModal"
        >
          <div className="chargeBackModal">
            <span>由于</span>
            <textarea
              value={this.state.modalMessage}
              onChange={this.modalMessageChange}
              onBlur={this.modalBlured}
            />
          </div>
          <p>
            ，此单已做退单处理，你可以前往消费记录中查看，有一笔免费的订单。
          </p>
          {this.state.modalMessageError ? (
            <p className="checkInvalid" style={{ textAlign: 'left' }}>
              消息不能为空！
            </p>
          ) : null}
        </Modal>
      </div>
    )
  }
}

export default OrderInfo
