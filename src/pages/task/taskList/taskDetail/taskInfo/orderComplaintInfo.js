import React from 'react'
import CONSTANTS from '../../../../../constants'

const OrderComplaintInfo = props => {
  const { orderType, orderNo, description, images, userMobile } = props
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
        <label>投诉类型:</label>
        <span>{CONSTANTS.COMPLAINTTYPES[orderType]}</span>
      </li>
      <li>
        <label>投诉订单:</label>
        <span>{orderNo}</span>
      </li>
      {imgs.length > 0 ? (
        <li className="high">
          <label>投诉图片:</label>
          <span>{imgs}</span>
        </li>
      ) : null}
      <li className="high">
        <label>投诉内容:</label>
        <span>{description}</span>
      </li>
      <li>
        <label>投诉用户:</label>
        <span>{userMobile}</span>
      </li>
    </ul>
  )
}
export default OrderComplaintInfo
