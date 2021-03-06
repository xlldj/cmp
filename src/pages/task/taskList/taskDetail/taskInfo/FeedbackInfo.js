import React from 'react'
import CONSTANTS from '../../../../../constants'

const FeedbackInfo = props => {
  const { opt, description, images, userMobile } = props
  const imgs =
    images &&
    images.map((r, i) => (
      <img
        src={CONSTANTS.FILEADDR + r}
        onClick={() => props.showDetailImgModel(i)}
        onLoad={setWH}
        key={i}
        alt=""
      />
    ))
  const setWH = (e, value) => {
    let img = e.target
    let w = parseInt(window.getComputedStyle(img).width, 10)
    let h = parseInt(window.getComputedStyle(img).height, 10)
    if (w < h) {
      img.style.width = value ? `${value}px` : '50px'
    } else {
      img.style.height = value ? `${value}px` : '50px'
    }
  }
  return (
    <ul className="detailList">
      <li>
        <label>反馈类型:</label>
        <span>{CONSTANTS.FEEDBACKTYPES[opt]}</span>
      </li>
      {imgs.length > 0 ? (
        <li className="high">
          <label>反馈图片:</label>
          <span>{imgs}</span>
        </li>
      ) : null}
      <li className="high">
        <label>反馈内容:</label>
        <span>{description}</span>
      </li>
      <li>
        <label>反馈用户:</label>
        <span>{userMobile}</span>
      </li>
    </ul>
  )
}

export default FeedbackInfo
