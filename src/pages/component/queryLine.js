import React from 'react'

const QueryLine = props => {
  const { labelName } = props
  return (
    <div className="queryLine">
      <div className="block">
        <span>{labelName}:</span>
        {props.children}
      </div>
    </div>
  )
}
export default QueryLine
