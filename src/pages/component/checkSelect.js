import React from 'react'
import { obj2arr, isNumber } from '../../util/types'

class CheckSelector extends React.Component {
  constructor(props) {
    super()
  }
  onClick = e => {
    try {
      e.preventDefault()
      let key = parseInt(e.target.getAttribute('data-key'), 10)
      if (isNumber(key) && this.props.onClick) {
        this.props.onClick(key)
      }
    } catch (e) {
      console.log(e)
    }
  }
  render() {
    let { options, value } = this.props
    let optionArr = obj2arr(options)
    const optionItems =
      optionArr &&
      optionArr.map((o, i) => (
        <li
          key={i}
          data-key={o.key}
          className={value.toString() === o.key ? 'active' : ''}
        >
          {o.value}
        </li>
      ))

    return (
      <ul className="checkSelect" onClick={this.onClick}>
        {optionItems}
      </ul>
    )
  }
}

export default CheckSelector
