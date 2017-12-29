import React from 'react'
import {Icon, Input} from 'antd'

/* ----------必须有searchingtext，onenterpress，changesearch属性--------------- */
const SearchInput = (props) => {
  return (
    <Input 
      prefix={(<div ><Icon type='search' /></div>)} 
      placeholder={props.placeholder} 
      className='searchInput' 
      value={props.searchingText.toString()} 
      onPressEnter={props.pressEnter} 
      onChange={props.changeSearch} 
    />
  )
}

export default SearchInput
