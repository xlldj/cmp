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
  checkOpt = (v) => {
    if (this.props.checkOpt) {
      this.props.checkOpt(v)
    }
  }
  render(){
    let ss = Object.keys(this.props.staticOpts)
    const optItems = ss.map((s, i) => (
      <Option value={s.toString()} key={s}>{this.props.staticOpts[s]}</Option>
    ))
    return (
      <Select 
        width={this.props.width ? this.props.width : ''}
        disabled={this.props.disabled?this.props.disabled:false} 
        value={this.props.selectedOpt ? this.props.selectedOpt.toString() : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeOpt} 
        onBlur={this.checkOpt}
        notFoundTitle={this.props.invalidTitle || ''}
      >
        {optItems}
      </Select>
    )
  }
}

export default BasicSelector
