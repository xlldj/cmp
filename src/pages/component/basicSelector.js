import React from 'react'
import Select from './select'
const {Option} = Select

class BasicSelector extends React.Component{
  constructor(props){
    super()
  }
  changeOpt = (v) => {
    this.props.changeOpt(v)
  }
  render(){
    let ks = Object.keys(this.props.staticOpts)
    const optItems = ks.map((d, i) => (
      <Option value={d.toString()} key={d}>{this.props.staticOpts[d]}</Option>
    ))
    return (
      <Select
        value={this.props.selectedOpt}
        className={this.props.className ? this.props.className : ''} 
        disabled={this.props.disabled ? this.props.disabled : false} 
        width={this.props.width ? this.props.width : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeOpt} 
        all
        allTitle={this.props.allTitle}
      >
        {optItems}
      </Select>
    )
  }
}

export default BasicSelector
