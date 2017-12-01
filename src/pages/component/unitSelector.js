import React from 'react'
import CONSTANTS from './constants'
import Select from './select'
const {Option} = Select

class UnitSelector extends React.Component{
  constructor(props){
    super()
  }
  changeUnit = (v) => {
    this.props.changeUnit(v)
  }
  checkUnit = (v) => {
    if (this.props.checkUnit) {
      this.props.checkUnit(v)
    }
  }
  render(){
    const typeName = CONSTANTS.WATERUNIT
    let ks = Object.keys(typeName)
    const unitOpts = ks.map((d, i) => (
      <Option value={d.toString()} key={d}>{typeName[d]}</Option>
    ))
    return (
      <Select 
        value={this.props.selectedUnit.toString()} 
        width={this.props.width || '50px'} 
        onChange={this.changeUnit}
        onBlur={this.checkUnit}
        className={this.props.className ? this.props.chassName : ''}
        notFoundTitle=''
      >
        {unitOpts}
      </Select>
    )
  }
}

export default UnitSelector
