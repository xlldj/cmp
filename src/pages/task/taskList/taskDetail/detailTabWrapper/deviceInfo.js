import React, { Component } from 'react'
import Time from '../../../../../util/time'
import Format from '../../../../../util/format'
import { mul } from '../../../../../util/numberHandle'
import CONSTANTS from '../../../../../constants'
import { fetchDeviceInfo } from '../../../../../actions'
import { connect } from 'react-redux'
import { checkObject } from '../../../../../util/checkSame'
const { DEVICE_TYPE_WASHER, WASHER_RATE_TYPES, DEVICE_TYPE_BLOWER } = CONSTANTS

class DeviceInfo extends Component {
  componentDidMount() {
    this.fetchData()
  }
  componentWillReceiveProps(nextProps) {
    if (
      !checkObject(this.props, nextProps, [
        'selectedDetailId',
        'deviceType',
        'residenceId',
        'deviceId'
      ])
    ) {
      this.fetchData(nextProps)
    }
  }
  fetchData = props => {
    props = props || this.props
    const { deviceType, residenceId, deviceId } = props
    const { exist } = props
    if (!exist) {
      return
    }
    const body = {}
    if (deviceType === 2) {
      body.id = residenceId
    } else {
      body.id = deviceId
    }
    fetchDeviceInfo(body)
  }
  render() {
    // data是工单的信息， deviceinfo是获取的设备信息
    const { data: deviceInfo, exist, deviceType } = this.props
    let { bindingTime, price, pulse, prepayOption, waterTimeRange, rates } =
      deviceInfo || {}
    let denomination =
      parseInt(deviceType, 10) === DEVICE_TYPE_BLOWER ? '秒' : '脉冲'
    let rateItems =
      deviceType === DEVICE_TYPE_WASHER
        ? rates &&
          rates.map((r, i) => (
            <span key={i}>{`${WASHER_RATE_TYPES[r.pulse]}/${
              r.price ? r.price : ''
            }元`}</span>
          ))
        : pulse &&
          price && <span>{`${mul(price, 100)}元/${pulse}${denomination}`}</span>
    let timeItem =
      waterTimeRange &&
      waterTimeRange.items &&
      waterTimeRange.items.map((r, i) => (
        <span key={i} className="inline padR10">
          {Format.adding0(r.startTime.hour)}:{Format.adding0(
            r.startTime.minute
          )}~{Format.adding0(r.endTime.hour)}:{Format.adding0(r.endTime.minute)}
        </span>
      ))

    return exist ? (
      <ul className="detailList">
        <li>
          <label>绑定时间:</label>
          <span>{bindingTime ? Time.getTimeStr(bindingTime) : ''}</span>
        </li>
        {rates || (pulse && price) ? (
          <li>
            <label>设备费率:</label>
            {rateItems}
          </li>
        ) : null}
        {prepayOption ? (
          <li>
            <label>设备预付:</label>
            <span>{prepayOption.prepay ? `¥${prepayOption.prepay}` : ''}</span>
          </li>
        ) : null}
        {waterTimeRange &&
        waterTimeRange.items &&
        waterTimeRange.items.length > 0 ? (
          <li>
            <label>供水时段:</label>
            <span>{timeItem ? timeItem : ''}</span>
          </li>
        ) : null}
      </ul>
    ) : (
      <ul className="detailList">
        <li>
          <label>绑定时间:</label>
          <span>该设备已解绑</span>
        </li>
      </ul>
    )
  }
}

const mapStateToProps = (state, ownProps) => ({
  data: state.deviceInfoModal.detail
})
export default connect(mapStateToProps, null)(DeviceInfo)
