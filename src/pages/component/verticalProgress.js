import React from 'react'

const VerticalProgress = props => {
  // className, is for outer div
  // progress, innerColor is inner div
  const { className, progress, innerColor } = props
  const innerStyle = {
    height: progress ? `${progress}%` : '0%'
  }
  innerColor && (innerStyle.backgroundColor = innerColor)
  return (
    <div className={className ? `${className} verticalRect` : 'verticalRect'}>
      <div style={innerStyle} className="verticalRect-innerDiv" />
    </div>
  )
}

export default VerticalProgress
