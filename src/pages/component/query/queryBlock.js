import React from 'react'

const QueryBlock = props => {
  return (
    <div className="block" style={props.style}>
      {props.children}
    </div>
  )
}
export default QueryBlock
