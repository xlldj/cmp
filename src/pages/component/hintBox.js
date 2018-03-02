import React from 'react'

const HintBox = props => {
  const { hide, className, textList, color } = props
  const texts =
    textList &&
    textList.map((content, index) => (
      <li key={index}>
        {content.label ? <label>{content.label}:</label> : null}
        {content.value ? <span>{content.value}</span> : null}
      </li>
    ))
  const colorStyle = color ? { color: color, borderColor: color } : null
  const display = hide ? { display: 'none' } : null
  return (
    <div
      className={className ? `hintBox ${className}` : 'hintBox'}
      style={{ ...colorStyle, ...display }}
    >
      {texts}
    </div>
  )
}

export default HintBox
