import React from 'react'
import closeBtn from '../assets/close.png'

const DetailHeader = props => {
  return (
    <div className="detailPanel-header">
      <h3>详情</h3>
      <button className="closeBtn" onClick={props.close}>
        <img src={closeBtn} alt="X" />
      </button>
    </div>
  )
}
export default DetailHeader
