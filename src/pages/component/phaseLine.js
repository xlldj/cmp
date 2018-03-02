import React from 'react'

const PhaseLine = props => {
  const { value, staticPhase, selectors } = props
  const staticOptions =
    staticPhase &&
    staticPhase.map((option, index) => (
      <a
        href=""
        className={value === option.value ? 'active' : ''}
        data-key={option.value || index}
        key={option.value || index}
      >
        {option.text}
      </a>
    ))
  const changePhase = e => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      if (value !== key) {
        props.changePhase(key)
      }
    } catch (e) {
      console.log(e)
    }
  }

  return (
    <div className="phaseLine">
      <div className="block">
        <div className="navLink" onClick={changePhase}>
          {staticOptions}
        </div>
        <div className="select">{selectors}</div>
      </div>
      {props.children ? props.children : null}
    </div>
  )
}
export default PhaseLine
