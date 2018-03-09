import React from 'react'
const HoriInput = props => {
  let { title, value, deno } = props
  const onChange = e => {
    let v = e.target.value
    props.onChange(v)
  }
  return (
    <div className="horiInput">
      <p className="horiInputTitle">{title}</p>
      <input value={value || ''} onChange={onChange} />
      <span>{deno}</span>
    </div>
  )
}
export default HoriInput
