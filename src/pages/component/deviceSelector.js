import React from 'react'
import CONSTANTS from '../../constants'
import Select from './select'
const { Option } = Select

class DeviceSelector extends React.Component {
  constructor(props) {
    super()
  }
  changeDevice = v => {
    this.props.changeDevice(v)
  }
  render() {
    const typeName = CONSTANTS.DEVICETYPE
    let ks = Object.keys(typeName)
    const deviceOpts = ks.map((d, i) => (
      <Option value={d.toString()} key={i}>
        {typeName[d]}
      </Option>
    ))
    return (
      <Select
        disabled={this.props.disabled ? this.props.disabled : false}
        value={this.props.selectedDevice}
        all
        allTitle="全部设备类型"
        width={this.props.width ? this.props.width : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeDevice}
      >
        {deviceOpts}
      </Select>
    )
  }
}

export default DeviceSelector
