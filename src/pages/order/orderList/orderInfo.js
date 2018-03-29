import React from 'react'
import { Link } from 'react-router-dom'
import { Popconfirm, Button, Modal, Badge } from 'antd'
import AjaxHandler from '../../../util/ajax'
import CONSTANTS from '../../../constants'
import Time from '../../../util/time'
import Noti from '../../../util/noti'
import LoadingMask from '../../component/loadingMask'
import closeBtn from '../../assets/close.png'
import { checkObject } from '../../../util/checkSame'
const subModule = 'orderList'
const { ORDERSTATUS, NORMAL_DAY_7 } = CONSTANTS

const { DEVICETYPE } = CONSTANTS
const STATUSCLASS = {
  1: 'warning',
  2: 'success',
  4: 'default'
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
      modalMessage: '',
      id: ''
    }
  }
  fetchData = props => {
    let { orderId } = props || this.props
    const body = { id: orderId }
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
    let id = this.props.orderId
    this.setState({
      id
    })
  }

  componentWillReceiveProps(nextProps) {
    try {
      if (checkObject(this.props, nextProps, ['orderId'])) {
        return
      }
      this.fetchData(nextProps)
      this.setState({
        id: nextProps.orderId
      })
    } catch (e) {
      console.log(e)
    }
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
        this.fetchData()
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
  showUserOrderList = e => {
    let mobile = this.state.data.mobile
    this.props.changeOrder(subModule, {
      page: 1,
      day: NORMAL_DAY_7, // set to 7 days default
      status: 'all',
      selectKey: mobile,
      showDetail: false,
      selectedRowIndex: -1,
      selectedDetailId: -1
    })
  }
  render() {
    let { data, modalClosable, detailLoading } = this.state
    const { schoolName, deviceLocation, prepay, orderNo, deviceType } =
      data || {}

    const popTitle = (
      <p className="popTitle">
        退单后该笔订单的预付金额和代金券都将返还给用户，确定要退单么?
      </p>
    )

    return (
      <div className="detailPanelWrapper orderInfo" ref="detailWrapper">
        {detailLoading ? (
          <div className="task-loadWrapper">
            <LoadingMask />
          </div>
        ) : null}

        <div className="detailPanel-header">
          <h3>设备订单详情</h3>
          <button className="closeBtn" onClick={this.close}>
            <img src={closeBtn} alt="X" />
          </button>
        </div>

        <div className="detailPanel-content">
          <h3 className="detailPanel-content-title">
            <span className="rightSeperator">{`${schoolName || ''}`}</span>
            {`${deviceLocation || ''}`}
          </h3>
          <ul className="detailList">
            <li>
              <label>订单号:</label>
              <span>{orderNo}</span>
            </li>
            <li>
              <label>设备类型:</label>
              <span>{DEVICETYPE[deviceType] || '未知'}</span>
            </li>
            <li>
              <label>设备ID:</label>
              <span>{data.macAddress || '暂无'}</span>
            </li>
          </ul>
          <ul className="detailList">
            <li>
              <label>用户手机:</label>
              <span>
                <span className="padR20">{data.mobile || '暂无'}</span>
                <Link
                  to={{
                    pathname: `/user/userInfo/:${data.userId}`,
                    state: { path: 'fromOrder' }
                  }}
                >
                  查看用户详情
                </Link>
              </span>
            </li>
            <li>
              <label>预付金额:</label>
              <span>{prepay || '未知'}</span>
            </li>
            {data.status !== 1 ? (
              <li>
                <label>实际消费:</label>
                <span className={data.bonusAmount ? '' : 'shalowRed'}>{`${
                  data.consume
                }`}</span>
              </li>
            ) : null}
            {data.bonusAmount ? (
              <li>
                <label>代金券抵扣:</label>
                <span>{data.bonusAmount}</span>
              </li>
            ) : null}
            {/* only show 'actualDebit' when used bonus' */}
            {data.bonusAmount ? (
              <li>
                <label>实际扣款:</label>
                <span className="shalowRed">{data.actualDebit}</span>
              </li>
            ) : null}
            <li>
              <label>找零金额:</label>
              {data.status !== 1 ? (
                <span>{data.odd || '未知'}</span>
              ) : (
                <span className="shalowRed">待结账</span>
              )}
            </li>
            {data.status !== 1 ? (
              <li>
                <label>结账方式:</label>
                {data.checkoutByOther ? '代结账' : '自结账'}
              </li>
            ) : null}
          </ul>
          <ul className="detailList ">
            <li>
              <label>开始时间:</label>
              {Time.getTimeStr(data.createTime)}
            </li>
            {data.status !== 1 ? (
              <li>
                <label>结束时间:</label>
                {data.finishTime ? Time.getTimeStr(data.finishTime) : ''}
              </li>
            ) : null}
            <li>
              <label>使用状态:</label>
              <Badge
                text={ORDERSTATUS[data.status]}
                status={STATUSCLASS[data.status]}
              />
            </li>

            {data.status === 4 ? (
              <li>
                <label>退单操作人:</label>
                <span>{data.chargebackExecutor}</span>
              </li>
            ) : null}
            {data.status === 4 ? (
              <li className="high">
                <label>退单原因:</label>
                <span>{data.chargebackReason}</span>
              </li>
            ) : null}
            {data.status === 4 && data.chargebackBonus ? (
              <li>
                <label>退还代金券:</label>
                <span>{data.chargebackBonus}</span>
              </li>
            ) : null}
            {data.status === 4 && data.chargebackMoney ? (
              <li>
                <label>退还金额:</label>
                <span>{data.chargebackMoney}</span>
              </li>
            ) : null}
          </ul>

          {data.status !== 4 ? (
            <Popconfirm title={popTitle} onConfirm={this.openModal}>
              <Button className="rightSeperator">退单</Button>
            </Popconfirm>
          ) : null}
          <Button type="primary" onClick={this.showUserOrderList}>
            查看历史订单
          </Button>
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
