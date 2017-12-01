import React from 'react'
import CONSTANTS from './constants'
import Select from './select'
const {Option} = Select

class OperationSelector extends React.Component{
  constructor(props){
    super()
  }
  changeOpration = (v) => {
    this.props.changeOpration(v)
  }
  render(){
    let ks = Object.keys(CONSTANTS.FUNDTYPE)
    const typeOpts = ks.map((d, i) => (
      <Option value={d.toString()} key={d}>{CONSTANTS.FUNDTYPE[d]}</Option>
    ))
      return (
        <Select 
         all 
         allTitle='全部操作' 
         width={this.props.width ? this.props.width : ''}
         className={this.props.className ? this.props.className : 'customSelect'}
         onChange={this.changeOpration} 
         value={this.props.selectedOpration}
        >
          {typeOpts}
        </Select>
      )
    }
}

export default OperationSelector
