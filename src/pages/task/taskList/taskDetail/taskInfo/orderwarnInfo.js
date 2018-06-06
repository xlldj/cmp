import React from 'react'
import CONSTANTS from '../../../../../constants'
const { ROOMTYPES } = CONSTANTS

const OrderWarnIndo = props => {
  const { deviceType, location, roomType, timeRange, consume } = props
  return (
    <ul className="detailList">
      {deviceType ? (
        <li>
          <label>设备类型:</label>
          <span>{CONSTANTS.DEVICETYPE[deviceType]}</span>
        </li>
      ) : null}
      {location ? (
        <li>
          <label>设备位置:</label>
          <span>{location}</span>
        </li>
      ) : null}

      {roomType ? (
        <li>
          <label>宿舍类型:</label>
          <span>{ROOMTYPES[roomType]}</span>
        </li>
      ) : null}
      {timeRange && consume !== undefined ? (
        <li>
          <label>{timeRange}消费总额:</label>
          <span className="red">{`¥${consume}`}</span>
        </li>
      ) : null}
    </ul>
  )
}

export default OrderWarnIndo
