import React from 'react'
const UnitDeviceBlock = props => {
  let { title, className } = props
  return (
    <div className={className ? `infoZone ${className}` : 'infoZone'}>
      <h3 className="header">{title}</h3>
      {props.children}
    </div>
  )
}
export default UnitDeviceBlock
