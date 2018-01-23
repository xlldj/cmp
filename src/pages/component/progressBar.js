import React from 'react'

const ProgressBar = props => {
  return (
    <span className="progressBarWrapper">
      <span
        className="progress"
        style={{
          width: `${props.innerWidth}%`,
          backgroundColor: props.bgColor ? props.bgColor : ''
        }}
      />
    </span>
  )
}

export default ProgressBar
