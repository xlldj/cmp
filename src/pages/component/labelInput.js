import React from 'react'
const LabelInput = props => {
  let { className, title, value, deno } = props
  const onChange = e => {
    let v = e.target.value
    props.onChange(v)
  }
  return (
    <div className={className || ''}>
      <label>{title}:</label>
      <input value={value || ''} onChange={onChange} />
      <span className="seperator">{deno}</span>
    </div>
  )
}
export default LabelInput
