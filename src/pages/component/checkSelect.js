import React from 'react'
import { obj2arr, isNumber } from '../../util/types'

class CheckSelector extends React.Component {
  constructor(props) {
    super()
  }
  onClick = e => {
    try {
      e.preventDefault()
      let { allOptValue } = this.props
      let v = e.target.getAttribute('data-key')
      if (allOptValue && v === allOptValue) {
        return this.props.onClick(v)
      }
      let key = parseInt(v, 10)
      if (isNumber(key) && this.props.onClick) {
        this.props.onClick(key)
      }
    } catch (e) {
      console.log(e)
    }
  }
  render() {
    let { options, value, noOptionTitle, allOptValue, allOptTitle } = this.props
    let optionArr = Array.isArray(options) ? options : obj2arr(options)
    const optionItems =
      optionArr &&
      optionArr.map((o, i) => (
        <li
          key={o.key}
          data-key={o.key}
          className={value.toString() === o.key.toString() ? 'active' : ''}
        >
          {o.value}
        </li>
      ))

    return (
      <ul className="checkSelect" onClick={this.onClick}>
        {allOptTitle && allOptValue ? (
          <li
            className={value.toString() === allOptValue ? 'active' : ''}
            data-key={allOptValue}
          >
            {allOptTitle}
          </li>
        ) : null}
        {optionItems.length > 0 ? (
          optionItems
        ) : (
          <li>{noOptionTitle || '无'}</li>
        )}
      </ul>
    )
  }
}

export default CheckSelector
