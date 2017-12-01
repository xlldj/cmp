import React from 'react'
import CONSTANTS from './constants'
import Select from './select'
const {Option} = Select

class DeviceWithoutAll extends React.Component{
  constructor(props){
    super()
  }
  changeDevice = (v) => {
    this.props.changeDevice(v)
  }
  checkDevice = (v) => {
    if (this.props.checkDevice) {
      this.props.checkDevice(v)
    }
  }
  render(){
    const typeName = CONSTANTS.DEVICETYPE
    let ks = Object.keys(typeName)
    const deviceOpts = ks.map((d, i) => (
      <Option value={d.toString()} key={d}>{typeName[d]}</Option>
    ))
    return (
      <Select 
        disabled={this.props.disabled ? this.props.disabled : false}
        value={this.props.selectedDevice} 
        className={this.props.className ? this.props.className : 'customSelect'}
        width={this.props.width ? this.props.width : ''}
        onChange={this.changeDevice} 
        onBlur={this.checkDevice}
        notFoundTitle='选择设备'
      >
        {deviceOpts}
      </Select>
    )
  }
}

export default DeviceWithoutAll
