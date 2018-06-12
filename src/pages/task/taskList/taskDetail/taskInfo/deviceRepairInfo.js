import React from 'react'
import CONSTANTS from '../../../../../constants'

const DeviceRepairInfo = props => {
  const {
    deviceType,
    location,
    repairCause,
    description,
    images,
    userMobile,
    env
  } = props
  const imgs =
    images &&
    images.map((r, i) => (
      <img
        src={CONSTANTS.FILEADDR + r}
        onClick={() => props.showDetailImgModel(i)}
        onLoad={props.setWH}
        key={i}
        alt=""
      />
    ))
  return (
    <ul className="detailList">
      <li>
        <label>设备类型:</label>
        <span>{CONSTANTS.DEVICETYPE[deviceType]}</span>
      </li>
      <li>
        <label>设备位置:</label>
        <span>{location}</span>
      </li>
      {repairCause ? (
        <li>
          <label>设备问题:</label>
          <span>{repairCause}</span>
        </li>
      ) : null}
      <li className="high">
        <label>报修内容:</label>
        <span>{description}</span>
      </li>
      {imgs && imgs.length > 0 ? (
        <li className="high">
          <label>报修图片:</label>
          <span>{imgs}</span>
        </li>
      ) : null}
      <li>
        <label>{env === 1 ? '报修用户:' : '用户手机:'}</label>
        <span>{userMobile}</span>
      </li>
    </ul>
  )
}

export default DeviceRepairInfo
