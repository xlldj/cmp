import React from 'react'
import Select from './select'
const { Option } = Select

class BuildingSelector extends React.Component {
  constructor(props) {
    super()
  }
  changeBuilding = v => {
    this.props.changeBuilding(v)
  }

  render() {
    const typeName = this.props.sourceData
    let ks = Object.keys(typeName)
    const deviceOpts = ks.map((d, i) => (
      <Option value={d.toString()} key={i}>
        {typeName[d]}
      </Option>
    ))
    return (
      <Select
        disabled={this.props.disabled ? this.props.disabled : false}
        value={this.props.selectBuildingId}
        all
        allTitle="所有楼栋"
        width={this.props.width ? this.props.width : ''}
        className={this.props.className ? this.props.className : 'customSelect'}
        onChange={this.changeBuilding}
      >
        {deviceOpts}
      </Select>
    )
  }
}

export default BuildingSelector
